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
  let prevScreen = 220;
  let prevSteps = 7000;
  return lastDays(today, n).map((day, i) => {
    const weekend = [0, 6].includes(new Date(`${day}T12:00:00`).getDay());
    const trend = i / n; // a gentle improvement across the month
    // Late screens the evening before cost sleep; an active day helps it a little.
    const sleepMin = Math.round(400 + trend * 30 + (weekend ? 40 : 0) - (prevScreen - 220) * 0.35 + (prevSteps - 7000) * 0.004 + (rand() - 0.5) * 60);
    const short = 480 - sleepMin;
    const steps = Math.round(5600 + trend * 2000 + (weekend ? 2800 : 0) + (rand() - 0.45) * 2800);
    const screenMin = Math.round(225 - trend * 35 + (weekend ? 45 : 0) + (rand() - 0.5) * 80);
    const gap = i === 9 || i === 20; // two days without a check-in
    const day0: DayMetrics = {
      day,
      cats: ALL,
      sleepMin,
      steps,
      // Short sleep and a hard day before lower HRV and raise resting heart rate.
      rhrBpm: Math.round(60 - trend * 3 + short * 0.03 + (prevSteps > 11000 ? 1.5 : 0) + (rand() - 0.5) * 3),
      hrvMs: Math.round(56 + trend * 8 - short * 0.09 - (prevSteps > 11000 ? 3 : 0) + (rand() - 0.5) * 7),
      mood: gap ? null : Math.max(1, Math.min(5, Math.round(3.4 + trend * 0.6 - short / 90 - (screenMin - 220) / 160 + (rand() - 0.5) * 1.2))),
      screenMin,
    };
    prevScreen = screenMin;
    prevSteps = steps;
    return day0;
  });
}
