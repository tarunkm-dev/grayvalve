import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PAIRING_ALPHABET, PAIRING_CODE_RE, hashPairingCode, newPairingCode, pairingPayload } from "@/lib/pairing";

describe("pairing codes", () => {
  it("are XXXX-XXXX from the unambiguous alphabet", () => {
    for (let i = 0; i < 500; i++) {
      const code = newPairingCode();
      expect(code).toMatch(PAIRING_CODE_RE);
      expect(code).not.toMatch(/[01IO]/);
    }
  });

  it("are not repeated in practice", () => {
    const seen = new Set(Array.from({ length: 2000 }, newPairingCode));
    expect(seen.size).toBe(2000);
  });

  it("use only characters the Edge Function accepts", () => {
    const fn = readFileSync("supabase/functions/pair-device/index.ts", "utf8");
    expect(fn).toContain(String(PAIRING_CODE_RE));
    for (const ch of PAIRING_ALPHABET) expect(`${ch}${ch}${ch}${ch}-2222`).toMatch(PAIRING_CODE_RE);
  });

  it("store a SHA-256 hex fingerprint, never the code", () => {
    const h = hashPairingCode("ABCD-2345");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).toBe(hashPairingCode("ABCD-2345"));
    expect(h).not.toContain("ABCD");
  });

  it("encode the transport and host in the QR deep link", () => {
    expect(pairingPayload("ABCD-2345", "bluetooth", "grayvalve.vercel.app")).toBe(
      "grayvalve://pair?code=ABCD-2345&via=bluetooth&host=grayvalve.vercel.app",
    );
  });
});
