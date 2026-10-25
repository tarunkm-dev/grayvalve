import Image from "next/image";
import { getViewer } from "@/lib/session";
import { sample, dayInitials } from "@/lib/sample-data";
import { Bars, RangeBand, SleepStages, WaveLine } from "@/components/charts";
import { PageHeader } from "../PageHeader";
import { SyncedBody } from "../synced/SyncedViews";
import s from "../dashboard.module.css";

export const metadata = { title: "Body" };

const organs = [
  { id: "heart", name: "Heart", signals: "Resting HR · HRV" },
  { id: "lungs", name: "Lungs", signals: "SpO₂ · Respiration" },
  { id: "brain", name: "Brain", signals: "Sleep · Stress" },
  { id: "kidneys", name: "Kidneys", signals: "Hydration" },
];

export default async function BodyPage() {
  const viewer = await getViewer();
  if (!viewer.preview) {
    return (
      <div className={s.page}>
        <PageHeader title="Body" sample={false} />
        <div className={s.grid}>
          <SyncedBody />
        </div>
      </div>
    );
  }
  return (
    <div className={s.page}>
      <PageHeader title="Body" />
      <div className={s.grid}>
        <section className={`${s.card} ${s.w6}`}>
          <div className={s.cardHead}>
            <span className={s.label}>Sleep · 7 nights</span>
            <span className={s.note}>avg 7h 13m</span>
          </div>
          <Bars data={sample.sleep.week} labels={dayInitials} highlight={6} color="var(--lavender)" height={140} label="Hours of sleep per night this week" />
        </section>
        <section className={`${s.card} ${s.w6}`}>
          <span className={s.label}>Sleep stages · last night</span>
          <SleepStages segments={sample.sleep.segments} label="Sleep stages last night" />
        </section>

        <section className={`aura aura-jade ${s.card} ${s.w4}`}>
          <span className={s.label} style={{ color: "rgba(243,241,236,0.85)" }}>
            HRV
          </span>
          <div className={s.metric}>
            {sample.hrv.value}
            <span className={s.unit}>ms</span>
          </div>
          <RangeBand value={sample.hrv.value} low={sample.hrv.low} high={sample.hrv.high} min={30} max={80} label="HRV against baseline" />
        </section>
        <section className={`aura aura-ember ${s.card} ${s.w4}`}>
          <span className={s.label} style={{ color: "rgba(243,241,236,0.85)" }}>
            Resting heart rate
          </span>
          <div className={s.metric}>
            {sample.restingHr.value}
            <span className={s.unit}>bpm</span>
          </div>
          <RangeBand value={sample.restingHr.value} low={sample.restingHr.low} high={sample.restingHr.high} min={45} max={80} label="Resting heart rate against baseline" />
        </section>
        <section className={`aura aura-amber ${s.card} ${s.w4}`}>
          <span className={s.label} style={{ color: "rgba(243,241,236,0.85)" }}>
            Steps
          </span>
          <div className={s.metric}>
            {sample.steps.today.toLocaleString("en-GB")}
            <span className={s.unit}>/ {sample.steps.goal.toLocaleString("en-GB")}</span>
          </div>
          <WaveLine data={sample.steps.week} color="#fff" height={50} label="Steps this week" />
        </section>

        <section className={`${s.card} ${s.w12}`}>
          <div className={s.cardHead}>
            <span className={s.label}>Vitals</span>
            <span className={s.note}>From Health Connect, with source and freshness</span>
          </div>
          <div className={s.vitals}>
            {sample.vitals.map((v) => (
              <div key={v.name} className={s.vital}>
                <div className={s.note}>{v.name}</div>
                <div className={s.metric} style={{ fontSize: 26, marginTop: 4, color: v.value === "Not set" ? "var(--faint)" : undefined }}>
                  {v.value}
                  {v.unit && <span className={s.unit}>{v.unit}</span>}
                </div>
                <div className={s.note} style={{ marginTop: 2 }}>
                  {v.note}
                </div>
              </div>
            ))}
          </div>
        </section>

        {organs.map((o) => (
          <section key={o.id} className={`${s.card} ${s.w3}`} style={{ background: "#000", padding: 0, overflow: "hidden" }}>
            <Image src={`/organs/${o.id}.webp`} alt={`${o.name} illustration`} width={360} height={360} style={{ width: "100%", height: "auto" }} />
            <div style={{ padding: "0 20px 20px" }}>
              <div style={{ fontWeight: 500 }}>{o.name}</div>
              <div className={s.note}>{o.signals}</div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
