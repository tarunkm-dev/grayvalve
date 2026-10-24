// Grayvalve pair-device Edge Function.
//
// Called by the Android app after the user scans the QR code (or types the code) shown in the
// web dashboard. It exchanges a valid, unexpired, single-use pairing code for a device record.
// The app never receives the account's session; it only proves possession of the code.
//
// Deploy:  supabase functions deploy pair-device --no-verify-jwt
// Secrets: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by the platform.

import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const CODE_RE = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
const KINDS = new Set(["phone", "wearable", "patch", "bedside"]);

async function sha256Hex(text: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let input: { code?: string; name?: string; kind?: string; platform?: string; public_key?: string };
  try {
    input = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const code = String(input.code ?? "").toUpperCase().trim();
  const name = String(input.name ?? "").trim().slice(0, 60);
  const kind = KINDS.has(String(input.kind)) ? String(input.kind) : "phone";
  if (!CODE_RE.test(code) || !name) return json({ error: "invalid_request" }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const codeHash = await sha256Hex(code);
  const { data: pairing } = await admin
    .from("device_pairings")
    .select("id, user_id, transport, status, expires_at")
    .eq("code_hash", codeHash)
    .maybeSingle();

  // One generic failure for unknown, used and expired codes.
  if (!pairing || pairing.status !== "pending" || new Date(pairing.expires_at) < new Date()) {
    return json({ error: "code_invalid_or_expired" }, 404);
  }

  // Claim first so a code can't be used twice, even by concurrent requests.
  const { data: claimed } = await admin
    .from("device_pairings")
    .update({ status: "claimed" })
    .eq("id", pairing.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (!claimed) return json({ error: "code_invalid_or_expired" }, 404);

  const { data: device, error } = await admin
    .from("devices")
    .insert({
      user_id: pairing.user_id,
      name,
      kind,
      platform: input.platform ? String(input.platform).slice(0, 40) : null,
      transport: pairing.transport,
      public_key: input.public_key ? String(input.public_key).slice(0, 2048) : null,
      last_seen_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !device) return json({ error: "pairing_failed" }, 500);

  await admin.from("device_pairings").update({ claimed_device_id: device.id }).eq("id", pairing.id);

  return json({ device_id: device.id, transport: pairing.transport });
});
