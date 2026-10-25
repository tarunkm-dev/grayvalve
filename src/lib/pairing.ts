import { createHash, randomInt } from "node:crypto";

// No 0/O or 1/I, so codes are easy to read aloud and type on a phone. Must match the
// pair-device Edge Function's CODE_RE.
export const PAIRING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const PAIRING_CODE_RE = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
export const PAIRING_TTL_MINUTES = 10;

/** An 8-character code from a CSPRNG, formatted XXXX-XXXX (40 bits). */
export function newPairingCode() {
  let raw = "";
  for (let i = 0; i < 8; i++) raw += PAIRING_ALPHABET[randomInt(PAIRING_ALPHABET.length)];
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

/** What gets stored: the hex SHA-256 of the code, never the code itself. */
export function hashPairingCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

/** Deep link encoded in the QR code and read by the app. */
export function pairingPayload(code: string, transport: "wifi" | "bluetooth", host: string) {
  return `grayvalve://pair?code=${code}&via=${transport}&host=${encodeURIComponent(host)}`;
}
