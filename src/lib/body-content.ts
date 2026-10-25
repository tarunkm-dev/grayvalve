/*
 * Organ guides for the Body Atlas, from the app's twelve organ guides. Values are illustrative demo
 * readings; pages that have the person's own numbers pass them in instead. Guidance only:
 * Grayvalve never diagnoses.
 */

export type OrganSignal = {
  /** Which synced field fills this in, when the phone shares it. */
  field?: "sleepMin" | "steps" | "rhrBpm" | "hrvMs" | "mood" | "screenMin";
  name: string;
  value: string;
  unit?: string;
  /** Position of the reading inside its usual band, 0–1, for the little range bar. */
  band?: number;
  note: string;
};

export type Organ = {
  id: string;
  name: string;
  system: string;
  aura: string;
  summary: string;
  signals: OrganSignal[];
  care: string[];
};

export const organs: Organ[] = [
  {
    id: "heart",
    name: "Heart",
    system: "Cardiovascular",
    aura: "var(--ember)",
    summary: "Resting heart rate and heart-rate variability show how recovered you are and how much load you're carrying.",
    signals: [
      { field: "rhrBpm", name: "Resting HR", value: "58", unit: "bpm", band: 0.35, note: "Inside your usual 55–64" },
      { field: "hrvMs", name: "HRV", value: "62", unit: "ms", band: 0.78, note: "↑ 6% vs your baseline" },
    ],
    care: ["Two easy zone-2 sessions this week", "Keep caffeine before 14:00", "A 10-minute walk after your largest meal"],
  },
  {
    id: "brain",
    name: "Brain",
    system: "Nervous system",
    aura: "var(--violet)",
    summary: "Sleep, mood and screen time shape focus and stress more than any single habit.",
    signals: [
      { field: "sleepMin", name: "Sleep", value: "6h 50m", band: 0.55, note: "Target 8h · 2 wake-ups" },
      { field: "mood", name: "Mood", value: "4", unit: "/ 5", band: 0.75, note: "Self-reported this morning" },
      { field: "screenMin", name: "Screen time", value: "3h 12m", band: 0.5, note: "38 min after 22:00" },
    ],
    care: ["Same wake time, weekends included", "Screens down 45 minutes before bed", "Four minutes of box breathing at 15:00"],
  },
  {
    id: "lungs",
    name: "Lungs",
    system: "Respiratory",
    aura: "var(--ocean)",
    summary: "Overnight breathing rate and blood oxygen are quiet signals of recovery and illness coming on.",
    signals: [
      { name: "Blood oxygen", value: "97", unit: "%", band: 0.7, note: "Overnight average" },
      { name: "Respiratory rate", value: "14.2", unit: "/min", band: 0.45, note: "Steady for 7 nights" },
    ],
    care: ["Slow nasal breathing on walks", "Air the bedroom before sleep", "Resonance breathing, 6 breaths a minute"],
  },
  {
    id: "stomach",
    name: "Stomach",
    system: "Digestive",
    aura: "var(--amber)",
    summary: "Meal timing affects energy dips and sleep. Grayvalve looks for patterns, never causes.",
    signals: [
      { name: "Last meal", value: "19:40", band: 0.6, note: "2h 50m before bed" },
      { name: "Eating window", value: "10h 20m", band: 0.5, note: "7-day average" },
    ],
    care: ["Protein with breakfast", "Finish eating three hours before bed", "Prepare tomorrow's lunch tonight"],
  },
  {
    id: "kidneys",
    name: "Kidneys",
    system: "Renal",
    aura: "var(--jade)",
    summary: "Hydration you log, and recovery after hard days.",
    signals: [{ name: "Hydration", value: "1.4", unit: "L", band: 0.4, note: "Logged today · goal 2.2 L" }],
    care: ["A glass of water with every meal", "More fluids on training days", "Go easy on salt in the evening"],
  },
  {
    id: "liver",
    name: "Liver",
    system: "Metabolic",
    aura: "var(--signal)",
    summary: "Rest, regular meals and steady movement support the organ that works hardest while you sleep.",
    signals: [{ field: "steps", name: "Steps", value: "6,800", band: 0.62, note: "Goal 8,000" }],
    care: ["Alcohol-free weekdays", "Fibre at every meal", "Stand up and move every hour"],
  },
];

export const mindPractices = [
  { name: "Box breathing", meta: "4 · 4 · 4 · 4", minutes: 4, aura: "var(--ocean)" },
  { name: "NSDR · 10", meta: "Non-sleep deep rest", minutes: 10, aura: "var(--violet)" },
  { name: "Body scan", meta: "Guided meditation", minutes: 12, aura: "var(--magenta)" },
  { name: "Two-back", meta: "Working-memory practice", minutes: 6, aura: "var(--signal)" },
];
