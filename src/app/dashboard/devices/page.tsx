import { getViewer } from "@/lib/session";
import { getDevices } from "@/lib/devices";
import { PageHeader } from "../PageHeader";
import { PairPanel } from "./PairPanel";
import { removeDevice, revokeDevice } from "./actions";
import s from "../dashboard.module.css";

export const metadata = { title: "Devices" };

const KIND_LABEL = { phone: "Phone", wearable: "Wearable", patch: "Patch", bedside: "Bedside" } as const;

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Never";
}

export default async function DevicesPage() {
  const viewer = await getViewer();
  const devices = await getDevices(viewer);

  return (
    <div className={s.page}>
      <PageHeader title="Devices" mode="plain" />
      <div className={s.pairGrid}>
        <section className={s.card} aria-labelledby="pair">
          <span id="pair" className={s.label}>
            Pair a device
          </span>
          <h2 className="h3" style={{ margin: 0 }}>
            Link your Grayvalve phone to this account.
          </h2>
          <PairPanel />
        </section>

        <section className={`aura aura-ocean ${s.card}`} aria-labelledby="how">
          <span id="how" className={s.label} style={{ color: "rgba(243,241,236,0.85)" }}>
            How pairing keeps you safe
          </span>
          <ol className={s.steps} style={{ color: "rgba(243,241,236,0.85)" }}>
            <li>
              <span>
                <strong>Codes are single-use and expire in 10 minutes.</strong> We only store a fingerprint of the code, never the code itself.
              </span>
            </li>
            <li>
              <span>
                <strong>Your phone never gets your password.</strong> It proves it has the code and receives its own device identity.
              </span>
            </li>
            <li>
              <span>
                <strong>Live only, end-to-end encrypted.</strong> Your phone streams the summaries you switch on straight to an open dashboard tab. Nothing about your health is stored here. Journal, private notes and therapy stay on the phone.
              </span>
            </li>
            <li>
              <span>
                <strong>Revoke any time.</strong> A revoked or removed phone can&apos;t send anything again, and it unlinks itself the next time it tries.
              </span>
            </li>
          </ol>
        </section>
      </div>

      <section className={s.card} style={{ marginTop: 16 }} aria-labelledby="paired">
        <div className={s.cardHead}>
          <span id="paired" className={s.label}>
            Paired devices
          </span>
          <span className={s.note}>{devices.length} total</span>
        </div>
        {devices.length === 0 ? (
          <div className={s.empty}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <rect x="7" y="2.5" width="10" height="19" rx="2" />
              <path d="M11 18.5h2" />
            </svg>
            <strong style={{ color: "var(--content)", fontWeight: 500 }}>No devices yet</strong>
            <span style={{ fontSize: 14, maxWidth: 420 }}>
              Open <em>Pair with web</em> under Systems in the Grayvalve app, then show a pairing code here. After pairing you choose what your phone may stream.
            </span>
          </div>
        ) : (
          <ul className={s.deviceList}>
            {devices.map((d) => (
              <li key={d.id}>
                <span className={`aura aura-${d.revoked_at ? "graphite" : d.kind === "phone" ? "ocean" : "signal"} no-frame`} style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>
                    {d.name} <span className={s.note}>· {KIND_LABEL[d.kind]}</span>
                  </div>
                  <div className={s.note}>
                    {d.revoked_at ? `Revoked ${fmt(d.revoked_at)}` : `Paired ${fmt(d.paired_at)} · last seen ${fmt(d.last_seen_at)} · ${d.transport === "wifi" ? "Wi-Fi" : "Bluetooth LE"}`}
                  </div>
                </div>
                {!d.revoked_at ? (
                  <form action={revokeDevice}>
                    <input type="hidden" name="id" value={d.id} />
                    <button className="btn btn-danger btn-sm" type="submit">
                      Revoke
                    </button>
                  </form>
                ) : (
                  <form action={removeDevice}>
                    <input type="hidden" name="id" value={d.id} />
                    <button className="btn btn-ghost btn-sm" type="submit">
                      Remove
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
