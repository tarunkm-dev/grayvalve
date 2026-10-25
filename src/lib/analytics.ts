import type { DayMetrics } from "@/lib/sync-crypto";
import { average, series, type Field } from "@/lib/synced-view";

/*
 * Analytics for the web dashboard: the calculations the phone doesn't do, run in the browser over
 * the up-to-30 days the phone streams (memory only). Pure functions, so they're tested.
 *
 * Everything is personal (against the person's own baseline, never population norms), describes
 * patterns rather than causes, and says how much data it rests on. Unknown stays unknown: missing
 * days are skipped, never treated as zero.
 */

export const FIELDS: Field[] = ["sleepMin", "hrvMs", "rhrBpm", "steps", "mood", "screenMin"];

export const FIELD_LABEL: Record<Field, string> = {
  sleepMin: "Sleep",
  hrvMs: "HRV",
  rhrBpm: "Resting HR",
  steps: "Steps",
  mood: "Mood",
  screenMin: "Screen time",
};

/** The label inside a sentence: "resting HR", "sleep", but "HRV" stays as it is. */
export function lowerLabel(f: Field) {
  return FIELD_LABEL[f].replace(/^[A-Z][a-z]/, (m) => m.toLowerCase());
}

export const FIELD_COLOR: Record<Field, string> = {
  sleepMin: "var(--lavender)",
  hrvMs: "var(--jade)",
  rhrBpm: "var(--ember)",
  steps: "var(--signal)",
  mood: "var(--amber)",
  screenMin: "var(--ocean)",
};

/** Mean and standard deviation of the readings present, or null with fewer than three. */
export function stats(values: (number | null)[]) {
  const v = values.filter((x): x is number => x !== null);
  if (v.length < 3) return null;
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (v.length - 1));
  return { mean, sd, n: v.length };
}

/** Each reading as standard deviations from the person's own mean (null where missing or flat). */
export function zscores(values: (number | null)[]): (number | null)[] {
  const s = stats(values);
  if (!s || s.sd === 0) return values.map(() => null);
  return values.map((v) => (v === null ? null : (v - s.mean) / s.sd));
}

export type Fit = { r: number; n: number; slope: number; intercept: number };

/** Pearson correlation and least-squares line over the pairs where both values exist. Null under 6 pairs. */
export function pearson(xs: (number | null)[], ys: (number | null)[]): Fit | null {
  const pts: [number, number][] = [];
  for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
    const x = xs[i];
    const y = ys[i];
    if (x !== null && y !== null) pts.push([x, y]);
  }
  const n = pts.length;
  if (n < 6) return null;
  const mx = pts.reduce((a, p) => a + p[0], 0) / n;
  const my = pts.reduce((a, p) => a + p[1], 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [x, y] of pts) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  const slope = sxy / sxx;
  return { r: sxy / Math.sqrt(sxx * syy), n, slope, intercept: my - slope * mx };
}

/** Pairs of (a on day i, b on day i + lag) across the window, for "today's X and tomorrow's Y". */
export function lagged(days: DayMetrics[], window: string[], a: Field, b: Field, lag = 0) {
  const xs = series(days, window, a);
  const ys = series(days, window, b);
  return { xs: xs.slice(0, xs.length - lag), ys: ys.slice(lag) };
}

export function correlationMatrix(days: DayMetrics[], window: string[], lag = 0): (Fit | null)[][] {
  return FIELDS.map((a) =>
    FIELDS.map((b) => {
      if (a === b && lag === 0) return null;
      const { xs, ys } = lagged(days, window, a, b, lag);
      return pearson(xs, ys);
    }),
  );
}

/** Plain words for a correlation's strength. */
export function strength(r: number) {
  const a = Math.abs(r);
  return a >= 0.6 ? "strong" : a >= 0.4 ? "moderate" : a >= 0.25 ? "weak" : "no clear";
}

/**
 * Recovery index, 0–100 per day: HRV above your norm and resting HR below it raise it; sleep short
 * of your need lowers it. 60 is a usual day for you. Needs at least two of the three inputs. An
 * estimate, labelled as such.
 */
export function recoveryIndex(days: DayMetrics[], window: string[], needMin = 480) {
  const hrv = zscores(series(days, window, "hrvMs"));
  const rhr = zscores(series(days, window, "rhrBpm"));
  const sleep = series(days, window, "sleepMin");
  return window.map((day, i) => {
    const parts: number[] = [];
    if (hrv[i] !== null) parts.push(hrv[i]! * 12);
    if (rhr[i] !== null) parts.push(-rhr[i]! * 10);
    if (sleep[i] !== null) parts.push(Math.max(-25, Math.min(10, (sleep[i]! / needMin - 1) * 60)));
    if (parts.length < 2) return { day, value: null as number | null, inputs: parts.length };
    const score = 60 + (parts.reduce((a, b) => a + b, 0) / parts.length) * 1.4;
    return { day, value: Math.round(Math.max(0, Math.min(100, score))), inputs: parts.length };
  });
}

