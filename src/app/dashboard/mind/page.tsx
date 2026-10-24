import { getViewer } from "@/lib/session";
import { sample, dayInitials } from "@/lib/sample-data";
import { DotMatrix } from "@/components/DotMatrix";
import { Bars, HeatStrip, WaveLine } from "@/components/charts";
import { PageHeader } from "../PageHeader";
import s from "../dashboard.module.css";

export const metadata = { title: "Mind" };

const practices = [
  { name: "Box breathing", meta: "4 · 4 · 4 · 4", when: "Today, 08:12", aura: "ocean" },
  { name: "NSDR · 10", meta: "Non-sleep deep rest", when: "Yesterday, 13:40", aura: "violet" },
  { name: "Body scan", meta: "Guided meditation", when: "Sat, 22:05", aura: "dusk" },
];

export default async function MindPage() {
  await getViewer();
  const total = sample.mind.minutes.reduce((a, b) => a + b, 0);
  return (
    <div className={s.page}>
      <PageHeader title="Mind" />
      <div className={s.grid}>
        <section className={`aura aura-violet ${s.card} ${s.w5}`} style={{ minHeight: 260 }}>
          <span className={s.label} style={{ color: "rgba(243,241,236,0.85)" }}>
            This week
          </span>
          <div className="row gap-12" style={{ alignItems: "flex-end" }}>
            <DotMatrix value={total} dot={11} reflect color="#fff" label={`${total} minutes of practice this week`} />
            <span style={{ color: "rgba(243,241,236,0.8)", paddingBottom: 30 }}>minutes</span>
          </div>
          <span style={{ fontSize: 13, color: "rgba(243,241,236,0.75)" }}>{sample.mind.sessions} sessions of breathwork, meditation and NSDR</span>
        </section>
        <section className={`${s.card} ${s.w7}`}>
          <span className={s.label}>Practice minutes per day</span>
          <Bars data={sample.mind.minutes} labels={dayInitials} highlight={6} color="var(--violet)" height={170} label="Minutes of practice per day" />
        </section>

        <section className={`${s.card} ${s.w4}`}>
          <span className={s.label}>Mood</span>
          <WaveLine data={sample.mood.week} min={1} max={5} height={80} label="Mood this week" />
          <span className={s.note}>Self-reported, 1–5</span>
        </section>
        <section className={`${s.card} ${s.w4}`}>
          <span className={s.label}>Energy</span>
          <WaveLine data={sample.mood.energy} min={1} max={5} color="var(--amber)" height={80} label="Energy this week" />
          <span className={s.note}>Self-reported, 1–5</span>
        </section>
        <section className={`${s.card} ${s.w4}`}>
          <span className={s.label}>Stress</span>
          <WaveLine data={sample.mood.stress} min={1} max={5} color="var(--magenta)" height={80} label="Stress this week" />
          <span className={s.note}>Lower is calmer</span>
        </section>

        <section className={`${s.card} ${s.w7}`}>
          <span className={s.label}>Recent practice</span>
          <ul className={s.deviceList}>
            {practices.map((p) => (
              <li key={p.name}>
                <span className={`aura aura-${p.aura} no-frame`} style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div className={s.note}>{p.meta}</div>
                </div>
                <span className={s.note}>{p.when}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${s.card} ${s.w5}`}>
          <span className={s.label}>Check-ins · 14 days</span>
          <HeatStrip data={sample.checkins} color="var(--lavender)" label="Check-ins over the last 14 days" />
          <div className={s.locked} style={{ marginTop: 8 }}>
            <span className={s.lockIcon} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 018 0v3" />
              </svg>
            </span>
            <div>
              <div style={{ fontWeight: 500 }}>Journal and notes stay on your phone</div>
              <div className={s.note}>Private notes, journal entries and Gray Therapy summaries are never synced to the web.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
