import type { DayMetrics } from "@/lib/sync-crypto";
import { lastDays } from "@/lib/synced-view";

/*
 * Demo days for the demo dashboard: 30 days in the same shape the paired phone sends, so the demo
 * uses exactly the same views as the real dashboard. Deterministic (the same numbers on every
 * visit), plausible, with a few gaps, because unknown stays unknown. Never mixed with real data.
 */

const ALL = ["sleep", "steps", "rhr", "hrv", "mood", "screen"] as DayMetrics["cats"];

/** Small seeded generator so the demo is stable across renders and visits. */
function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoDays(today: Date, n = 30): DayMetrics[] {
  const rand = rng(20261026);
  return lastDays(today, n).map((day, i) => {
    const weekend = [0, 6].includes(new Date(`${day}T12:00:00`).getDay());
    const trend = i / n; // a gentle improvement across the month
    const sleepMin = Math.round(380 + trend * 40 + (weekend ? 45 : 0) + (rand() - 0.5) * 70);
    const gap = i === 9 || i === 20; // two days without a check-in
    return {
      day,
      cats: ALL,
      sleepMin,
      steps: Math.round(5200 + trend * 2200 + (weekend ? 2600 : 0) + (rand() - 0.4) * 3000),
      rhrBpm: Math.round(61 - trend * 3 + (rand() - 0.5) * 4),
      hrvMs: Math.round(52 + trend * 9 + (sleepMin > 420 ? 4 : -2) + (rand() - 0.5) * 8),
      mood: gap ? null : Math.max(1, Math.min(5, Math.round(3 + trend + (sleepMin > 420 ? 0.6 : -0.4) + (rand() - 0.5) * 1.6))),
      screenMin: Math.round(230 - trend * 40 + (weekend ? 50 : 0) + (rand() - 0.5) * 60),
    };
  });
}
