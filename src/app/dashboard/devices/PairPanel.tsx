"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelPairing, createPairing, pairingStatus, type PairingResult } from "./actions";
import s from "../dashboard.module.css";

type Open = Extract<PairingResult, { ok: true }>;

function useCountdown(until: string | null) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!until) return;
    const tick = () => setLeft(Math.max(0, Math.round((new Date(until).getTime() - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [until]);
  return left;
}

export function PairPanel() {
  const router = useRouter();
  const [transport, setTransport] = useState<"wifi" | "bluetooth">("wifi");
  const [open, setOpen] = useState<Open | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [pending, start] = useTransition();
  const left = useCountdown(open?.expiresAt ?? null);
  const expired = open !== null && left === 0;

  // While a code is open, check every few seconds whether the app has claimed it.
  useEffect(() => {
    if (!open?.id || expired || claimed) return;
    const t = setInterval(async () => {
      const status = await pairingStatus(open.id!);
      if (status === "claimed") {
        setClaimed(true);
        router.refresh();
      }
    }, 4000);
    return () => clearInterval(t);
  }, [open, expired, claimed, router]);

  const generate = () =>
    start(async () => {
      setError(null);
      setClaimed(false);
      const res = await createPairing(transport);
      if (res.ok) setOpen(res);
      else setError(res.error);
    });

  const cancel = () =>
    start(async () => {
      if (open?.id) await cancelPairing(open.id);
      setOpen(null);
    });

  if (claimed) {
    return (
      <div className="notice ok" role="status">
        Paired. Your device now appears in the list below.
      </div>
    );
  }

  if (open && !expired) {
    const mm = String(Math.floor(left / 60)).padStart(2, "0");
    const ss = String(left % 60).padStart(2, "0");
    return (
      <div className="stack gap-16">
        <div className={s.codeBox}>
          <div className={s.qr} dangerouslySetInnerHTML={{ __html: open.qrSvg }} role="img" aria-label={`Pairing QR code for ${open.code}`} />
          <div className="stack gap-8">
            <span className={s.label}>Pairing code</span>
            <span className={s.code}>{open.code}</span>
            <span className={s.note} aria-live="polite">
              Expires in {mm}:{ss} · single use · via {open.transport === "wifi" ? "Wi-Fi / internet" : "Bluetooth LE"}
            </span>
            {open.preview && <span className="chip concept">Preview: this code isn&apos;t saved</span>}
          </div>
        </div>
        <ol className={s.steps}>
          <li>
            <span>
              On your phone, open <strong>Grayvalve › Spaces › Systems</strong> and tap <strong>Pair with web</strong>.
            </span>
          </li>
          <li>
            <span>Scan this QR code, or type the code.</span>
          </li>
          <li>
            <span>Check the account name shown on your phone, then approve.</span>
          </li>
        </ol>
        <div className="row gap-12 wrap">
          <button type="button" className="btn btn-glass btn-sm" onClick={cancel} disabled={pending}>
            Cancel code
          </button>
          <span className={s.note}>Waiting for your phone…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="stack gap-16">
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className={s.label} style={{ marginBottom: 12 }}>
          How will it connect?
        </legend>
        <div className={s.transport}>
          <label className={s.transportOpt}>
            <input type="radio" name="transport" value="wifi" checked={transport === "wifi"} onChange={() => setTransport("wifi")} />
            <strong>Wi-Fi / internet</strong>
            <span>Your phone syncs to this dashboard over an encrypted connection, from anywhere.</span>
          </label>
          <label className={s.transportOpt}>
            <input type="radio" name="transport" value="bluetooth" checked={transport === "bluetooth"} onChange={() => setTransport("bluetooth")} />
            <strong>Bluetooth LE</strong>
            <span>For Grayvalve wearables: they hand data to your phone nearby, which then syncs here.</span>
          </label>
        </div>
      </fieldset>
      {expired && <p className="notice">That code expired. Make a new one when your phone is ready.</p>}
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      <div>
        <button type="button" className="btn btn-primary" onClick={generate} disabled={pending}>
          {pending ? "Creating code…" : "Show pairing code"}
        </button>
      </div>
    </div>
  );
}