/** Rolling sleep debt: minutes short of your need over the previous 14 nights, night by night. */
export function sleepDebt(days: DayMetrics[], window: string[], needMin = 480) {
  const sleep = series(days, window, "sleepMin");
  return window.map((day, i) => {
    const span = sleep.slice(Math.max(0, i - 13), i + 1).filter((v): v is number => v !== null);
    if (!span.length) return { day, value: null as number | null };
    return { day, value: Math.round(span.reduce((a, v) => a + Math.max(0, needMin - v), 0)) };
  });
}

/** Sleep regularity, 0–100: 100 means the same duration every night; each 6 minutes of spread costs a point. */
export function sleepRegularity(days: DayMetrics[], window: string[]) {
  const s = stats(series(days, window, "sleepMin"));
  return s ? { score: Math.round(Math.max(0, 100 - s.sd / 6)), sd: Math.round(s.sd), n: s.n } : null;
}

/**
 * Cognitive load, 0–100 per day: what tends to tax attention and stress regulation. Sleep under
 * your need, heavy screen time and low mood each add to it. Higher is heavier.
 */
export function cognitiveLoad(days: DayMetrics[], window: string[], needMin = 480) {
  const sleep = series(days, window, "sleepMin");
  const screen = series(days, window, "screenMin");
  const mood = series(days, window, "mood");
  return window.map((day, i) => {
    const parts: number[] = [];
    if (sleep[i] !== null) parts.push(Math.max(0, Math.min(1, (needMin - sleep[i]!) / 150)));
    if (screen[i] !== null) parts.push(Math.max(0, Math.min(1, (screen[i]! - 90) / 300)));
    if (mood[i] !== null) parts.push(Math.max(0, Math.min(1, (4 - mood[i]!) / 3)));
    if (parts.length < 2) return { day, value: null as number | null };
    return { day, value: Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100) };
  });
}

/** Average z-score by weekday (Monday first) for each field: the shape of a usual week. */
export function weekdayProfile(days: DayMetrics[], window: string[]) {
  return FIELDS.map((field) => {
    const z = zscores(series(days, window, field));
    const buckets: number[][] = Array.from({ length: 7 }, () => []);
    window.forEach((d, i) => {
      if (z[i] === null) return;
      const wd = (new Date(`${d}T12:00:00`).getDay() + 6) % 7;
      buckets[wd].push(z[i]!);
    });
    return { field, values: buckets.map((b) => (b.length ? b.reduce((x, y) => x + y, 0) / b.length : null)) };
  });
}

export type Anomaly = { day: string; field: Field; z: number; value: number };

/** Readings two or more standard deviations from your own mean. */
export function anomalies(days: DayMetrics[], window: string[], threshold = 2): Anomaly[] {
  const out: Anomaly[] = [];
  for (const field of FIELDS) {
    const vals = series(days, window, field);
    const z = zscores(vals);
    z.forEach((v, i) => {
      if (v !== null && Math.abs(v) >= threshold) out.push({ day: window[i], field, z: v, value: vals[i]! });
    });
  }
  return out.sort((a, b) => a.day.localeCompare(b.day));
}

/** Linear trend across the window: change per week and how well a straight line explains it (r²). */
export function trend(days: DayMetrics[], window: string[], field: Field) {
  const ys = series(days, window, field);
  const fit = pearson(ys.map((_, i) => i), ys);
  return fit ? { perWeek: fit.slope * 7, r2: fit.r * fit.r, n: fit.n } : null;
}

export type Axis = { label: string; value: number | null; detail: string };

/** Six lifestyle domains scored 0–100 against simple targets, for the balance radar. */
export function balance(days: DayMetrics[], window: string[], needMin = 480): Axis[] {
  const avg = (f: Field) => average(series(days, window, f));
  const clamp = (n: number) => Math.round(Math.max(0, Math.min(100, n)));
  const sleep = avg("sleepMin");
  const steps = avg("steps");
  const mood = avg("mood");
  const screen = avg("screenMin");
  const reg = sleepRegularity(days, window);
  const rec = average(recoveryIndex(days, window, needMin).map((d) => d.value));
  return [
    { label: "Sleep", value: sleep === null ? null : clamp((sleep / needMin) * 100), detail: sleep === null ? "No data" : `${Math.round(sleep / 6) / 10}h a night` },
    { label: "Movement", value: steps === null ? null : clamp((steps / 8000) * 100), detail: steps === null ? "No data" : `${Math.round(steps).toLocaleString("en-GB")} steps` },
    { label: "Recovery", value: rec === null ? null : clamp(rec), detail: rec === null ? "No data" : `Index ${Math.round(rec)}` },
    { label: "Mood", value: mood === null ? null : clamp(((mood - 1) / 4) * 100), detail: mood === null ? "No data" : `${mood.toFixed(1)} / 5` },
    { label: "Digital", value: screen === null ? null : clamp(100 - ((screen - 60) / 300) * 100), detail: screen === null ? "No data" : `${Math.round(screen / 6) / 10}h screens` },
    { label: "Rhythm", value: reg === null ? null : reg.score, detail: reg === null ? "No data" : `±${reg.sd} min a night` },
  ];
}

