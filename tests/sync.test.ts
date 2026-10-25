import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  derToP1363,
  parseBody,
  readSignedHeaders,
  sha256Hex,
  signingMessage,
  timestampFresh,
  verifySignature,
} from "../supabase/functions/sync-device/protocol";
import { base64ToBytes, base64UrlToBytes, decryptUpdate, livePayload, newLiveKeyPair, parseLivePlaintext, unwrapSessionKey } from "@/lib/sync-crypto";
import { baseline, lastDays, latest, series, shared } from "@/lib/synced-view";

/*
 * Shared vectors, made once with Node's WebCrypto. The Android app's WebSyncCryptoTest checks the
 * same bytes, so the phone, the Edge Function and the browser agree on every format.
 */
const SIG = {
  spki: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAElzG47uT2U4f0VmB94B8yNJwE8Q9JSfgYcEs+P4LM2nph34zpyBJ0+/kSvFF5b5ql3BivYl6piMY+KO9FzdJ02A==",
  deviceId: "3f0c8a52-6a1e-4b8e-9a43-2f1d7c5e9b10",
  timestamp: "1793000000000",
  nonce: "q2Lr0yVb3oS6m1d9XyZ0Aw",
  body: '{"op":"sync","days":[]}',
  bodyHash: "f2fd85bc389d3fd53ad066262e7c64a3385991242483441d722d0f217e38084d",
  sig: "MEQCIGUN5EkOcRpYsmuh1AJBll9RQF8JxarKnRlnVIhJQhKpAiAadVBOGyRZzWoY3iu0Y+5GMbVnmF9Fl+yTYm9oashmtA==",
};
const LIVE = {
  sessionKey: "BqhhNPedDN8Sw9MdfXvE0BVMJahpgFrYGBuUr3rU3PE=",
  iv: "+lCiW2XjWjlaOweD",
  ct: "q6Bko9yH9eWX/WFf/Xg7CRtTpIMJObEPW2KqoBrC4bQoiTyNT3II+akuFze2LNgf8LLIuWfCZvmpEfLRWjgKVy5swmMTdO7GVNaANrBTkxNnWDtrTQfVJ+ThzsouPEDpDm7aqhnzKkNkFwVUZ4essnCvTSdhKuCx4dHJbHo0LUgQtpw+/vnp/b2XuP4h5cxRKyvbRMbpZhR7d18JaCBvGmvJxAuajU/MEOyJaZQol0v4GpYLTD/nZgJ94VBzPRpdHsbZxLm2BD9GpraRpocOhprSOvCF2+RNu+VX2g==",
};
const WRAP = {
  rid: "a7d5e2c1-0b9f-4c3e-8d21-6f4b3a2e1c09",
  browserPkcs8: "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgfNRqjxrH0AYMXat6wmGniWEiZl29y0mK+uNbWFRLl5ehRANCAATeWDqsAP0u9KVh/aGg9BKBl281PMvmRQGPDjOzDKkDR7EAnEd2EoRNendxlvn6B38Ckquot0X1yorwTY2IKfzN",
  browserPub: "BN5YOqwA_S70pWH9oaD0EoGXbzU8y-ZFAY8OM7MMqQNHsQCcR3YShE16d3GW-foHfwKSq6i3RfXKivBNjYgp_M0",
  phonePub: "BN45fDOcwcEd18K66sMZaigAe95zY4kunW5jJ_KmsAE1JhggNh34CH4RAnDwj4PB6s8-DLFAmpu8cs6qGz3EL7E",
  iv: "qhmI80RG+BXYcP9E",
  wrapped: "ChHVTy0qG+JyW3GZDJJR2luc+cmjR2rEggJL57yTfbDIm1rVGSNDsIL5l04D7lNG",
};

const sessionKey = () => crypto.subtle.importKey("raw", base64ToBytes(LIVE.sessionKey), "AES-GCM", false, ["decrypt"]);

