"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Bars, RangeBand, TickMeter, WaveLine } from "@/components/charts";
import { BodyAtlas } from "@/components/body/BodyAtlas";
import { BreathOrb } from "@/components/body/BreathOrb";
import { CountUp } from "@/components/motion/CountUp";
import { organs as organGuides, type Organ } from "@/lib/body-content";
import type { DayMetrics, SyncCategory } from "@/lib/sync-crypto";
import {
  average,
  barValues,
  baseline,
  formatMinutes,
  halfChange,
  lastDays,
  latest,
  series,
  shared,
  summarise,
  weekdayInitials,
  type Field,
} from "@/lib/synced-view";
import { LiveGate } from "../live/LiveGate";
import s from "../dashboard.module.css";

/*
 * The dashboard cards. They take days in the shape the paired phone sends: live from the phone
 * (memory only, through LiveGate) or the demo days. Only what the phone shares is here: sleep
 * duration, steps, resting heart rate, HRV, check-in mood and screen time. Everything else (sleep
 * stages, vitals, journal, therapy, health answers) stays on the phone.
 */

function dayName(day: string) {
  return new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

/** Cards rise in one after another when a page opens. */
function Card({ className, children, i = 0, label }: { className: string; children: ReactNode; i?: number; label?: string }) {
  return (
    <motion.section
      className={`${s.card} ${className}`}
      aria-labelledby={label}
      data-spot=""
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.04 * i, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );
}

/** A card that is honest about why it has no number: not shared from the phone, or no reading. */
function Metric({
  days,
  field,
  category,
  title,
  className,
  i,
  render,
}: {
  days: DayMetrics[];
  field: Field;
  category: SyncCategory;
  title: string;
  className: string;
  i?: number;
  render: (value: number, day: string) => ReactNode;
}) {
  const last = latest(days, field);
  const titleId = `m-${field}`;
  return (
    <Card className={className} i={i} label={titleId}>
      <span id={titleId} className={s.label} style={className.includes("aura") ? { color: "rgba(243,241,236,0.85)" } : undefined}>
        {title}
      </span>
      {last ? (
        render(last.value, last.day)
      ) : (
        <span className={s.note}>{shared(days, category) ? "No reading in the last 30 days." : "Not shared from your phone. You can switch it on in Pair with web."}</span>
      )}
    </Card>
  );
}

function Sleep({ days, week, className, i }: { days: DayMetrics[]; week: string[]; className: string; i?: number }) {
  return (
    <Metric
      days={days}
      field="sleepMin"
      category="sleep"
      title="Sleep"
      className={className}
      i={i}
      render={(v, day) => (
        <>
          <div className="row gap-24 wrap" style={{ alignItems: "flex-end" }}>
            <div className={s.metric}>{formatMinutes(v)}</div>
            <TickMeter value={Math.round(v / 30)} total={16} color="var(--lavender)" label={`${formatMinutes(v)} of an 8 hour target`} />
          </div>
          <span className={s.note}>
            Night ending {dayName(day)} · target 8h · 7-night average {formatMinutes(average(series(days, week, "sleepMin")) ?? v)}
          </span>
          <Bars data={barValues(series(days, week, "sleepMin")).map((m) => m / 60)} labels={weekdayInitials(week)} highlight={6} color="var(--lavender)" height={90} label="Hours of sleep per night, last 7 nights" />
        </>
      )}
    />
  );
}

function Banded({ days, field, category, title, unit, min, max, aura, className, i }: {
  days: DayMetrics[];
  field: Field;
  category: SyncCategory;
  title: string;
  unit: string;
  min: number;
  max: number;
  aura: string;
  className: string;
  i?: number;
}) {
  const month = lastDays(new Date(), 30);
  const range = baseline(series(days, month, field));
  return (
    <Metric
      days={days}
      field={field}
      category={category}
      title={title}
      className={`aura aura-${aura} ${className}`}
      i={i}
      render={(v, day) => (
        <>
          <div className={s.metric}>
            <CountUp to={Math.round(v)} />
            <span className={s.unit}>{unit}</span>
          </div>
          {range ? (
            <RangeBand value={v} low={range.low} high={range.high} min={min} max={max} label={`${title} ${Math.round(v)} ${unit}, your usual range ${Math.round(range.low)} to ${Math.round(range.high)}`} />
          ) : (
            <WaveLine data={series(days, lastDays(new Date(), 7), field)} color="#fff" height={50} label={`${title} over the last 7 days`} />
          )}
          <span style={{ fontSize: 13, color: "rgba(243,241,236,0.75)" }}>
            {dayName(day)}
            {range ? ` · usual ${Math.round(range.low)}–${Math.round(range.high)} ${unit}` : " · your usual range appears after 5 days"}
          </span>
        </>
      )}
    />
  );
}

function Steps({ days, week, className, i }: { days: DayMetrics[]; week: string[]; className: string; i?: number }) {
  return (
    <Metric
      days={days}
      field="steps"
      category="steps"
      title="Steps"
      className={className}
      i={i}
      render={(v, day) => (
        <>
          <div className={s.metric}>
            <CountUp to={Math.round(v)} format={(n) => Math.round(n).toLocaleString("en-GB")} />
          </div>
          <span className={s.note}>{dayName(day)}</span>
          <Bars data={barValues(series(days, week, "steps"))} labels={weekdayInitials(week)} highlight={6} height={64} label="Steps per day, last 7 days" />
        </>
      )}
    />
  );
}

function Mood({ days, week, className, height = 110, i }: { days: DayMetrics[]; week: string[]; className: string; height?: number; i?: number }) {
  return (
    <Metric
      days={days}
      field="mood"
      category="mood"
      title="Mood"
      className={className}
      i={i}
      render={() => (
        <>
          <WaveLine data={series(days, week, "mood")} min={1} max={5} height={height} label="Mood over the last 7 days, self-reported 1 to 5" />
          <span className={s.note}>Self-reported in your daily check-in, 1–5. Gaps are days without a check-in.</span>
        </>
      )}
    />
  );
}

function Screen({ days, week, className, i }: { days: DayMetrics[]; week: string[]; className: string; i?: number }) {
  return (
    <Metric
      days={days}
      field="screenMin"
      category="screen"
      title="Screen time"
      className={className}
      i={i}
      render={(v, day) => (
        <>
          <div className={s.metric}>{formatMinutes(v)}</div>
          <span className={s.note}>
            {dayName(day)} · 7-day average {formatMinutes(average(series(days, week, "screenMin")) ?? v)}
          </span>
          <Bars data={barValues(series(days, week, "screenMin"))} labels={weekdayInitials(week)} highlight={6} color="var(--ocean)" height={64} label="Screen time per day, last 7 days" />
        </>
      )}
    />
  );
}

function StaysOnPhone({ what, className, i }: { what: string; className: string; i?: number }) {
  return (
    <Card className={className} i={i}>
      <div className={s.locked}>
        <span className={s.lockIcon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
        </span>
        <div>
          <div style={{ fontWeight: 500 }}>Stays on your phone</div>
          <div className={s.note}>{what}</div>
        </div>
      </div>
    </Card>
  );
}

/** The one useful action, first: a simple rule over the same summaries, with its reason. */
export function nextMove(days: DayMetrics[], today = new Date()) {
  const week = lastDays(today, 7);
  const sleep = latest(days, "sleepMin");
  const steps = average(series(days, week, "steps"));
  const mood = average(series(days, week, "mood"));
  if (sleep && sleep.value < 400) return { title: "Wind down 30 minutes earlier tonight", reason: `Last night was ${formatMinutes(sleep.value)}, under your 8-hour target.` };
  if (steps !== null && steps < 7000) return { title: "A 20-minute walk before 15:00", reason: `You're averaging ${Math.round(steps).toLocaleString("en-GB")} steps this week.` };
  if (mood !== null && mood < 3) return { title: "Four minutes of box breathing this afternoon", reason: `Your check-in mood has averaged ${mood.toFixed(1)} this week.` };
  return { title: "Keep the rhythm: same bedtime, one easy walk", reason: "Sleep, movement and mood are all inside your usual range this week." };
}

function NextMove({ days, className, i }: { days: DayMetrics[]; className: string; i?: number }) {
  const m = nextMove(days);
  return (
    <Card className={`aura aura-ember ${s.hero} ${className}`} i={i} label="next-move">
      <div className={s.cardHead}>
        <span className={s.label} style={{ color: "rgba(243,241,236,0.85)" }}>
          ✦ Your next move
        </span>
        <span className="badge">From your summaries</span>
      </div>
      <div>
        <h2 id="next-move" className={s.heroTitle}>
          {m.title}
        </h2>
        <p className={s.heroReason}>{m.reason}</p>
      </div>
      <span style={{ fontSize: 13, color: "rgba(243,241,236,0.7)" }}>Actions start on your phone, where you approve them.</span>
    </Card>
  );
}

const TREND_ROWS: { field: Field; label: string; fmt: (n: number) => string; sum?: boolean; lowerIsBetter?: boolean; color: string }[] = [
  { field: "sleepMin", label: "Avg sleep", fmt: formatMinutes, color: "var(--lavender)" },
  { field: "steps", label: "Total steps", fmt: (n) => Math.round(n).toLocaleString("en-GB"), sum: true, color: "var(--signal)" },
  { field: "rhrBpm", label: "Avg resting HR", fmt: (n) => `${Math.round(n)} bpm`, lowerIsBetter: true, color: "var(--ember)" },
  { field: "hrvMs", label: "Avg HRV", fmt: (n) => `${Math.round(n)} ms`, color: "var(--jade)" },
  { field: "mood", label: "Avg mood", fmt: (n) => `${n.toFixed(1)} / 5`, color: "var(--amber)" },
  { field: "screenMin", label: "Avg screen time", fmt: formatMinutes, lowerIsBetter: true, color: "var(--ocean)" },
];

/** Cumulative view: totals and averages over 7 or 30 days, and how the second half compares with the first. */
function Trends({ days, className, i }: { days: DayMetrics[]; className: string; i?: number }) {
  const [span, setSpan] = useState<7 | 30>(30);
  const [focus, setFocus] = useState<Field>("steps");
  const window = lastDays(new Date(), span);
  const row = TREND_ROWS.find((r) => r.field === focus)!;
  return (
    <Card className={className} i={i} label="trends">
      <div className={s.cardHead}>
        <span id="trends" className={s.label}>
          Trends · last {span} days
        </span>
        <div className={s.seg} role="group" aria-label="Period">
          {([7, 30] as const).map((n) => (
            <button key={n} type="button" aria-pressed={span === n} onClick={() => setSpan(n)}>
              {n} days
            </button>
          ))}
        </div>
      </div>
      <div className={s.trendGrid}>
        {TREND_ROWS.map((r) => {
          const sum = summarise(days, window, r.field);
          const ch = halfChange(days, window, r.field);
          const good = ch === null ? null : r.lowerIsBetter ? ch < 0 : ch > 0;
          const value = r.sum ? (sum.count ? sum.total : null) : sum.avg;
          return (
            <button key={r.field} type="button" className={s.trend} aria-pressed={focus === r.field} onClick={() => setFocus(r.field)} style={{ "--c": r.color } as React.CSSProperties}>
              <span className={s.note}>{r.label}</span>
              <strong>{value === null ? "—" : r.fmt(value)}</strong>
              {ch !== null && Math.abs(ch) >= 0.01 ? (
                <em className={good ? s.up : s.down}>
                  {ch > 0 ? "↑" : "↓"} {Math.abs(Math.round(ch * 100))}%
                </em>
              ) : (
                <em className={s.flat}>{sum.count ? "steady" : "no data"}</em>
              )}
            </button>
          );
        })}
      </div>
      <Bars
        data={barValues(series(days, window, focus))}
        labels={span === 7 ? weekdayInitials(window) : window.map((d, k) => (k % 5 === 4 ? String(new Date(`${d}T12:00:00`).getDate()) : ""))}
        highlight={span - 1}
        color={row.color}
        height={110}
        label={`${row.label.replace(/^(Avg|Total) /, "")} per day, last ${span} days`}
      />
      <span className={s.note}>Arrows compare the second half of the period with the first. Patterns, not causes.</span>
    </Card>
  );
}

/** Organ guides with the person's own numbers where the phone shares them. */
export function organsFor(days: DayMetrics[], demo: boolean): Organ[] {
  const fmt: Record<Field, (n: number) => { value: string; unit?: string }> = {
    sleepMin: (n) => ({ value: formatMinutes(n) }),
    steps: (n) => ({ value: Math.round(n).toLocaleString("en-GB") }),
    rhrBpm: (n) => ({ value: String(Math.round(n)), unit: "bpm" }),
    hrvMs: (n) => ({ value: String(Math.round(n)), unit: "ms" }),
    mood: (n) => ({ value: String(Math.round(n)), unit: "/ 5" }),
    screenMin: (n) => ({ value: formatMinutes(n) }),
  };
  const month = lastDays(new Date(), 30);
  return organGuides.map((o) => ({
    ...o,
    signals: o.signals.map((sig) => {
      if (!sig.field) return demo ? sig : { ...sig, value: "On phone", unit: undefined, band: undefined, note: "Read on your phone and never synced to the web." };
      const last = latest(days, sig.field);
      if (!last) return { ...sig, value: "—", unit: undefined, band: undefined, note: "Not shared from your phone." };
      const f = fmt[sig.field];
      const range = baseline(series(days, month, sig.field));
      const band = range ? Math.max(0.05, Math.min(0.95, 0.25 + ((last.value - range.low) / Math.max(1, range.high - range.low)) * 0.5)) : undefined;
      return { ...sig, ...f(last.value), band, note: range ? `Usual ${f(range.low).value}–${f(range.high).value}` : "Your usual range appears after 5 days" };
    }),
  }));
}

export function OverviewCards({ days }: { days: DayMetrics[] }) {
  const week = lastDays(new Date(), 7);
  return (
    <>
      <NextMove days={days} className={s.w7} i={0} />
      <Banded days={days} field="hrvMs" category="hrv" title="Recovery · HRV" unit="ms" min={10} max={150} aura="jade" className={s.w5} i={1} />
      <Sleep days={days} week={week} className={s.w8} i={2} />
      <Banded days={days} field="rhrBpm" category="rhr" title="Resting HR" unit="bpm" min={40} max={100} aura="ember" className={s.w4} i={3} />
      <Trends days={days} className={s.w12} i={4} />
      <Steps days={days} week={week} className={s.w4} i={5} />
      <Screen days={days} week={week} className={s.w4} i={6} />
      <Mood days={days} week={week} className={s.w4} i={7} />
    </>
  );
}

export function BodyCards({ days, demo = false }: { days: DayMetrics[]; demo?: boolean }) {
  const week = lastDays(new Date(), 7);
  return (
    <>
      <Card className={`${s.w12} ${s.atlasCard}`} i={0}>
        <span className={s.label}>Body atlas</span>
        <BodyAtlas organs={organsFor(days, demo)} caption={demo ? "Demo values." : "Your own summaries, live from your phone. Readings marked On phone are never synced."} />
      </Card>
      <Sleep days={days} week={week} className={s.w12} i={1} />
      <Banded days={days} field="hrvMs" category="hrv" title="HRV" unit="ms" min={10} max={150} aura="jade" className={s.w4} i={2} />
      <Banded days={days} field="rhrBpm" category="rhr" title="Resting heart rate" unit="bpm" min={40} max={100} aura="ember" className={s.w4} i={3} />
      <Steps days={days} week={week} className={s.w4} i={4} />
      <StaysOnPhone className={s.w12} i={5} what="Sleep stages, vitals, records and your health answers are read on the phone and never synced." />
    </>
  );
}

export function MindCards({ days }: { days: DayMetrics[] }) {
  const week = lastDays(new Date(), 7);
  return (
    <>
      <Card className={`aura aura-violet ${s.w5} ${s.breathCard}`} i={0}>
        <span className={s.label} style={{ color: "rgba(243,241,236,0.85)" }}>
          Take a minute
        </span>
        <BreathOrb size={260} />
      </Card>
      <Mood days={days} week={week} className={s.w7} height={180} i={1} />
      <Screen days={days} week={week} className={s.w6} i={2} />
      <StaysOnPhone className={s.w6} i={3} what="Journal entries, private notes, energy and stress, practice sessions and Gray Therapy summaries are never synced to the web." />
    </>
  );
}

export function SyncedOverview() {
  return <LiveGate>{(days) => <OverviewCards days={days} />}</LiveGate>;
}

export function SyncedBody() {
  return <LiveGate>{(days) => <BodyCards days={days} />}</LiveGate>;
}

export function SyncedMind() {
  return <LiveGate>{(days) => <MindCards days={days} />}</LiveGate>;
}
