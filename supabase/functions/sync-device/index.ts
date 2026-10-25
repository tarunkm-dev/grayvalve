// Grayvalve sync-device Edge Function: the paired phone's only way to talk to the web.
//
// Nothing health-related is stored. The phone uses this function to:
//   start   join a live session the person opened in the dashboard (after scanning its QR code
//           and confirming on the phone), handing over a per-session key wrapped to that
//           browser's public key;
//   push    send an end-to-end encrypted update, relayed at once to that browser over a private
//           Realtime Broadcast channel and then forgotten;
//   end     stop a live session;
//   unpair  delete this device from the account (the phone then destroys its key).
// This function never sees health values or the session key in plain form.
//
// Every request is signed by the phone's Android Keystore key (ECDSA P-256, SHA-256) over
// "GV-SYNC-1\n<device id>\n<unix ms>\n<nonce>\n<sha-256 of the body>", and verified against the
// public key stored at pairing. Revoked or removed devices, stale timestamps (±5 minutes) and
// reused nonces are rejected.
//
// Relay: Realtime's REST broadcast endpoint delivers to subscribers without writing to
// realtime.messages (unlike the SQL function realtime.send, which this function never calls).
//
// Deploy:  supabase functions deploy sync-device --no-verify-jwt
// Secrets: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by the platform.

import { createClient } from "npm:@supabase/supabase-js@2.118.0";
import {
  LIVE_SESSION_MINUTES,
  MAX_BODY_BYTES,
  liveTopic,
  parseBody,
  readSignedHeaders,
  sha256Hex,
  signingMessage,
  timestampFresh,
  verifySignature,
} from "./protocol.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

/** One message to one private channel. Delivered to whoever is subscribed right now; not stored. */
async function broadcast(sessionId: string, event: string, payload: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SERVICE_KEY, authorization: `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({ messages: [{ topic: liveTopic(sessionId), event, payload, private: true }] }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const auth = readSignedHeaders((name) => req.headers.get(name));
  if (!auth) return json({ error: "unauthorized" }, 401);
  const now = Date.now();
  if (!timestampFresh(auth.timestamp, now)) return json({ error: "stale_request" }, 401);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "too_large" }, 413);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const { data: device } = await admin
    .from("devices")
    .select("id, user_id, public_key, revoked_at")
    .eq("id", auth.deviceId)
    .maybeSingle();
  // Removed from the account (or never existed): the phone forgets its link when it sees this.
  if (!device) return json({ error: "device_unknown" }, 404);
  if (!device.public_key) return json({ error: "unauthorized" }, 401);

  const message = signingMessage(auth.deviceId, auth.timestamp, auth.nonce, await sha256Hex(raw));
  if (!(await verifySignature(device.public_key, message, auth.signature))) return json({ error: "unauthorized" }, 401);
  if (device.revoked_at) return json({ error: "device_revoked" }, 403);

  // A nonce is accepted once; the primary key makes a concurrent replay fail too.
  const { error: nonceError } = await admin.from("sync_request_nonces").insert({ device_id: device.id, nonce: auth.nonce });
  if (nonceError) return json({ error: nonceError.code === "23505" ? "replayed" : "server_error" }, nonceError.code === "23505" ? 409 : 500);
  await admin.from("sync_request_nonces").delete().lt("created_at", new Date(now - 15 * 60 * 1000).toISOString());

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const body = parseBody(parsed);
  if (!body) return json({ error: "invalid_request" }, 400);

  const seenAt = new Date(now).toISOString();

  if (body.op === "unpair") {
    // Cascades to its live sessions and nonces. Nothing about this phone remains.
    const { error } = await admin.from("devices").delete().eq("id", device.id);
    return error ? json({ error: "server_error" }, 500) : json({ ok: true });
  }

  const { data: session } = await admin
    .from("live_sessions")
    .select("id, user_id, browser_public_key, status, device_id, expires_at")
    .eq("id", body.session_id)
    .maybeSingle();
  const expired = !session || new Date(session.expires_at).getTime() < now;
  if (!session || session.user_id !== device.user_id || expired) {
    if (session && expired) await admin.from("live_sessions").delete().eq("id", session.id);
    return json({ error: "session_ended" }, 410);
  }

  if (body.op === "start") {
    if (session.status !== "pending" || session.browser_public_key !== body.browser_public_key) return json({ error: "session_ended" }, 410);
    const { data: joined } = await admin
      .from("live_sessions")
      .update({ status: "live", device_id: device.id, expires_at: new Date(now + LIVE_SESSION_MINUTES * 60 * 1000).toISOString() })
      .eq("id", session.id)
      .eq("status", "pending")
      .select("id, expires_at")
      .maybeSingle();
    if (!joined) return json({ error: "session_ended" }, 410);
    const sent = await broadcast(session.id, "key", {
      device_id: device.id,
      phone_public_key: body.phone_public_key,
      iv: body.iv,
      wrapped_key: body.wrapped_key,
      expires_at: joined.expires_at,
    });
    await admin.from("devices").update({ last_seen_at: seenAt }).eq("id", device.id);
    return sent ? json({ ok: true, expires_at: joined.expires_at }) : json({ error: "relay_failed" }, 502);
  }

  // push and end need the session this phone joined.
  if (session.status !== "live" || session.device_id !== device.id) return json({ error: "session_ended" }, 410);

  if (body.op === "end") {
    await broadcast(session.id, "end", {});
    await admin.from("live_sessions").delete().eq("id", session.id);
    return json({ ok: true });
  }

  const sent = await broadcast(session.id, "update", { seq: body.seq, iv: body.iv, ct: body.ct });
  await admin.from("devices").update({ last_seen_at: seenAt }).eq("id", device.id);
  return sent ? json({ ok: true, expires_at: session.expires_at }) : json({ error: "relay_failed" }, 502);
});
