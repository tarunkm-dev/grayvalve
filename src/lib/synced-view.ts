import type { DayMetrics, SyncCategory } from "@/lib/sync-crypto";

/*
 * Shapes decrypted days for the dashboard charts. Pure, so it can be tested; unknown stays
 * unknown (null), never zero.
 */

/** `YYYY-MM-DD` in the viewer's own time zone. */
export function localDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** The last `n` calendar days ending today, oldest first. */
export function lastDays(today: Date, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (n - 1 - i));
    return localDay(d);
  });
}

export type Field = "sleepMin" | "steps" | "rhrBpm" | "hrvMs" | "mood" | "screenMin";

export const FIELD_CATEGORY: Record<Field, SyncCategory> = {
  sleepMin: "sleep",
  steps: "steps",
  rhrBpm: "rhr",
  hrvMs: "hrv",
  mood: "mood",
  screenMin: "screen",
};

/** One value per day in `window`, null where there's no reading. */
export function series(days: DayMetrics[], window: string[], field: Field): (number | null)[] {
  const byDay = new Map(days.map((d) => [d.day, d]));
  return window.map((day) => byDay.get(day)?.[field] ?? null);
}

/** The newest reading and its day, or null. */
export function latest(days: DayMetrics[], field: Field): { day: string; value: number } | null {
  for (let i = days.length - 1; i >= 0; i--) {
    const v = days[i][field];
    if (v !== null) return { day: days[i].day, value: v };
  }
  return null;
}

export function average(values: (number | null)[]) {
  const vals = values.filter((v): v is number => v !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

/**
 * The person's usual range: the middle 80% of up to 30 days, once there are at least 5 readings.
 * Personal baselines, not clinical norms.
 */
export function baseline(values: (number | null)[]): { low: number; high: number } | null {
  const vals = values.filter((v): v is number => v !== null).sort((a, b) => a - b);
  if (vals.length < 5) return null;
  const at = (p: number) => vals[Math.min(vals.length - 1, Math.max(0, Math.round(p * (vals.length - 1))))];
  return { low: at(0.1), high: at(0.9) };
}

/** Is this category shared in the newest synced day? Distinguishes "not shared" from "no reading". */
export function shared(days: DayMetrics[], category: SyncCategory) {
  const newest = days[days.length - 1];
  return newest ? newest.cats.includes(category) : false;
}

export function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

/** Bars need numbers: missing days draw as the minimum stub, and the label says so. */
export function barValues(values: (number | null)[]) {
  return values.map((v) => v ?? 0);
}

export function weekdayInitials(window: string[]) {
  return window.map((d) => new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { weekday: "narrow" }));
}

export type WindowSummary = { avg: number | null; total: number; min: number | null; max: number | null; count: number; best: string | null };

/** Totals and averages over a window of days, for the trends card. Missing days are skipped, not zeroed. */
export function summarise(days: DayMetrics[], window: string[], field: Field, bestIsHigh = true): WindowSummary {
  const vals = series(days, window, field);
  let best: string | null = null;
  let bestVal: number | null = null;
  vals.forEach((v, i) => {
    if (v === null) return;
    if (bestVal === null || (bestIsHigh ? v > bestVal : v < bestVal)) {
      bestVal = v;
      best = window[i];
    }
  });
  const present = vals.filter((v): v is number => v !== null);
  return {
    avg: average(vals),
    total: present.reduce((a, b) => a + b, 0),
    min: present.length ? Math.min(...present) : null,
    max: present.length ? Math.max(...present) : null,
    count: present.length,
    best,
  };
}

/** Change between the first and second half of a window, as a fraction (0.1 = up 10%). Null without enough data. */
export function halfChange(days: DayMetrics[], window: string[], field: Field): number | null {
  const half = Math.floor(window.length / 2);
  const a = average(series(days, window.slice(0, half), field));
  const b = average(series(days, window.slice(half), field));
  if (a === null || b === null || a === 0) return null;
  return (b - a) / a;
}
