import type { DayMetrics } from "@/lib/sync-crypto";
import { insights, recoveryIndex, sleepDebt } from "@/lib/analytics";
import { formatMinutes, halfChange, lastDays, summarise, type Field } from "@/lib/synced-view";

/*
 * Nano intelligence: what the dashboard assistant knows and how it answers when Gemini Nano isn't
 * available. Pure functions, so they're tested. Everything here runs in the viewer's browser; the
 * summaries are built from data already on screen and are never sent anywhere.
 */

export const NANO_SYSTEM = [
  "You are Nano intelligence, the assistant inside the Grayvalve web dashboard. You run on-device in the person's browser.",
  "Give practical, kind, specific wellbeing guidance: health improvements, sleep, movement, stress, meal preparation and habit tracking.",
  "Use the person's summaries below when they are relevant, and say when data is missing instead of guessing.",
  "Describe patterns, never causes. You are not a doctor: never diagnose, never name medication doses, and suggest a clinician for anything worrying (chest pain, fainting, very low mood or thoughts of self-harm: urge urgent help).",
  "Keep answers under 180 words. Use short bullet points where they help. No markdown headings.",
].join(" ");

type Line = { field: Field; label: string; fmt: (n: number) => string };

const LINES: Line[] = [
  { field: "sleepMin", label: "Sleep", fmt: (n) => formatMinutes(n) },
  { field: "steps", label: "Steps", fmt: (n) => Math.round(n).toLocaleString("en-GB") },
  { field: "rhrBpm", label: "Resting heart rate", fmt: (n) => `${Math.round(n)} bpm` },
  { field: "hrvMs", label: "HRV", fmt: (n) => `${Math.round(n)} ms` },
  { field: "mood", label: "Mood (1-5, self-reported)", fmt: (n) => n.toFixed(1) },
  { field: "screenMin", label: "Screen time", fmt: (n) => formatMinutes(n) },
];

/** A compact plain-text summary of the last 7 and 30 days for the model's context. */
export function contextSummary(days: DayMetrics[], today = new Date()): string {
  if (!days.length) return "No summaries are available yet: the person's phone isn't streaming.";
  const week = lastDays(today, 7);
  const month = lastDays(today, 30);
  const rows = LINES.map((l) => {
    const w = summarise(days, week, l.field);
    const m = summarise(days, month, l.field);
    if (!w.count && !m.count) return `${l.label}: not shared or no readings.`;
    const ch = halfChange(days, month, l.field);
    const trend = ch === null ? "" : ` (30-day trend ${ch >= 0 ? "+" : ""}${Math.round(ch * 100)}%)`;
    return `${l.label}: 7-day average ${w.avg === null ? "n/a" : l.fmt(w.avg)}, 30-day average ${m.avg === null ? "n/a" : l.fmt(m.avg)}${trend}.`;
  });
  const debt = sleepDebt(days, month).at(-1)?.value;
  const rec = [...recoveryIndex(days, month)].reverse().find((r) => r.value !== null)?.value;
  const found = insights(days, month)
    .slice(0, 4)
    .map((i) => `- ${i.title}: ${i.detail}`);
  const extra = [
    debt != null ? `Sleep debt over the last 14 nights: ${formatMinutes(debt)}.` : "",
    rec != null ? `Today's estimated recovery index: ${rec}/100.` : "",
    found.length ? `Patterns in their data (correlations, not causes):\n${found.join("\n")}` : "",
  ].filter(Boolean);
  return `Daily summaries from the person's phone:\n${rows.join("\n")}${extra.length ? `\n${extra.join("\n")}` : ""}`;
}

export type Topic = "sleep" | "meals" | "stress" | "move" | "review" | "heart" | "general";

export function topicOf(question: string): Topic {
  const q = question.toLowerCase();
  if (/meal|food|eat|diet|recipe|prep|breakfast|lunch|dinner|protein|grocer|shopping/.test(q)) return "meals";
  if (/sleep|tired|bed|insomnia|nap|wake/.test(q)) return "sleep";
  if (/stress|anxi|mood|calm|overwhelm|focus|mind|breath/.test(q)) return "stress";
  if (/step|walk|run|exercise|train|workout|move|gym|cardio/.test(q)) return "move";
  if (/heart|hrv|pulse|recovery|resting/.test(q)) return "heart";
  if (/review|week|month|summary|trend|progress|track/.test(q)) return "review";
  return "general";
}

function stat(days: DayMetrics[], field: Field, n: number, today: Date) {
  return summarise(days, lastDays(today, n), field).avg;
}

