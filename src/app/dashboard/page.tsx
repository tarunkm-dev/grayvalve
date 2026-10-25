import Link from "next/link";
import Image from "next/image";
import { getViewer } from "@/lib/session";
import { getDevices } from "@/lib/devices";
import { sample, dayInitials } from "@/lib/sample-data";
import { DotMatrix } from "@/components/DotMatrix";
import { ArcGauge, Bars, HeatStrip, PulseRings, RangeBand, SleepStages, TickMeter, WaveLine } from "@/components/charts";
import { PageHeader } from "./PageHeader";
import { SyncedOverview } from "./synced/SyncedViews";
import s from "./dashboard.module.css";

export default async function Overview() {
  const viewer = await getViewer();
  // Signed in: the person's own summaries, live from their phone and decrypted in this tab only.
  if (!viewer.preview) {
    return (
      <div className={s.page}>
        <PageHeader name={viewer.name} sample={false} />
        <div className={s.grid}>
          <SyncedOverview />
        </div>
      </div>
    );
  }
  // Local preview (no Supabase keys): sample data, labelled as such.
  const devices = await getDevices(viewer);
  const paired = devices.filter((d) => !d.revoked_at);
  const r = sample.readiness;

  return (
    <div className={s.page}>
      <PageHeader name={viewer.name} />

      <div className={s.grid}>
        {/* Decision surface: the one useful action, first. */}
        <section className={`aura aura-ember ${s.hero} ${s.w7}`} aria-labelledby="next-move">
          <div className={s.cardHead}>
            <span className={s.label} style={{ color: "rgba(243,241,236,0.85)" }}>
              ✦ Your next move
            </span>
            <span className="badge">Gray Intelligence</span>
          </div>
          <div>
            <h2 id="next-move" className={s.heroTitle}>
              {sample.nextMove.title}
            </h2>
            <p className={s.heroReason}>{sample.nextMove.reason}</p>
          </div>
          <div className="row wrap gap-12">
            <span className="btn btn-light btn-sm" aria-disabled="true" title="Starts on your phone once paired">
              ▶ Start on phone
            </span>
            <span className="faint" style={{ fontSize: 13, color: "rgba(243,241,236,0.7)" }}>
              Actions always start on your phone, where you approve them.
            </span>
          </div>
        </section>

        <section className={`${s.card} ${s.w5}`} aria-labelledby="readiness">
          <div className={s.cardHead}>
            <span id="readiness" className={s.label}>
              Readiness
            </span>
            <span className="badge signal">Estimated</span>
          </div>
          <div className={s.split}>
            <DotMatrix value={r.value} dot={11} reflect color="var(--content)" label={`Readiness ${r.value} out of 100`} />
            <span className={s.note} style={{ textAlign: "right" }}>
              / 100
              <br />
              Confidence: {r.confidence}
              <br />
              {r.inputs} of {r.of} inputs · missing {r.missing.join(", ")}
            </span>
          </div>
          <WaveLine data={r.week} height={56} label="Readiness over the last 7 days" />
        </section>

        <section className={`${s.card} ${s.w8}`} aria-labelledby="sleep">
          <div className={s.cardHead}>
            <span id="sleep" className={s.label}>
              Last night
            </span>
            <span className={s.note}>Target 8h</span>
          </div>
          <div className="row gap-24 wrap" style={{ alignItems: "flex-end" }}>
            <div className={s.metric}>{sample.sleep.total}</div>
            <TickMeter value={7} total={16} color="var(--lavender)" label="6 hours 50 minutes of an 8 hour target" />
          </div>
          <SleepStages segments={sample.sleep.segments} label="Sleep stages last night" />
        </section>

        <section className={`aura aura-jade ${s.card} ${s.w4}`} aria-labelledby="recovery">
          <div className={s.cardHead}>
            <span id="recovery" className={s.label} style={{ color: "rgba(243,241,236,0.85)" }}>
              Recovery · HRV
            </span>
            <span className="badge">↑ 6%</span>
          </div>
          <div className={s.metric}>
            {sample.hrv.value}
            <span className={s.unit}>ms</span>
          </div>
          <RangeBand value={sample.hrv.value} low={sample.hrv.low} high={sample.hrv.high} min={30} max={80} label="HRV 62 ms, within your baseline of 48 to 66" />
        </section>

        <section className={`${s.card} ${s.w3}`} aria-labelledby="rhr">
          <span id="rhr" className={s.label}>
            Resting HR
          </span>
          <div className={s.metric}>
            {sample.restingHr.value}
            <span className={s.unit}>bpm</span>
          </div>
          <WaveLine data={sample.restingHr.week} color="var(--ember)" height={52} label="Resting heart rate this week" />
          <span className={s.note}>Within baseline 55–64</span>
        </section>

        <section className={`${s.card} ${s.w3}`} aria-labelledby="steps">
          <span id="steps" className={s.label}>
            Steps
          </span>
          <div className={s.metric}>{sample.steps.today.toLocaleString("en-GB")}</div>
          <Bars data={sample.steps.week} labels={dayInitials} highlight={6} height={64} label="Steps per day this week" />
        </section>

        <section className={`${s.card} ${s.w3}`} aria-labelledby="focus">
          <span id="focus" className={s.label}>
            Focus today
          </span>
          <div style={{ display: "grid", placeItems: "center" }}>
            <ArcGauge value={sample.focus.minutes} max={sample.focus.goal} color="var(--ocean)" size={132} label="75 of 120 focus minutes">
              <div>
                <div className={s.metric} style={{ fontSize: 28 }}>
                  {sample.focus.minutes}
                </div>
                <div className={s.note}>of {sample.focus.goal} min</div>
              </div>
            </ArcGauge>
          </div>
        </section>

        <section className={`${s.card} ${s.w3}`} aria-labelledby="glance">
          <span id="glance" className={s.label}>
            Today at a glance
          </span>
          <div className="row gap-16">
            <PulseRings
              size={112}
              label="Routines 4 of 6, goals 42 percent, mind 14 minutes"
              rings={[
                { value: sample.routines.done / sample.routines.total, color: "var(--amber)" },
                { value: sample.goals.progress, color: "var(--signal)" },
                { value: 14 / 20, color: "var(--lavender)" },
              ]}
            />
            <div className={s.legend} style={{ flexDirection: "column", gap: 8 }}>
              <span>
                <i style={{ background: "var(--amber)" }} /> Routines 4/6
              </span>
              <span>
                <i style={{ background: "var(--signal)" }} /> Goals 42%
              </span>
              <span>
                <i style={{ background: "var(--lavender)" }} /> Mind 14 min
              </span>
            </div>
          </div>
        </section>

        <section className={`${s.card} ${s.w6}`} aria-labelledby="mood">
          <div className={s.cardHead}>
            <span id="mood" className={s.label}>
              How you&apos;ve felt
            </span>
            <div className={s.legend}>
              <span>
                <i style={{ background: "var(--signal)" }} /> Mood
              </span>
              <span>
                <i style={{ background: "var(--amber)" }} /> Energy
              </span>
              <span>
                <i style={{ background: "var(--magenta)" }} /> Stress
              </span>
            </div>
          </div>
          <div style={{ position: "relative", height: 110 }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <WaveLine data={sample.mood.week} min={1} max={5} height={110} label="Mood this week, self-reported 1 to 5" />
            </div>
            <div style={{ position: "absolute", inset: 0 }}>
              <WaveLine data={sample.mood.energy} min={1} max={5} height={110} fill={false} color="var(--amber)" label="Energy this week" />
            </div>
            <div style={{ position: "absolute", inset: 0 }}>
              <WaveLine data={sample.mood.stress} min={1} max={5} height={110} fill={false} color="var(--magenta)" label="Stress this week" />
            </div>
          </div>
          <span className={s.note}>Self-reported in your daily check-in, 1–5. Patterns, not causes.</span>
        </section>

        <section className={`${s.card} ${s.w6}`} aria-labelledby="checkins">
          <div className={s.cardHead}>
            <span id="checkins" className={s.label}>
              Check-ins · 14 days
            </span>
            <span className={s.note}>Dashed = no check-in</span>
          </div>
          <HeatStrip data={sample.checkins} label="Check-ins over the last 14 days; two days missing" />
          <div className="row gap-12" style={{ marginTop: 4 }}>
            <Image src="/organs/heart.webp" alt="" width={72} height={72} style={{ borderRadius: 16 }} />
            <div>
              <div style={{ fontWeight: 500 }}>Heart signals look steady</div>
              <div className={s.note}>Resting HR and HRV are both inside your personal baseline this week.</div>
            </div>
          </div>
        </section>

        <section className={`${s.card} ${s.w12}`} aria-labelledby="devices">
          <div className={s.cardHead}>
            <span id="devices" className={s.label}>
              Devices
            </span>
            <Link href="/dashboard/devices" className="btn btn-glass btn-sm">
              Manage
            </Link>
          </div>
          {paired.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              This is a local preview, so the numbers above are sample data. Signed in, this page shows your phone's summaries live, without storing them.
            </p>
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              {paired.length} device{paired.length > 1 ? "s" : ""} paired. This preview shows sample data.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
