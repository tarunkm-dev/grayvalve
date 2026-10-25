"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Gauge, LineChart, Matrix, Radar, Scatter, Timeline, WeekHeat } from "@/components/analytics/Charts";
import {
  FIELDS,
  FIELD_COLOR,
  FIELD_LABEL,
  anomalies,
  balance,
  cognitiveLoad,
  correlationMatrix,
  insights,
  lagged,
  lowerLabel,
  recoveryIndex,
  sleepDebt,
  sleepRegularity,
  strength,
  trend,
  weekdayProfile,
  zscores,
} from "@/lib/analytics";
import type { DayMetrics } from "@/lib/sync-crypto";
import { average, baseline, formatMinutes, lastDays, series } from "@/lib/synced-view";
import { LiveGate } from "../live/LiveGate";
import s from "../dashboard.module.css";

/*
 * Analytics: what the web adds over the phone. Readiness, sleep pressure, autonomic balance,
 * cognitive load, links between metrics (same day and next day), weekly rhythm and outliers, all
 * computed in this tab from the days on screen. Nothing is stored or sent.
 */

function Card({ className, children, i = 0, title, sub, aside }: { className: string; children: ReactNode; i?: number; title: string; sub?: string; aside?: ReactNode }) {
  return (
    <motion.section
      className={`${s.card} ${className}`}
      data-spot=""
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 * i, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div className={s.cardHead}>
        <div>
          <span className={s.label}>{title}</span>
          {sub && <p className={s.cardSub}>{sub}</p>}
        </div>
        {aside}
      </div>
      {children}
    </motion.section>
  );
}

const NEED = 480;