/**
 * Built-in guidance for browsers without Gemini Nano: rule-based, grounded in the same summaries,
 * and clearly labelled as such in the interface.
 */
export function fallbackAnswer(question: string, days: DayMetrics[], today = new Date()): string {
  const sleep = stat(days, "sleepMin", 7, today);
  const steps = stat(days, "steps", 7, today);
  const rhr = stat(days, "rhrBpm", 7, today);
  const hrv = stat(days, "hrvMs", 7, today);
  const mood = stat(days, "mood", 7, today);
  const screen = stat(days, "screenMin", 7, today);
  const hasData = days.length > 0;

  switch (topicOf(question)) {
    case "sleep":
      return [
        sleep !== null ? `You've averaged ${formatMinutes(sleep)} a night this week${sleep < 420 ? ", under the 7 hours most adults need" : ", a solid base"}.` : "I can't see sleep data yet.",
        "• Keep the same wake time every day, weekends included.",
        "• Dim screens 45 minutes before bed" + (screen !== null && screen > 180 ? ` (screen time is ${formatMinutes(screen)} a day).` : "."),
        "• Caffeine before 14:00, and a cool, dark bedroom.",
        "• If you wake at night, try 4-7-8 breathing instead of checking the time.",
      ].join("\n");
    case "meals":
      return [
        steps !== null && steps > 9000 ? "You're moving a lot this week, so plan for a bit more carbohydrate around activity." : "A balanced plate for a steady day:",
        "• Breakfast: oats with Greek yoghurt, berries and nuts.",
        "• Lunch: chicken or tofu, brown rice, roast vegetables, olive oil.",
        "• Snack: an apple with peanut butter, or hummus and carrots.",
        "• Dinner: salmon or lentils, potatoes, a big green salad. Finish three hours before bed.",
        "Prep tip: cook the grains and roast two trays of vegetables on Sunday; they cover three lunches.",
      ].join("\n");
    case "stress":
      return [
        mood !== null ? `Your check-in mood has averaged ${mood.toFixed(1)} out of 5 this week.` : "I don't have check-in mood for this week.",
        "• Four minutes of box breathing (4 in, 4 hold, 4 out, 4 hold) at your usual afternoon dip.",
        "• A 10-minute walk outside after lunch: daylight and movement both help.",
        "• Write down the one thing that matters most tomorrow before you stop work.",
        "If low mood lasts more than two weeks, or you have thoughts of harming yourself, please contact a clinician or a crisis line now.",
      ].join("\n");
    case "move":
      return [
        steps !== null ? `You're averaging ${Math.round(steps).toLocaleString("en-GB")} steps a day.` : "I can't see step data yet.",
        steps !== null && steps < 7000 ? "• Add two 10-minute walks: after lunch and after dinner." : "• Keep two easy days a week so recovery keeps up.",
        "• Two zone-2 sessions (you can still talk in full sentences), 30–40 minutes each.",
        "• Two short strength sessions: squats, push-ups, rows, planks.",
        hrv !== null ? `• Your HRV averages ${Math.round(hrv)} ms; on days well below that, go easy.` : "• On days you feel run down, swap training for a walk.",
      ].join("\n");
    case "heart":
      return [
        rhr !== null ? `Resting heart rate averages ${Math.round(rhr)} bpm this week.` : "I can't see resting heart rate yet.",
        hrv !== null ? `HRV averages ${Math.round(hrv)} ms. Higher than your own usual usually means you're well recovered.` : "",
        "• Regular easy cardio and good sleep are the most reliable ways to lower resting heart rate over time.",
        "• Alcohol and late meals often raise it the next morning.",
        "These are wellbeing signals, not a diagnosis. Chest pain, fainting or a racing heart at rest need a clinician.",
      ]
        .filter(Boolean)
        .join("\n");
    case "review":
      return hasData
        ? `Here's your month:\n${contextSummary(days, today).split("\n").slice(1).map((l) => `• ${l}`).join("\n")}\nPick one thing to improve next week. Sleep consistency usually moves everything else.`
        : "Once your phone streams its summaries, I can review your week and month here.";
    default:
      return [
        "I can help with:",
        "• Points to improve your health, from your sleep, steps, heart and mood.",
        "• Meal preparation: day plans, prep lists and shopping lists.",
        "• Sleep and stress routines.",
        "• Weekly and monthly reviews of your trends.",
        "Try: \"Plan my meals for a training day\" or \"Review my month\".",
      ].join("\n");
  }
}