describe("sync-device request signing", () => {
  const message = signingMessage(SIG.deviceId, SIG.timestamp, SIG.nonce, SIG.bodyHash);

  it("hashes the exact body", async () => {
    expect(await sha256Hex(SIG.body)).toBe(SIG.bodyHash);
  });

  it("accepts a DER signature from the phone's key", async () => {
    expect(await verifySignature(SIG.spki, message, SIG.sig)).toBe(true);
  });

  it("rejects a changed body, device, time or nonce", async () => {
    const otherBody = await sha256Hex('{"op":"sync","days":[],"reset":true}');
    expect(await verifySignature(SIG.spki, signingMessage(SIG.deviceId, SIG.timestamp, SIG.nonce, otherBody), SIG.sig)).toBe(false);
    expect(await verifySignature(SIG.spki, signingMessage("00000000-0000-4000-8000-000000000000", SIG.timestamp, SIG.nonce, SIG.bodyHash), SIG.sig)).toBe(false);
    expect(await verifySignature(SIG.spki, signingMessage(SIG.deviceId, "1793000000001", SIG.nonce, SIG.bodyHash), SIG.sig)).toBe(false);
    expect(await verifySignature(SIG.spki, signingMessage(SIG.deviceId, SIG.timestamp, "AAAAAAAAAAAAAAAAAAAAAA", SIG.bodyHash), SIG.sig)).toBe(false);
  });

  it("rejects another key and malformed signatures without throwing", async () => {
    const other = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    const spki = Buffer.from(await crypto.subtle.exportKey("spki", other.publicKey)).toString("base64");
    expect(await verifySignature(spki, message, SIG.sig)).toBe(false);
    expect(await verifySignature(SIG.spki, message, "AAAA")).toBe(false);
    expect(await verifySignature("not-a-key", message, SIG.sig)).toBe(false);
  });

  it("converts DER to r||s, including short and sign-padded integers", () => {
    const raw = derToP1363(base64ToBytes(SIG.sig))!;
    expect(raw.length).toBe(64);
    // r = 0x01 (one byte), s = 0x0080 (sign-padded) → left-padded to 32 bytes each.
    const der = new Uint8Array([0x30, 0x07, 0x02, 0x01, 0x01, 0x02, 0x02, 0x00, 0x80]);
    const out = derToP1363(der)!;
    expect(out[31]).toBe(1);
    expect(out[63]).toBe(0x80);
    expect(out.slice(0, 31).every((b) => b === 0)).toBe(true);
    expect(derToP1363(new Uint8Array([0x31, 0x00]))).toBeNull();
    expect(derToP1363(new Uint8Array([0x30, 0x07, 0x02, 0x01, 0x01, 0x02, 0x02, 0x00]))).toBeNull();
  });

  it("only accepts fresh timestamps", () => {
    const now = Number(SIG.timestamp);
    expect(timestampFresh(SIG.timestamp, now + 60_000)).toBe(true);
    expect(timestampFresh(SIG.timestamp, now + 6 * 60_000)).toBe(false);
    expect(timestampFresh(SIG.timestamp, now - 6 * 60_000)).toBe(false);
  });

  it("reads only well-formed auth headers", () => {
    const h = { "x-gv-device": SIG.deviceId, "x-gv-timestamp": SIG.timestamp, "x-gv-nonce": SIG.nonce, "x-gv-signature": SIG.sig } as Record<string, string>;
    expect(readSignedHeaders((n) => h[n] ?? null)).toEqual({ deviceId: SIG.deviceId, timestamp: SIG.timestamp, nonce: SIG.nonce, signature: SIG.sig });
    expect(readSignedHeaders((n) => ({ ...h, "x-gv-nonce": "short" })[n] ?? null)).toBeNull();
    expect(readSignedHeaders((n) => ({ ...h, "x-gv-device": "1; drop table" })[n] ?? null)).toBeNull();
    expect(readSignedHeaders(() => null)).toBeNull();
  });
});

