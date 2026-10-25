import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseWaitlist } from "@/lib/waitlist";
import { contextSummary, fallbackAnswer, topicOf } from "@/lib/nano";
import { demoDays } from "@/lib/demo-data";
import { halfChange, lastDays, summarise } from "@/lib/synced-view";

const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

describe("waitlist", () => {
  it("normalises a sign-up and rejects bad emails and bots", () => {
    expect(parseWaitlist(form({ name: "  Asha ", email: " Asha@Example.com ", platform: "ios" }))).toEqual({ name: "Asha", email: "asha@example.com", platform: "ios" });
    expect(parseWaitlist(form({ email: "a@b.co", platform: "windows" }))).toMatchObject({ platform: "android" });
    expect(parseWaitlist(form({ email: "not-an-email" }))).toHaveProperty("error");
    expect(parseWaitlist(form({ email: "a@b.co", company: "Spam Inc" }))).toHaveProperty("error");
  });

  it("the table can't be read through the Data API", () => {
    const sql = readFileSync("supabase/migrations/20261026120000_waitlist.sql", "utf8").toLowerCase();
    expect(sql).toContain("enable row level security");
    expect(sql).not.toMatch(/create policy/);
    expect(sql).toContain("revoke all on table public.waitlist from anon, authenticated");
    expect(sql).toContain("on conflict (lower(email)) do nothing");
  });
});

describe("pairing comes first", () => {
  it("the dashboard layout shows only the pairing screen until a phone is paired", () => {
    const src = readFileSync("src/app/dashboard/layout.tsx", "utf8");
    expect(src).toMatch(/if \(!paired\) return <PairFirst/);
    expect(src.indexOf("PairFirst viewer")).toBeLessThan(src.indexOf("<DashShell"));
  });
});

describe("trends", () => {
  const today = new Date(2026, 9, 25);
  const days = demoDays(today);

  it("demo days are stable, 30 long, and keep gaps as unknown", () => {
    expect(days).toHaveLength(30);
    expect(demoDays(today)).toEqual(days);
    expect(days.at(-1)!.day).toBe("2026-10-25");
    expect(days.some((d) => d.mood === null)).toBe(true);
  });

  it("summarises a window without counting missing days as zero", () => {
    const d = (day: string, steps: number | null) => ({ day, cats: ["steps" as const], sleepMin: null, steps, rhrBpm: null, hrvMs: null, mood: null, screenMin: null });
    const window = lastDays(today, 4);
    const sum = summarise([d(window[0], 1000), d(window[2], 3000)], window, "steps");
    expect(sum).toEqual({ avg: 2000, total: 4000, min: 1000, max: 3000, count: 2, best: window[2] });
    expect(halfChange([d(window[0], 1000), d(window[3], 1500)], window, "steps")).toBeCloseTo(0.5);
    expect(halfChange([d(window[0], 1000)], window, "steps")).toBeNull();
  });
});

describe("Nano intelligence", () => {
  const today = new Date(2026, 9, 25);
  const days = demoDays(today);

  it("routes questions to a topic", () => {
    expect(topicOf("Plan my meals for a training day")).toBe("meals");
    expect(topicOf("Why am I so tired?")).toBe("sleep");
    expect(topicOf("Review my month")).toBe("review");
    expect(topicOf("hello")).toBe("general");
  });

  it("grounds the model's context in the summaries, and is honest without them", () => {
    const ctx = contextSummary(days, today);
    expect(ctx).toMatch(/Sleep: 7-day average \dh \d\dm/);
    expect(ctx).toMatch(/Steps: 7-day average [\d,]+/);
    expect(contextSummary([], today)).toMatch(/No summaries/);
  });

  it("built-in guidance answers every topic and points to help for worrying signs", () => {
    for (const q of ["meal prep", "sleep better", "stressed", "more steps", "resting heart", "review my week", "hi"]) {
      expect(fallbackAnswer(q, days, today).length).toBeGreaterThan(40);
    }
    expect(fallbackAnswer("I feel stressed", days, today)).toMatch(/crisis line/);
    expect(fallbackAnswer("review my month", [], today)).toMatch(/Once your phone streams/);
  });

  it("keeps nothing in browser storage and calls no server", () => {
    for (const f of ["src/components/nano/NanoChat.tsx", "src/app/dashboard/live/LiveNano.tsx", "src/app/demo/DemoViews.tsx", "src/lib/nano.ts"]) {
      const src = readFileSync(f, "utf8");
      expect(src).not.toMatch(/localStorage|sessionStorage|indexedDB/);
      expect(src).not.toMatch(/fetch\(|XMLHttpRequest|sendBeacon/);
    }
  });
});

describe("no trackers", () => {
  it("adds no analytics scripts", () => {
    const pkg = readFileSync("package.json", "utf8");
    expect(pkg).not.toMatch(/analytics|gtag|segment|posthog|mixpanel|hotjar|plausible/i);
    expect(readFileSync("src/app/layout.tsx", "utf8")).not.toMatch(/googletagmanager|gtag|<Script/);
  });
});
