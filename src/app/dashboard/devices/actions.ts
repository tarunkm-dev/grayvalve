"use server";

import { createHash, randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/session";
import { site } from "@/lib/site";

// No 0/O or 1/I, so codes are easy to read aloud and type on a phone.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TTL_MINUTES = 10;

export type PairingResult =
  | { ok: true; code: string; qrSvg: string; expiresAt: string; transport: "wifi" | "bluetooth"; preview: boolean; id: string | null }
  | { ok: false; error: string };

function newCode() {
  let raw = "";
  for (let i = 0; i < 8; i++) raw += ALPHABET[randomInt(ALPHABET.length)];
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

/**
 * Opens a single-use pairing code for the signed-in user. Only the SHA-256 of the code is stored;
 * the app exchanges the code for a device record through the pair-device Edge Function.
 */
export async function createPairing(transport: "wifi" | "bluetooth"): Promise<PairingResult> {
  const viewer = await getViewer();
  if (transport !== "wifi" && transport !== "bluetooth") return { ok: false, error: "Choose how the device connects." };

  const code = newCode();
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString();
  const host = new URL(site.url).host;
  const payload = `grayvalve://pair?code=${code}&via=${transport}&host=${encodeURIComponent(host)}`;
  const qrSvg = await QRCode.toString(payload, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });

  if (viewer.preview) return { ok: true, code, qrSvg, expiresAt, transport, preview: true, id: null };

  const supabase = await createClient();
  // Close any earlier code that is still open, so only one is valid at a time.
  await supabase.from("device_pairings").delete().eq("user_id", viewer.id).eq("status", "pending");

  const { data, error } = await supabase
    .from("device_pairings")
    .insert({
      user_id: viewer.id,
      code_hash: createHash("sha256").update(code).digest("hex"),
      transport,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: "We couldn't create a pairing code. Try again." };
  return { ok: true, code, qrSvg, expiresAt, transport, preview: false, id: data.id };
}

export async function cancelPairing(id: string) {
  const viewer = await getViewer();
  if (viewer.preview || !id) return;
  const supabase = await createClient();
  await supabase.from("device_pairings").delete().eq("id", id);
}

/** Has the open code been claimed by the app yet? Used to refresh the page when pairing completes. */
export async function pairingStatus(id: string): Promise<"pending" | "claimed" | "gone"> {
  const viewer = await getViewer();
  if (viewer.preview || !id) return "pending";
  const supabase = await createClient();
  const { data } = await supabase.from("device_pairings").select("status").eq("id", id).maybeSingle();
  if (!data) return "gone";
  if (data.status === "claimed") revalidatePath("/dashboard/devices");
  return data.status === "claimed" ? "claimed" : "pending";
}

export async function revokeDevice(form: FormData) {
  const viewer = await getViewer();
  const id = form.get("id");
  if (viewer.preview || typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("devices").update({ revoked_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/dashboard/devices");
}

export async function removeDevice(form: FormData) {
  const viewer = await getViewer();
  const id = form.get("id");
  if (viewer.preview || typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("devices").delete().eq("id", id);
  revalidatePath("/dashboard/devices");
}