describe("sync-device body validation", () => {
  const start = { op: "start", session_id: WRAP.rid, browser_public_key: WRAP.browserPub, phone_public_key: WRAP.phonePub, iv: WRAP.iv, wrapped_key: WRAP.wrapped };
  const push = { op: "push", session_id: WRAP.rid, seq: 1, iv: LIVE.iv, ct: LIVE.ct };

  it("accepts start, push, end and unpair", () => {
    expect(parseBody(start)).toEqual(start);
    expect(parseBody(push)).toEqual(push);
    expect(parseBody({ op: "end", session_id: WRAP.rid })).toEqual({ op: "end", session_id: WRAP.rid });
    expect(parseBody({ op: "unpair" })).toEqual({ op: "unpair" });
  });

  it("rejects plaintext, bad numbers, malformed keys and unknown ops", () => {
    expect(parseBody({ ...push, ct: '{"steps":6800}' })).toBeNull();
    expect(parseBody({ ...push, seq: 0 })).toBeNull();
    expect(parseBody({ ...push, seq: 1.5 })).toBeNull();
    expect(parseBody({ ...push, iv: "short" })).toBeNull();
    expect(parseBody({ ...push, session_id: "1; drop table" })).toBeNull();
    expect(parseBody({ ...start, wrapped_key: "AAAA" })).toBeNull();
    expect(parseBody({ ...start, browser_public_key: WRAP.browserPub.slice(1) })).toBeNull();
    expect(parseBody({ op: "sync", days: [] })).toBeNull();
    expect(parseBody(null)).toBeNull();
  });
});

