// Pure request checks for the sync-device Edge Function: WebCrypto only, no Deno or npm imports,
// so the website's tests can run them in Node. Must match the Android app's WebSyncProtocol.

export const SIGNING_PREFIX = "GV-SYNC-1";
/** Requests older or newer than this are rejected, so a captured request can't be replayed later. */
export const MAX_SKEW_MS = 5 * 60 * 1000;
export const MAX_BODY_BYTES = 256 * 1024;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const TIMESTAMP_RE = /^[0-9]{13}$/;
const NONCE_RE = /^[A-Za-z0-9_-]{22}$/;
const B64_RE = /^[A-Za-z0-9+/]+={0,2}$/;
const B64URL_POINT_RE = /^[A-Za-z0-9_-]{87}$/;

export type SignedHeaders = { deviceId: string; timestamp: string; nonce: string; signature: string };

/** Reads the four auth headers. Null when any is missing or malformed. */
export function readSignedHeaders(get: (name: string) => string | null): SignedHeaders | null {
  const deviceId = (get("x-gv-device") ?? "").toLowerCase();
  const timestamp = get("x-gv-timestamp") ?? "";
  const nonce = get("x-gv-nonce") ?? "";
  const signature = get("x-gv-signature") ?? "";
  if (!UUID_RE.test(deviceId) || !TIMESTAMP_RE.test(timestamp) || !NONCE_RE.test(nonce)) return null;
  if (signature.length > 128 || !B64_RE.test(signature)) return null;
  return { deviceId, timestamp, nonce, signature };
}

/** What the phone signs: binds the device, the time, a one-time nonce and the exact body. */
export function signingMessage(deviceId: string, timestamp: string, nonce: string, bodySha256Hex: string) {
  return `${SIGNING_PREFIX}\n${deviceId}\n${timestamp}\n${nonce}\n${bodySha256Hex}`;
}

export function timestampFresh(timestamp: string, now: number) {
  const t = Number(timestamp);
  return Number.isFinite(t) && Math.abs(now - t) <= MAX_SKEW_MS;
}

export async function sha256Hex(text: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Android Keystore (SHA256withECDSA) emits ASN.1 DER `SEQUENCE { INTEGER r, INTEGER s }`;
 * WebCrypto verifies the fixed-size `r || s` form. Null for anything that isn't a well-formed
 * P-256 signature.
 */
export function derToP1363(der: Uint8Array, size = 32): Uint8Array<ArrayBuffer> | null {
  let i = 0;
  if (der[i++] !== 0x30) return null;
  let seqLen = der[i++];
  if (seqLen & 0x80) {
    if (seqLen !== 0x81) return null;
    seqLen = der[i++];
  }
  if (seqLen !== der.length - i) return null;
  const out = new Uint8Array(size * 2);
  for (let part = 0; part < 2; part++) {
    if (der[i++] !== 0x02) return null;
    const len = der[i++];
    if (len < 1 || len > size + 1 || i + len > der.length) return null;
    let int = der.subarray(i, i + len);
    i += len;
    // Strip the sign byte; a value can be shorter than `size` and is then left-padded.
    while (int.length > 1 && int[0] === 0) int = int.subarray(1);
    if (int.length > size) return null;
    out.set(int, part * size + (size - int.length));
  }
  return i === der.length ? out : null;
}

/** Verifies a DER ECDSA P-256 / SHA-256 signature against a base64 SubjectPublicKeyInfo. */
export async function verifySignature(spkiBase64: string, message: string, signatureBase64: string) {
  try {
    const key = await crypto.subtle.importKey("spki", base64ToBytes(spkiBase64), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    const raw = derToP1363(base64ToBytes(signatureBase64));
    if (!raw) return false;
    return await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, raw, new TextEncoder().encode(message));
  } catch {
    return false;
  }
}

/** Encrypted live updates are a few kilobytes (30 days of six numbers); this leaves room. */
export const MAX_CIPHERTEXT = 64 * 1024;
/** How long a live session may run after the phone joins it. */
export const LIVE_SESSION_MINUTES = 30;

export type StartRequest = {
  op: "start";
  session_id: string;
  browser_public_key: string;
  phone_public_key: string;
  iv: string;
  wrapped_key: string;
};
export type PushRequest = { op: "push"; session_id: string; seq: number; iv: string; ct: string };
export type EndRequest = { op: "end"; session_id: string };
export type UnpairRequest = { op: "unpair" };
export type DeviceRequest = StartRequest | PushRequest | EndRequest | UnpairRequest;

const isIv = (v: unknown): v is string => typeof v === "string" && v.length === 16 && B64_RE.test(v);
const isId = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);

/** Validates the JSON body. Null means the request is rejected as a whole. */
export function parseBody(input: unknown): DeviceRequest | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  switch (o.op) {
    case "start": {
      const { session_id, browser_public_key, phone_public_key, iv, wrapped_key } = o;
      if (!isId(session_id) || !isIv(iv)) return null;
      if (typeof browser_public_key !== "string" || !B64URL_POINT_RE.test(browser_public_key)) return null;
      if (typeof phone_public_key !== "string" || !B64URL_POINT_RE.test(phone_public_key)) return null;
      // A 32-byte key plus its 16-byte tag is 64 base64 characters.
      if (typeof wrapped_key !== "string" || wrapped_key.length !== 64 || !B64_RE.test(wrapped_key)) return null;
      return { op: "start", session_id, browser_public_key, phone_public_key, iv, wrapped_key };
    }
    case "push": {
      const { session_id, seq, iv, ct } = o;
      if (!isId(session_id) || !isIv(iv)) return null;
      if (typeof seq !== "number" || !Number.isInteger(seq) || seq < 1 || seq > 1_000_000) return null;
      if (typeof ct !== "string" || ct.length < 24 || ct.length > MAX_CIPHERTEXT || !B64_RE.test(ct)) return null;
      return { op: "push", session_id, seq, iv, ct };
    }
    case "end":
      return isId(o.session_id) ? { op: "end", session_id: o.session_id } : null;
    case "unpair":
      return { op: "unpair" };
    default:
      return null;
  }
}

/** The private Realtime channel a live session's browser listens on. */
export const liveTopic = (sessionId: string) => `gv-live:${sessionId}`;