export type Insight = { title: string; detail: string; score: number; kind: "link" | "trend" | "rhythm" | "flag" };

const UNIT: Record<Field, (n: number) => string> = {
  sleepMin: (n) => `${Math.round(n)} min of sleep`,
  hrvMs: (n) => `${n.toFixed(1)} ms of HRV`,
  rhrBpm: (n) => `${n.toFixed(1)} bpm of resting HR`,
  steps: (n) => `${Math.round(n).toLocaleString("en-GB")} steps`,
  mood: (n) => `${n.toFixed(2)} points of mood`,
  screenMin: (n) => `${Math.round(n)} min of screen time`,
};

const PER: Record<Field, { size: number; label: string }> = {
  sleepMin: { size: 60, label: "each extra hour of sleep" },
  hrvMs: { size: 10, label: "every 10 ms more HRV" },
  rhrBpm: { size: 5, label: "every 5 bpm higher resting HR" },
  steps: { size: 2000, label: "every 2,000 extra steps" },
  mood: { size: 1, label: "each point higher mood" },
  screenMin: { size: 60, label: "each extra hour on screens" },
};

/** The findings worth reading first: strongest links (same day and next day), trends, weekly rhythm, outliers. */
export function insights(days: DayMetrics[], window: string[]): Insight[] {
  const out: Insight[] = [];
  const seen = new Set<string>();
  for (const lag of [1, 0]) {
    for (const a of FIELDS) {
      for (const b of FIELDS) {
        if (a === b) continue;
        const key = [a, b].sort().join("|") + lag;
        if (lag === 0 && seen.has(key)) continue;
        seen.add(key);
        const { xs, ys } = lagged(days, window, a, b, lag);
        const fit = pearson(xs, ys);
        if (!fit || fit.n < 8 || Math.abs(fit.r) < 0.35) continue;
        const per = PER[a];
        const effect = fit.slope * per.size;
        out.push({
          kind: "link",
          score: Math.abs(fit.r) * (lag ? 1.1 : 1),
          title: `${FIELD_LABEL[a]} ${lag ? "and the next day's" : "and"} ${lowerLabel(b)} move ${fit.r > 0 ? "together" : "in opposite directions"}`,
          detail: `For you, ${per.label} came with ${effect >= 0 ? "+" : "−"}${UNIT[b](Math.abs(effect))}${lag ? " the following day" : ""} (${strength(fit.r)} link, r = ${fit.r.toFixed(2)}, ${fit.n} days). A pattern, not proof of cause.`,
        });
      }
    }
  }
  for (const f of FIELDS) {
    const t = trend(days, window, f);
    if (!t || t.n < 10 || t.r2 < 0.25) continue;
    out.push({
      kind: "trend",
      score: t.r2 * 0.9,
      title: `${FIELD_LABEL[f]} is trending ${t.perWeek > 0 ? "up" : "down"}`,
      detail: `About ${t.perWeek > 0 ? "+" : "−"}${UNIT[f](Math.abs(t.perWeek))} a week over ${t.n} days (r² = ${t.r2.toFixed(2)}).`,
    });
  }
  for (const row of weekdayProfile(days, window)) {
    const wk = row.values.slice(0, 5).filter((v): v is number => v !== null);
    const we = row.values.slice(5).filter((v): v is number => v !== null);
    if (wk.length < 3 || !we.length) continue;
    const diff = we.reduce((a, b) => a + b, 0) / we.length - wk.reduce((a, b) => a + b, 0) / wk.length;
    if (Math.abs(diff) < 0.8) continue;
    out.push({
      kind: "rhythm",
      score: Math.min(0.8, Math.abs(diff) / 2),
      title: `${FIELD_LABEL[row.field]} shifts at the weekend`,
      detail: `Weekends run ${diff > 0 ? "higher" : "lower"} than weekdays by ${Math.abs(diff).toFixed(1)} of your usual spread. A steady weekly rhythm is easier on sleep and recovery.`,
    });
  }
  const recent = anomalies(days, window).filter((a) => window.slice(-7).includes(a.day));
  for (const a of recent.slice(-2)) {
    out.push({
      kind: "flag",
      score: 0.5,
      title: `Unusual ${lowerLabel(a.field)} on ${new Date(`${a.day}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long" })}`,
      detail: `${a.z > 0 ? "Higher" : "Lower"} than your usual by ${Math.abs(a.z).toFixed(1)} standard deviations. One day rarely means much; look for it repeating.`,
    });
  }
  return out.sort((x, y) => y.score - x.score).slice(0, 8);
}