describe("end-to-end encrypted live updates", () => {
  const all = ["sleep", "steps", "rhr", "hrv", "mood", "screen"];

  it("decrypts the phone's update with the session key", async () => {
    const u = await decryptUpdate(await sessionKey(), WRAP.rid, SIG.deviceId, 1, LIVE.iv, LIVE.ct);
    expect(u).toEqual({
      seq: 1,
      sentAt: 1793000000000,
      cats: all,
      days: [{ day: "2026-10-24", cats: all, sleepMin: 410, steps: 6800, rhrBpm: 58, hrvMs: 62.5, mood: 4, screenMin: 215 }],
    });
  });

  it("refuses an update for another session or device, or relabelled with another number", async () => {
    const other = "00000000-0000-4000-8000-000000000000";
    expect(await decryptUpdate(await sessionKey(), other, SIG.deviceId, 1, LIVE.iv, LIVE.ct)).toBeNull();
    expect(await decryptUpdate(await sessionKey(), WRAP.rid, other, 1, LIVE.iv, LIVE.ct)).toBeNull();
    expect(await decryptUpdate(await sessionKey(), WRAP.rid, SIG.deviceId, 7, LIVE.iv, LIVE.ct)).toBeNull();
  });

  it("ignores values for categories the phone didn't share, and out-of-range values", () => {
    const u = parseLivePlaintext('{"v":1,"seq":2,"sent_at":1,"cats":["steps"],"days":[{"day":"2026-10-24","steps":900,"mood":5,"sleep_min":99999},{"day":"bad"}]}')!;
    expect(u.days).toHaveLength(1);
    expect(u.days[0].steps).toBe(900);
    expect(u.days[0].mood).toBeNull();
    expect(u.days[0].sleepMin).toBeNull();
    expect(parseLivePlaintext('{"v":1,"seq":2,"sent_at":1,"cats":["sleep"],"days":[{"day":"2026-10-24","sleep_min":99999}]}')!.days[0].sleepMin).toBeNull();
    expect(parseLivePlaintext('{"v":2,"seq":1,"sent_at":1,"days":[]}')).toBeNull();
  });

  it("unwraps the session key the phone sent to this tab", async () => {
    const browser = await crypto.subtle.importKey("pkcs8", base64ToBytes(WRAP.browserPkcs8), { name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
    const key = await unwrapSessionKey(browser, WRAP.phonePub, WRAP.rid, SIG.deviceId, WRAP.iv, WRAP.wrapped, true);
    expect(Buffer.from(await crypto.subtle.exportKey("raw", key)).toString("base64")).toBe(LIVE.sessionKey);
    const kept = await unwrapSessionKey(browser, WRAP.phonePub, WRAP.rid, SIG.deviceId, WRAP.iv, WRAP.wrapped);
    expect(kept.extractable).toBe(false);
    expect((await decryptUpdate(kept, WRAP.rid, SIG.deviceId, 1, LIVE.iv, LIVE.ct))?.days[0].steps).toBe(6800);
  });

  it("can't unwrap with another tab's key or for another session", async () => {
    const other = await newLiveKeyPair();
    await expect(unwrapSessionKey(other.privateKey, WRAP.phonePub, WRAP.rid, SIG.deviceId, WRAP.iv, WRAP.wrapped)).rejects.toThrow();
    const browser = await crypto.subtle.importKey("pkcs8", base64ToBytes(WRAP.browserPkcs8), { name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
    await expect(unwrapSessionKey(browser, WRAP.phonePub, "00000000-0000-4000-8000-000000000000", SIG.deviceId, WRAP.iv, WRAP.wrapped)).rejects.toThrow();
  });

  it("puts a 65-byte public key in the live link", async () => {
    const pair = await newLiveKeyPair();
    expect(base64UrlToBytes(pair.publicKey).length).toBe(65);
    expect(livePayload(WRAP.rid, pair.publicKey, "grayvalve.vercel.app")).toBe(`grayvalve://live?sid=${WRAP.rid}&pk=${pair.publicKey}&host=grayvalve.vercel.app`);
  });
});

describe("nothing is stored", () => {
  it("the migration creates no table for health values", () => {
    const sql = readFileSync("supabase/migrations/20261025120000_live_sessions.sql", "utf8").toLowerCase();
    const tables = [...sql.matchAll(/create table public\.(\w+)/g)].map((m) => m[1]);
    expect(tables).toEqual(["live_sessions", "sync_request_nonces"]);
    for (const column of ["sleep", "steps", "mood", "hrv", "ciphertext", "wrapped_key"]) expect(sql).not.toMatch(new RegExp(`^\\s+${column}\\b`, "m"));
  });

  it("the function relays by REST broadcast and never calls realtime.send", () => {
    const fn = readFileSync("supabase/functions/sync-device/index.ts", "utf8");
    expect(fn).toContain("/realtime/v1/api/broadcast");
    expect(fn).not.toMatch(/realtime\.send\(|from\("daily_metrics"\)|\.upsert\(/);
  });

  it("the browser keeps nothing in storage", () => {
    for (const f of ["src/app/dashboard/live/LiveProvider.tsx", "src/app/dashboard/live/LiveGate.tsx", "src/lib/sync-crypto.ts"]) {
      expect(readFileSync(f, "utf8")).not.toMatch(/localStorage|sessionStorage|indexedDB/);
    }
  });
});

describe("dashboard series", () => {
  const d = (day: string, steps: number | null, cats = ["steps"] as const) => ({ day, cats: [...cats], sleepMin: null, steps, rhrBpm: null, hrvMs: null, mood: null, screenMin: null });

  it("lines days up with gaps for missing ones", () => {
    const window = lastDays(new Date(2026, 9, 25), 3);
    expect(window).toEqual(["2026-10-23", "2026-10-24", "2026-10-25"]);
    expect(series([d("2026-10-23", 100), d("2026-10-25", 300)], window, "steps")).toEqual([100, null, 300]);
    expect(latest([d("2026-10-23", 100), d("2026-10-24", null)], "steps")).toEqual({ day: "2026-10-23", value: 100 });
  });

  it("needs five readings for a usual range, and tells unshared from missing", () => {
    expect(baseline([60, 61, null, 62])).toBeNull();
    expect(baseline([50, 60, 61, 62, 63, 64, 90])).toEqual({ low: 60, high: 64 });
    expect(shared([d("2026-10-24", null)], "steps")).toBe(true);
    expect(shared([d("2026-10-24", null)], "mood")).toBe(false);
  });
});
