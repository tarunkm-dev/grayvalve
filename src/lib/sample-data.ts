/*
 * Sample data for the dashboard until a paired phone syncs real values (a later migration).
 * Every screen that shows it carries a visible "Sample data" label.
 */

export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const dayInitials = ["M", "T", "W", "T", "F", "S", "S"];

export const sample = {
  readiness: { value: 72, confidence: "medium", inputs: 3, of: 4, missing: ["HRV"], week: [61, 64, 58, 70, 66, 74, 72] },
  nextMove: {
    title: "A 20-minute walk before your 14:00 call",
    reason: "Based on 6h 50m of sleep, a steady check-in and little movement so far.",
  },
  sleep: {
    total: "6h 50m",
    minutes: 410,
    target: 480,
    week: [7.4, 6.8, 7.9, 6.2, 7.1, 8.3, 6.8],
    segments: [
      { stage: "Light", min: 30 },
      { stage: "Deep", min: 55 },
      { stage: "Light", min: 40 },
      { stage: "REM", min: 25 },
      { stage: "Awake", min: 8 },
      { stage: "Light", min: 50 },
      { stage: "Deep", min: 35 },
      { stage: "REM", min: 40 },
      { stage: "Light", min: 45 },
      { stage: "REM", min: 30 },
      { stage: "Awake", min: 7 },
    ] as { stage: "Awake" | "REM" | "Light" | "Deep"; min: number }[],
  },
  hrv: { value: 62, low: 48, high: 66, week: [55, 58, 51, 60, 57, 64, 62] },
  restingHr: { value: 58, low: 55, high: 64, week: [60, 59, 62, 58, 59, 57, 58] },
  steps: { today: 6800, week: [6200, 8400, 5100, 9900, 7300, 11200, 6800], goal: 8000 },
  mind: { minutes: [8, 0, 12, 10, 5, 20, 14], sessions: 9 },
  focus: { minutes: 75, goal: 120, week: [50, 90, 45, 120, 75, 0, 75] },
  mood: { week: [3, 3, 4, 2, 4, 5, 4] as (number | null)[], energy: [3, 2, 4, 3, 3, 4, 4] as (number | null)[], stress: [3, 4, 2, 4, 2, 1, 2] as (number | null)[] },
  checkins: [1, 1, 0.6, 1, null, 1, 1, 0.6, 1, 1, null, 1, 1, 1] as (number | null)[],
  routines: { done: 4, total: 6 },
  goals: { progress: 0.42 },
  vitals: [
    { name: "Blood oxygen", value: "97", unit: "%", note: "Fresh · 6:40" },
    { name: "Respiratory rate", value: "14.2", unit: "/min", note: "Overnight average" },
    { name: "Skin temperature", value: "+0.1", unit: "°C", note: "vs baseline" },
    { name: "VO₂ max", value: "41", unit: "ml/kg/min", note: "Estimated" },
    { name: "Hydration", value: "1.4", unit: "L", note: "Logged today" },
    { name: "Weight", value: "Not set", unit: "", note: "Add in the app" },
  ],
};
