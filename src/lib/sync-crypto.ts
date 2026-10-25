/*
 * End-to-end encryption for the live view. Runs in the browser (and in Node for tests): WebCrypto
 * only, nothing leaves the page and nothing is stored. Must match the Android app's WebSyncCrypto.
 *
 * - The dashboard makes an ECDH P-256 key pair for one live session and shows its public key as a
 *   QR code. The phone makes a fresh 256-bit session key, derives a shared secret with a one-time
 *   key pair of its own, runs HKDF-SHA256 and wraps the session key with AES-GCM. Only this tab's
 *   private key can unwrap it.
 * - Each update is AES-256-GCM under the session key, bound to the session and device (AAD), and
 *   numbered so a replayed or reordered update is ignored.
 */

export const SYNC_CATEGORIES = ["sleep", "steps", "rhr", "hrv", "mood", "screen"] as const;
export type SyncCategory = (typeof SYNC_CATEGORIES)[number];

/** One day's summary as the phone sent it. A missing value means no reading, or the category isn't shared. */
export type DayMetrics = {
  day: string;
  /** Categories the person shared when this day was synced. */
  cats: SyncCategory[];
  sleepMin: number | null;
  steps: number | null;
  rhrBpm: number | null;
  hrvMs: number | null;
  mood: number | null;
  screenMin: number | null;
};

const enc = new TextEncoder();
const subtle = () => globalThis.crypto.subtle;

export function bytesToBase64(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToBase64Url(bytes: Uint8Array) {
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlToBytes(b64u: string) {
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/");
  return base64ToBytes(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
}

const updateAad = (sessionId: string, deviceId: string) => enc.encode(`gv-live-v1|${sessionId}|${deviceId}`);
const wrapInfo = (deviceId: string) => enc.encode(`gv-live-key-v1|${deviceId}`);
const wrapAad = (sessionId: string, deviceId: string) => enc.encode(`gv-live-key-v1|${sessionId}|${deviceId}`);

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function num(v: unknown, lo: number, hi: number) {
  return typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi ? v : null;
}

/** One live update: which categories are shared and up to 30 days of summaries. */
export type LiveUpdate = { seq: number; sentAt: number; cats: SyncCategory[]; days: DayMetrics[] };

/** Turns decrypted JSON into a [LiveUpdate], dropping anything out of range or not shared. */
export function parseLivePlaintext(json: string): LiveUpdate | null {
  let o: Record<string, unknown>;
  try {
    o = JSON.parse(json);
  } catch {
    return null;
  }
  if (!o || o.v !== 1 || typeof o.seq !== "number" || typeof o.sent_at !== "number" || !Array.isArray(o.days)) return null;
  const cats = (Array.isArray(o.cats) ? o.cats : []).filter((c): c is SyncCategory => SYNC_CATEGORIES.includes(c as SyncCategory));
  const has = (c: SyncCategory) => cats.includes(c);
  const days: DayMetrics[] = [];
  for (const raw of o.days.slice(0, 62)) {
    const d = raw as Record<string, unknown>;
    if (!d || typeof d.day !== "string" || !DAY_RE.test(d.day)) continue;
    days.push({
      day: d.day,
      cats,
      sleepMin: has("sleep") ? num(d.sleep_min, 0, 24 * 60) : null,
      steps: has("steps") ? num(d.steps, 0, 200_000) : null,
      rhrBpm: has("rhr") ? num(d.rhr_bpm, 20, 250) : null,
      hrvMs: has("hrv") ? num(d.hrv_ms, 1, 500) : null,
      mood: has("mood") ? num(d.mood, 1, 5) : null,
      screenMin: has("screen") ? num(d.screen_min, 0, 24 * 60) : null,
    });
  }
  days.sort((a, b) => a.day.localeCompare(b.day));
  return { seq: o.seq, sentAt: o.sent_at, cats, days };
}

/** Decrypts one update. Null when the key is wrong, the update was altered, or its number doesn't match. */
export async function decryptUpdate(key: CryptoKey, sessionId: string, deviceId: string, seq: number, ivB64: string, ctB64: string): Promise<LiveUpdate | null> {
  try {
    const plain = await subtle().decrypt({ name: "AES-GCM", iv: base64ToBytes(ivB64), additionalData: updateAad(sessionId, deviceId) }, key, base64ToBytes(ctB64));
    const update = parseLivePlaintext(new TextDecoder().decode(plain));
    // The number outside (used to drop replays) must be the one sealed inside.
    return update && update.seq === seq ? update : null;
  } catch {
    return null;
  }
}

/** A fresh key pair for one live session. The private key can't be exported from the page. */
export async function newLiveKeyPair() {
  const pair = await subtle().generateKey({ name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
  const raw = new Uint8Array(await subtle().exportKey("raw", pair.publicKey));
  return { privateKey: pair.privateKey, publicKey: bytesToBase64Url(raw) };
}

/** Unwraps the phone's session key as a non-extractable AES-GCM key (decrypt only). */
export async function unwrapSessionKey(
  privateKey: CryptoKey,
  phonePublicKey: string,
  sessionId: string,
  deviceId: string,
  ivB64: string,
  wrappedB64: string,
  extractable = false,
): Promise<CryptoKey> {
  const phone = await subtle().importKey("raw", base64UrlToBytes(phonePublicKey), { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = await subtle().deriveBits({ name: "ECDH", public: phone }, privateKey, 256);
  const hkdf = await subtle().importKey("raw", shared, "HKDF", false, ["deriveKey"]);
  const wrapKey = await subtle().deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: enc.encode(sessionId), info: wrapInfo(deviceId) },
    hkdf,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const raw = new Uint8Array(await subtle().decrypt({ name: "AES-GCM", iv: base64ToBytes(ivB64), additionalData: wrapAad(sessionId, deviceId) }, wrapKey, base64ToBytes(wrappedB64)));
  try {
    if (raw.length !== 32) throw new Error("Unexpected key length");
    return await subtle().importKey("raw", raw, "AES-GCM", extractable, ["decrypt"]);
  } finally {
    raw.fill(0);
  }
}

/** Deep link in the live-session QR code; the app shows who is asking and waits for the person to confirm. */
export function livePayload(sessionId: string, publicKey: string, host: string) {
  return `grayvalve://live?sid=${sessionId}&pk=${publicKey}&host=${encodeURIComponent(host)}`;
}
