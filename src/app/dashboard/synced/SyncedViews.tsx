"use client";

import type { ReactNode } from "react";
import { Bars, RangeBand, TickMeter, WaveLine } from "@/components/charts";
import type { DayMetrics, SyncCategory } from "@/lib/sync-crypto";
import { average, barValues, baseline, formatMinutes, lastDays, latest, series, shared, weekdayInitials, type Field } from "@/lib/synced-view";
import { LiveGate } from "../live/LiveGate";
import s from "../dashboard.module.css";

/*
 * The dashboards with the person's own summaries, live from their phone (memory only). Only what the phone shares is here:
 * sleep duration, steps, resting heart rate, HRV, check-in mood and screen time. Everything else
 * (sleep stages, vitals, journal, therapy, health answers) stays on the phone.
 */

function dayName(day: string) {
  return new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

/** A card that is honest about why it has no number: not shared from the phone, or no reading. */
function Metric({
  days,
  field,
  category,
  title,
  className,
  render,
}: {
  days: DayMetrics[];
  field: Field;
  category: SyncCategory;
  title: string;
  className: string;
  render: (value: number, day: string) => ReactNode;
}) {
  const last = latest(days, field);
  const titleId = `m-${field}`;
  return (
    <section className={`${s.card} ${className}`} aria-labelledby={titleId}>
      <span id={titleId} className={s.label} style={className.includes("aura") ? { color: "rgba(243,241,236,0.85)" } : undefined}>
        {title}
      </span>
      {last ? (
        render(last.value, last.day)
      ) : (
        <span className={s.note}>{shared(days, category) ? "No reading in the last 30 days." : "Not shared from your phone. You can switch it on in Pair with web."}</span>
      )}
    </section>
  );
}

function Sleep({ days, week, className }: { days: DayMetrics[]; week: string[]; className: string }) {
  return (
    <Metric
      days={days}
      field="sleepMin"
      category="sleep"
      title="Sleep"
      className={className}
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

function Banded({ days, field, category, title, unit, min, max, aura, className }: {
  days: DayMetrics[];
  field: Field;
  category: SyncCategory;
  title: string;
  unit: string;
  min: number;
  max: number;
  aura: string;
  className: string;
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
      render={(v, day) => (
        <>
          <div className={s.metric}>
            {Math.round(v)}
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

function Steps({ days, week, className }: { days: DayMetrics[]; week: string[]; className: string }) {
  return (
    <Metric
      days={days}
      field="steps"
      category="steps"
      title="Steps"
      className={className}
      render={(v, day) => (
        <>
          <div className={s.metric}>{Math.round(v).toLocaleString("en-GB")}</div>
          <span className={s.note}>{dayName(day)}</span>
          <Bars data={barValues(series(days, week, "steps"))} labels={weekdayInitials(week)} highlight={6} height={64} label="Steps per day, last 7 days" />
        </>
      )}
    />
  );
}

function Mood({ days, week, className, height = 110 }: { days: DayMetrics[]; week: string[]; className: string; height?: number }) {
  return (
    <Metric
      days={days}
      field="mood"
      category="mood"
      title="Mood"
      className={className}
      render={() => (
        <>
          <WaveLine data={series(days, week, "mood")} min={1} max={5} height={height} label="Mood over the last 7 days, self-reported 1 to 5" />
          <span className={s.note}>Self-reported in your daily check-in, 1–5. Gaps are days without a check-in.</span>
        </>
      )}
    />
  );
}

function Screen({ days, week, className }: { days: DayMetrics[]; week: string[]; className: string }) {
  return (
    <Metric
      days={days}
      field="screenMin"
      category="screen"
      title="Screen time"
      className={className}
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

function StaysOnPhone({ what, className }: { what: string; className: string }) {
  return (
    <section className={`${s.card} ${className}`}>
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
    </section>
  );
}

export function SyncedOverview() {
  return (
    <LiveGate>
      {(days) => {
        const week = lastDays(new Date(), 7);
        return (
          <>
            <Sleep days={days} week={week} className={s.w8} />
            <Banded days={days} field="hrvMs" category="hrv" title="Recovery · HRV" unit="ms" min={10} max={150} aura="jade" className={s.w4} />
            <Banded days={days} field="rhrBpm" category="rhr" title="Resting HR" unit="bpm" min={40} max={100} aura="ember" className={s.w4} />
            <Steps days={days} week={week} className={s.w4} />
            <Screen days={days} week={week} className={s.w4} />
            <Mood days={days} week={week} className={s.w12} />
          </>
        );
      }}
    </LiveGate>
  );
}

export function SyncedBody() {
  return (
    <LiveGate>
      {(days) => {
        const week = lastDays(new Date(), 7);
        return (
          <>
            <Sleep days={days} week={week} className={s.w12} />
            <Banded days={days} field="hrvMs" category="hrv" title="HRV" unit="ms" min={10} max={150} aura="jade" className={s.w4} />
            <Banded days={days} field="rhrBpm" category="rhr" title="Resting heart rate" unit="bpm" min={40} max={100} aura="ember" className={s.w4} />
            <Steps days={days} week={week} className={s.w4} />
            <StaysOnPhone className={s.w12} what="Sleep stages, vitals, records and your health answers are read on the phone and never synced." />
          </>
        );
      }}
    </LiveGate>
  );
}

export function SyncedMind() {
  return (
    <LiveGate>
      {(days) => {
        const week = lastDays(new Date(), 7);
        return (
          <>
            <Mood days={days} week={week} className={s.w7} height={140} />
            <Screen days={days} week={week} className={s.w5} />
            <StaysOnPhone className={s.w12} what="Journal entries, private notes, energy and stress, practice sessions and Gray Therapy summaries are never synced to the web." />
          </>
        );
      }}
    </LiveGate>
  );
}
