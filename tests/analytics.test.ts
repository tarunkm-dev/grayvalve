import { describe, expect, it } from "vitest";
import { anomalies, balance, cognitiveLoad, correlationMatrix, insights, lagged, pearson, recoveryIndex, sleepDebt, sleepRegularity, stats, trend, weekdayProfile, zscores } from "@/lib/analytics";
import { demoDays } from "@/lib/demo-data";
import { lastDays } from "@/lib/synced-view";

const today = new Date(2026, 9, 25);
const window = lastDays(today, 30);
const days = demoDays(today);

describe("statistics", () => {
  it("skips missing values instead of counting them as zero", () => {
    expect(stats([2, null, 4, 6])).toEqual({ mean: 4, sd: 2, n: 3 });
    expect(stats([1, null])).toBeNull();
    expect(zscores([2, null, 4, 6])).toEqual([-1, null, 0, 1]);
  });

  it("fits a line and a correlation, and refuses with too few pairs", () => {
    const fit = pearson([1, 2, 3, 4, 5, 6], [3, 5, 7, 9, 11, 13])!;
    expect(fit.r).toBeCloseTo(1);
    expect(fit.slope).toBeCloseTo(2);
    expect(fit.intercept).toBeCloseTo(1);
    expect(pearson([1, 2, 3], [1, 2, 3])).toBeNull();
    expect(pearson([1, 2, 3, 4, 5, 6], [5, 5, 5, 5, 5, 5])).toBeNull();
  });

  it("lines up today's value with tomorrow's", () => {
    const d = (day: string, sleepMin: number, mood: number) => ({ day, cats: [], sleepMin, steps: null, rhrBpm: null, hrvMs: null, mood, screenMin: null });
    const w = lastDays(today, 3);
    const { xs, ys } = lagged([d(w[0], 400, 1), d(w[1], 410, 2), d(w[2], 420, 3)], w, "sleepMin", "mood", 1);
    expect(xs).toEqual([400, 410]);
    expect(ys).toEqual([2, 3]);
  });
});

describe("dashboard analytics on the demo month", () => {
  it("builds a symmetric same-day correlation matrix with an empty diagonal", () => {
    const m = correlationMatrix(days, window, 0);
    expect(m).toHaveLength(6);
    expect(m[0][0]).toBeNull();
    expect(m[0][1]!.r).toBeCloseTo(m[1][0]!.r);
  });

  it("scores recovery, sleep debt, regularity and load in range", () => {
    for (const r of recoveryIndex(days, window)) if (r.value !== null) expect(r.value).toBeGreaterThanOrEqual(0), expect(r.value).toBeLessThanOrEqual(100);
    expect(sleepDebt(days, window).at(-1)!.value).toBeGreaterThanOrEqual(0);
    expect(sleepRegularity(days, window)!.score).toBeGreaterThan(0);
    for (const c of cognitiveLoad(days, window)) if (c.value !== null) expect(c.value).toBeLessThanOrEqual(100);
    expect(balance(days, window).map((a) => a.label)).toEqual(["Sleep", "Movement", "Recovery", "Mood", "Digital", "Rhythm"]);
  });

  it("finds the links built into the demo, and words them as patterns", () => {
    const found = insights(days, window);
    expect(found.length).toBeGreaterThan(2);
    expect(found.some((i) => i.kind === "link")).toBe(true);
    for (const i of found.filter((x) => x.kind === "link")) expect(i.detail).toMatch(/not proof of cause/);
    expect(weekdayProfile(days, window)).toHaveLength(6);
    expect(trend(days, window, "steps")!.n).toBe(30);
  });

  it("flags only readings far from the person's own usual", () => {
    for (const a of anomalies(days, window)) expect(Math.abs(a.z)).toBeGreaterThanOrEqual(2);
    expect(anomalies([], window)).toEqual([]);
    expect(insights([], window)).toEqual([]);
  });
});
