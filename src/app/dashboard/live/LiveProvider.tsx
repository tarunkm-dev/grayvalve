"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { decryptUpdate, livePayload, newLiveKeyPair, unwrapSessionKey, type LiveUpdate } from "@/lib/sync-crypto";

/*
 * The live view. Everything here lives in this tab's memory: the session's private key, the
 * session key the phone sends, and the decrypted summaries. Nothing is written to storage, and
 * the database holds no health data. Leaving the dashboard, signing out or pressing Stop ends the
 * session; the phone stops sending when it sees that.
 */

/** No update for this long means the phone stopped (it sends about once a minute). */
const QUIET_MS = 3 * 60 * 1000;

export type LiveState =
  | { phase: "idle"; notice?: string }
  | { phase: "starting" }
  /** QR code up, waiting for the phone to scan and confirm. */
  | { phase: "waiting"; qrSvg: string; expiresAt: string }
  /** The phone joined; waiting for its first update. */
  | { phase: "joined"; deviceId: string; endsAt: string }
  | { phase: "live"; deviceId: string; endsAt: string; update: LiveUpdate; receivedAt: number; quiet: boolean };

type Live = { state: LiveState; start: () => Promise<void>; stop: (notice?: string) => Promise<void>; enabled: boolean };

const LiveContext = createContext<Live>({ state: { phase: "idle" }, start: async () => {}, stop: async () => {}, enabled: false });

export const useLive = () => useContext(LiveContext);

type Session = { id: string; privateKey: CryptoKey; publicKey: string; key: CryptoKey | null; deviceId: string | null; lastSeq: number; channel: RealtimeChannel };

export function LiveProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [state, setState] = useState<LiveState>({ phase: "idle" });
  const session = useRef<Session | null>(null);

  const stop = useCallback(async (notice?: string) => {
    const s = session.current;
    session.current = null;
    setState({ phase: "idle", notice });
    if (!s) return;
    const supabase = createClient();
    await supabase.removeChannel(s.channel);
    // Deleting the row ends the session server-side; the phone's next update is refused.
    await supabase.from("live_sessions").delete().eq("id", s.id);
  }, []);

  const start = useCallback(async () => {
    if (!enabled || session.current) return;
    setState({ phase: "starting" });
    try {
      const supabase = createClient();
      const pair = await newLiveKeyPair();
      const { data, error } = await supabase.from("live_sessions").insert({ browser_public_key: pair.publicKey }).select("id, expires_at").single();
      if (error || !data) throw new Error("insert");
      // Private channels are authorised by RLS on realtime.messages with this user's token.
      await supabase.realtime.setAuth();
      const channel = supabase.channel(`gv-live:${data.id}`, { config: { private: true } });
      const s: Session = { id: data.id, privateKey: pair.privateKey, publicKey: pair.publicKey, key: null, deviceId: null, lastSeq: 0, channel };
      session.current = s;

      channel
        .on("broadcast", { event: "key" }, async ({ payload }) => {
          if (session.current !== s || s.key) return;
          try {
            s.key = await unwrapSessionKey(s.privateKey, payload.phone_public_key, s.id, payload.device_id, payload.iv, payload.wrapped_key);
            s.deviceId = payload.device_id;
            setState({ phase: "joined", deviceId: payload.device_id, endsAt: payload.expires_at });
          } catch {
            void stop("Your phone answered, but its key couldn't be opened in this tab. Start again.");
          }
        })
        .on("broadcast", { event: "update" }, async ({ payload }) => {
          if (session.current !== s || !s.key || !s.deviceId || typeof payload.seq !== "number" || payload.seq <= s.lastSeq) return;
          const update = await decryptUpdate(s.key, s.id, s.deviceId, payload.seq, payload.iv, payload.ct);
          if (!update || session.current !== s || update.seq <= s.lastSeq) return;
          s.lastSeq = update.seq;
          setState((prev) => ({
            phase: "live",
            deviceId: s.deviceId!,
            endsAt: prev.phase === "joined" || prev.phase === "live" ? prev.endsAt : "",
            update,
            receivedAt: Date.now(),
            quiet: false,
          }));
        })
        .on("broadcast", { event: "end" }, () => {
          if (session.current === s) void stop("Your phone ended the live view.");
        })
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            if (session.current === s) void stop("Couldn't open the live channel. Check your connection and try again.");
          }
        });

      const qrSvg = await QRCode.toString(livePayload(data.id, pair.publicKey, window.location.host), {
        type: "svg",
        margin: 0,
        errorCorrectionLevel: "M",
        color: { dark: "#000000", light: "#ffffff" },
      });
      if (session.current === s) setState({ phase: "waiting", qrSvg, expiresAt: data.expires_at });
    } catch {
      await stop("Couldn't start a live view. Check your connection and try again.");
    }
  }, [enabled, stop]);

  // Timers: the QR code expires, the session reaches its end, or the phone goes quiet.
  const current = useRef(state);
  useEffect(() => {
    current.current = state;
  }, [state]);
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      const prev = current.current;
      if (prev.phase === "waiting" && new Date(prev.expiresAt).getTime() < now) {
        void stop("That QR code expired. Start again when your phone is ready.");
      } else if ((prev.phase === "joined" || prev.phase === "live") && prev.endsAt && new Date(prev.endsAt).getTime() < now) {
        void stop("The live view ended after 30 minutes. Start again any time.");
      } else if (prev.phase === "live" && !prev.quiet && now - prev.receivedAt > QUIET_MS) {
        setState({ ...prev, quiet: true });
      }
    }, 5000);
    return () => clearInterval(t);
  }, [stop]);

  // Leaving the dashboard (or closing the tab) ends the session and drops the keys from memory.
  useEffect(() => {
    const end = () => void stop();
    window.addEventListener("pagehide", end);
    return () => {
      window.removeEventListener("pagehide", end);
      void stop();
    };
  }, [stop]);

  return <LiveContext.Provider value={{ state, start, stop, enabled }}>{children}</LiveContext.Provider>;
}