/** A short, plain-language read of the month, the way a clinician would open a review. */
function summaryText(days: DayMetrics[], window: string[]) {
  const sleep = average(series(days, window, "sleepMin"));
  const debt = sleepDebt(days, window, NEED).at(-1)?.value ?? null;
  const reg = sleepRegularity(days, window);
  const hrvT = trend(days, window, "hrvMs");
  const rhrT = trend(days, window, "rhrBpm");
  const load = cognitiveLoad(days, window, NEED);
  const heaviest = load.reduce<{ day: string; value: number } | null>((m, d) => (d.value !== null && (!m || d.value > m.value) ? { day: d.day, value: d.value } : m), null);
  const parts: string[] = [];
  if (sleep !== null) parts.push(`You slept ${formatMinutes(sleep)} a night on average${sleep < NEED - 30 ? `, about ${formatMinutes(NEED - sleep)} under an 8-hour need` : ""}.`);
  if (debt !== null && debt > 120) parts.push(`Over the last two weeks that adds up to ${formatMinutes(debt)} of sleep debt.`);
  if (reg) parts.push(`Night-to-night duration varies by about ${reg.sd} minutes (regularity ${reg.score}/100).`);
  if (hrvT && hrvT.r2 > 0.15) parts.push(`HRV is drifting ${hrvT.perWeek > 0 ? "up" : "down"} by ${Math.abs(hrvT.perWeek).toFixed(1)} ms a week${hrvT.perWeek > 0 ? ", a good sign for recovery" : ""}.`);
  if (rhrT && rhrT.r2 > 0.15) parts.push(`Resting heart rate is ${rhrT.perWeek < 0 ? "easing" : "creeping up"} by ${Math.abs(rhrT.perWeek).toFixed(1)} bpm a week.`);
  if (heaviest) parts.push(`Cognitive load peaked on ${new Date(`${heaviest.day}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}.`);
  return parts.length ? parts.join(" ") : "Not enough days yet for a review. It fills in as your phone streams more days.";
}

export function AnalyticsCards({ days }: { days: DayMetrics[] }) {
  const window = useMemo(() => lastDays(new Date(), 30), []);
  const [lag, setLag] = useState<0 | 1>(1);
  const [pick, setPick] = useState<[number, number]>([0, 1]);

  const rec = useMemo(() => recoveryIndex(days, window, NEED), [days, window]);
  const debt = useMemo(() => sleepDebt(days, window, NEED), [days, window]);
  const load = useMemo(() => cognitiveLoad(days, window, NEED), [days, window]);
  const reg = useMemo(() => sleepRegularity(days, window), [days, window]);
  const axes = useMemo(() => balance(days, window, NEED), [days, window]);
  const matrix = useMemo(() => correlationMatrix(days, window, lag), [days, window, lag]);
  const found = useMemo(() => insights(days, window), [days, window]);
  const flags = useMemo(() => anomalies(days, window), [days, window]);
  const week = useMemo(() => weekdayProfile(days, window), [days, window]);

  const recVals = rec.map((r) => r.value);
  const recBand = baseline(recVals);
  const lastOf = (vals: (number | null)[]) => [...vals].reverse().find((v) => v !== null) ?? null;
  const balanceScore = average(axes.map((a) => a.value));

  const [a, b] = pick;
  const fa = FIELDS[a];
  const fb = FIELDS[b];
  const pair = lagged(days, window, fa, fb, lag);
  const fit = matrix[a][b];

  return (
    <>
      <Card className={s.w12} i={0} title="Clinical-style summary · last 30 days" aside={<button type="button" className="btn btn-glass btn-sm" onClick={printPage}>Print or save as PDF</button>}>
        <p className={s.summary}>{summaryText(days, window)}</p>
        <div className={s.gauges}>
          <Gauge value={lastOf(recVals)} label="Recovery index" color="var(--jade)" caption="Today · estimated" />
          <Gauge value={lastOf(load.map((l) => l.value))} label="Cognitive load" color="var(--violet)" caption="Today · lower is lighter" />
          <Gauge value={reg?.score ?? null} label="Sleep regularity" color="var(--lavender)" caption={reg ? `±${reg.sd} min a night` : "Needs 3 nights"} />
          <Gauge value={balanceScore === null ? null : Math.round(balanceScore)} label="Lifestyle balance" color="var(--signal)" caption="Average of six domains" />
        </div>
      </Card>

      <Card className={s.w8} i={1} title="Recovery index" sub="HRV above your norm and resting HR below it raise it; short sleep lowers it. Red lines mark unusual days.">
        <LineChart
          days={window}
          lines={[{ label: "Recovery", color: "var(--jade)", values: recVals, area: true }]}
          min={0}
          max={100}
          band={recBand ? { low: recBand.low, high: recBand.high, label: "your usual" } : undefined}
          flags={[...new Set(flags.map((f) => window.indexOf(f.day)))]}
          label="Recovery index per day over 30 days"
        />
      </Card>

      <Card className={s.w4} i={2} title="Lifestyle balance" sub="Six domains scored against simple targets.">
        <Radar axes={axes} label="Lifestyle balance radar" />
      </Card>

      <Card className={s.w6} i={3} title="Autonomic balance" sub="HRV and resting HR as distance from your own average. When they pull apart (HRV down, HR up), your body is under load.">
        <LineChart
          days={window}
          lines={[
            { label: "HRV", color: "var(--jade)", values: zscores(series(days, window, "hrvMs")) },
            { label: "Resting HR", color: "var(--ember)", values: zscores(series(days, window, "rhrBpm")), dashed: true },
          ]}
          min={-3}
          max={3}
          unit=" SD"
          label="HRV and resting heart rate z-scores over 30 days"
        />
      </Card>

      <Card className={s.w6} i={4} title="Sleep pressure and cognitive load" sub="Sleep debt over the previous 14 nights, and daily cognitive load from short sleep, screens and low mood.">
        <LineChart
          days={window}
          lines={[{ label: "Sleep debt", color: "var(--lavender)", values: debt.map((d) => (d.value === null ? null : Math.round(d.value / 6) / 10)), area: true }]}
          min={0}
          height={150}
          unit=" h"
          label="Sleep debt in hours over the previous 14 nights, by day"
        />
        <LineChart
          days={window}
          lines={[{ label: "Cognitive load", color: "var(--violet)", values: load.map((l) => l.value), area: true }]}
          min={0}
          max={100}
          height={120}
          label="Cognitive load per day, 0 to 100"
        />
      </Card>

      <Card
        className={s.w12}
        i={5}
        title="How your signals connect"
        sub="Correlation across your own days. Green moves together, red moves opposite. Choose a cell to see the days behind it."
        aside={
          <div className={s.seg} role="group" aria-label="Timing">
            <button type="button" aria-pressed={lag === 0} onClick={() => setLag(0)}>
              Same day
            </button>
            <button type="button" aria-pressed={lag === 1} onClick={() => setLag(1)}>
              Next day
            </button>
          </div>
        }
      >
        <div className={s.connect}>
          <div>
            <Matrix labels={FIELDS.map((f) => FIELD_LABEL[f])} cells={matrix} selected={pick} onPick={(i, j) => setPick([i, j])} label={`Correlation matrix, ${lag ? "each metric against the next day's" : "same day"}`} />
            <p className={s.note} style={{ marginTop: 10 }}>
              Rows are {lag ? "today" : "the first metric"}, columns are {lag ? "the next day" : "the second"}. Correlation shows a pattern, not a cause.
            </p>
          </div>
          <div>
            <div className={s.pairHead}>
              <strong>
                {FIELD_LABEL[fa]} → {lag ? "next day's " : ""}
                {lowerLabel(fb)}
              </strong>
              <span className={s.note}>{fit ? `${strength(fit.r)} link · r = ${fit.r.toFixed(2)} · ${fit.n} days` : "Not enough days with both readings"}</span>
            </div>
            <Scatter xs={pair.xs} ys={pair.ys} fit={fit} xLabel={FIELD_LABEL[fa]} yLabel={FIELD_LABEL[fb]} color={FIELD_COLOR[fb]} label={`Scatter of ${FIELD_LABEL[fa]} against ${FIELD_LABEL[fb]}`} />
          </div>
        </div>
      </Card>

      <Card className={s.w7} i={6} title="What stands out" sub="Ranked by how strong and consistent the pattern is in your own data.">
        {found.length === 0 ? (
          <p className={s.note}>No clear patterns yet. They appear as more days arrive.</p>
        ) : (
          <ol className={s.insights}>
            {found.map((f, k) => (
              <motion.li key={f.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + k * 0.06 }}>
                <span className={`${s.kind} ${s[`kind_${f.kind}`]}`}>{f.kind === "link" ? "Link" : f.kind === "trend" ? "Trend" : f.kind === "rhythm" ? "Rhythm" : "Flag"}</span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.detail}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </Card>

      <Card className={s.w5} i={7} title="Your usual week" sub="Each metric by weekday, against your own average.">
        <WeekHeat rows={week.map((r) => ({ label: FIELD_LABEL[r.field], values: r.values }))} label="Weekday by metric heatmap" />
      </Card>

      <Card className={s.w12} i={8} title="Unusual days" sub="Readings two or more standard deviations from your own usual, by signal. Bigger halo, further from usual.">
        <Timeline
          days={window}
          lanes={FIELDS.map((f) => ({ label: FIELD_LABEL[f], color: FIELD_COLOR[f], events: flags.filter((x) => x.field === f).map((x) => ({ i: window.indexOf(x.day), z: x.z })) }))}
          label="Timeline of unusual readings"
        />
      </Card>

      <section className={`${s.card} ${s.w12}`}>
        <details className={s.method}>
          <summary>How these are calculated</summary>
          <ul>
            <li>
              <strong>Your baseline:</strong> every score compares you with your own last 30 days (mean and standard deviation), never with population averages.
            </li>
            <li>
              <strong>Recovery index:</strong> 60 is a usual day for you. HRV above your average and resting HR below it raise it, sleep under 8 hours lowers it (each input weighted, averaged, capped at 0–100). Needs two of the three.
            </li>
            <li>
              <strong>Sleep debt:</strong> minutes short of 8 hours, summed over the previous 14 nights. Regularity: 100 minus the night-to-night spread in minutes divided by 6.
            </li>
            <li>
              <strong>Cognitive load:</strong> average of sleep shortfall (up to 2.5 h), screen time above 1.5 h (up to 5 h more) and mood below 4.
            </li>
            <li>
              <strong>Links:</strong> Pearson correlation over days where both readings exist (at least 6; insights need 8 and |r| ≥ 0.35). Next-day links pair today with tomorrow.
            </li>
            <li>
              <strong>Not medical advice:</strong> these are wellbeing patterns. Talk to a clinician about anything that worries you.
            </li>
          </ul>
        </details>
      </section>
    </>
  );
}

function printPage() {
  window.print();
}

export function SyncedAnalytics() {
  return <LiveGate>{(days) => <AnalyticsCards days={days} />}</LiveGate>;
}
