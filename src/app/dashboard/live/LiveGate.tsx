"use client";

import type { ReactNode } from "react";
import type { DayMetrics } from "@/lib/sync-crypto";
import { useLive } from "./LiveProvider";
import s from "../dashboard.module.css";

function fmtTime(ms: number) {
  return new Date(ms).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function Lock() {
  return (
    <span className={s.lockIcon} aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 018 0v3" />
      </svg>
    </span>
  );
}

/** The start / QR / waiting card. Shown until the phone's first update arrives. */
function StartCard() {
  const { state, start, stop } = useLive();
  return (
    <section className={`${s.card} ${s.w12}`} aria-labelledby="live-title">
      <div className={s.locked}>
        <Lock />
        <div>
          <div id="live-title" style={{ fontWeight: 500 }}>
            Live from your phone, end-to-end encrypted
          </div>
          <div className={s.note}>
            Nothing about your health is stored on our servers. Your phone sends its summaries straight to this tab while the live view is on, and they&apos;re
            gone when you leave or sign out.
          </div>
        </div>
      </div>

      {state.phase === "waiting" ? (
        <div className="stack gap-16">
          <div className={s.codeBox}>
            <div className={s.qr} dangerouslySetInnerHTML={{ __html: state.qrSvg }} role="img" aria-label="Live view QR code for this tab" />
            <ol className={s.steps}>
              <li>
                <span>Scan this QR code with your paired phone&apos;s camera.</span>
              </li>
              <li>
                <span>Check the website name on your phone, then choose Start.</span>
              </li>
              <li>
                <span>Your summaries appear here and refresh about once a minute, for up to 30 minutes.</span>
              </li>
            </ol>
          </div>
          <div className="row gap-12 wrap">
            <button type="button" className="btn btn-glass btn-sm" onClick={() => stop()}>
              Cancel
            </button>
            <span className={s.note} aria-live="polite">
              Waiting for your phone…
            </span>
          </div>
        </div>
      ) : state.phase === "joined" ? (
        <div className="row gap-12 wrap">
          <span className={s.note} aria-live="polite">
            Your phone joined. Waiting for its first update…
          </span>
          <button type="button" className="btn btn-glass btn-sm" onClick={() => stop()}>
            Stop
          </button>
        </div>
      ) : (
        <div className="stack gap-12">
          {state.phase === "idle" && state.notice && (
            <p className="notice" role="status" style={{ margin: 0 }}>
              {state.notice}
            </p>
          )}
          <div>
            <button type="button" className="btn btn-primary" onClick={() => start()} disabled={state.phase === "starting"}>
              {state.phase === "starting" ? "Preparing…" : "Start live view"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/** Wraps a dashboard page that shows live data: the start card until the phone sends, then the data. */
export function LiveGate({ children }: { children: (days: DayMetrics[]) => ReactNode }) {
  const { state, stop } = useLive();
  if (state.phase !== "live") return <StartCard />;
  return (
    <>
      <section className={`${s.card} ${s.w12}`} aria-labelledby="live-status">
        <div className={s.cardHead}>
          <span id="live-status" className={s.label}>
            {state.quiet ? "Your phone stopped sending" : "Live from your phone · end-to-end encrypted"}
          </span>
          <button type="button" className="btn btn-glass btn-sm" onClick={() => stop("Live view stopped. Nothing from it was kept.")}>
            Stop
          </button>
        </div>
        <span className={s.note} aria-live="polite">
          {state.quiet
            ? `No update since ${fmtTime(state.receivedAt)}. Check that the live view is still on in the Grayvalve app.`
            : `Updated ${fmtTime(state.receivedAt)}${state.endsAt ? ` · ends ${new Date(state.endsAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}` : ""} · held in this tab only`}
        </span>
      </section>
      {children(state.update.days)}
    </>
  );
}
