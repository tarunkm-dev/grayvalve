/*
 * Product content for the site. Sourced from the Android app's docs/FEATURES.md,
 * docs/GRAYVALVE_FUTURE_STRATEGY.md and docs/release/ROADMAP.md, so the site never claims
 * something the app doesn't do. Future hardware is always labelled as a concept.
 */

export type Aura = "jade" | "dusk" | "ocean" | "ember" | "amber" | "violet" | "signal" | "graphite";

export type Hotspot = { x: number; y: number; title: string; body: string };

export type Showcase = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  screen: string;
  aura: Aura;
  hotspots: Hotspot[];
};

/** The three permanent destinations, with annotated elements of each real capture. */
export const roots: Showcase[] = [
  {
    id: "today",
    label: "Today",
    eyebrow: "Root 01 · Today",
    title: "One clear next move, every morning.",
    body: "An editorial greeting, your week at a glance, an estimated readiness score that tells you what it's missing, and the single most useful action right now.",
    screen: "/screens/today.webp",
    aura: "ember",
    hotspots: [
      { x: 18, y: 17, title: "Personal greeting", body: "Composed from your time of day, mood, sleep and next agenda item. Stable for the day." },
      { x: 58, y: 24.5, title: "Week strip", body: "Monday to Sunday, today highlighted. Each day shows whether you checked in fully, briefly or not at all." },
      { x: 50, y: 40, title: "Readiness, honestly", body: "LED-style dot-matrix score from 0 to 100, labelled Estimated, with the inputs it used and the ones it didn't." },
      { x: 50, y: 67, title: "Your next move", body: "One action with its reason, a start button and an easy 'Not now'. Powered by Gray Intelligence." },
    ],
  },
  {
    id: "gray",
    label: "Gray",
    eyebrow: "Root 02 · Gray",
    title: "An assistant that lives on your phone.",
    body: "Gray runs on-device with Gemini Nano. It plans routes, starts focus, logs habits and coaches goals. It only proposes, and you approve, decline or undo every action.",
    screen: "/screens/gray.webp",
    aura: "violet",
    hotspots: [
      { x: 50, y: 25.5, title: "The Gray star", body: "A four-point star with light flowing inside. Its halo grows while Gray listens, thinks and speaks." },
      { x: 30, y: 39.5, title: "Model status", body: "Shows whether on-device Gemini Nano is available. Built-in rule skills take over when it isn't." },
      { x: 50, y: 49.5, title: "Starter prompts", body: "'Find the best walk near home', 'Start a 25 minute focus'. Gray asks your preferences instead of assuming." },
      { x: 50, y: 92, title: "Hold to talk", body: "Hold the Gray tab anywhere to speak. On-device speech recognition, with no Google dialog." },
    ],
  },
  {
    id: "spaces",
    label: "Spaces",
    eyebrow: "Root 03 · Spaces",
    title: "Every part of your life, one connected world.",
    body: "Routines, Grow, Body, Move, Mind, Insights and Systems. Each is a living aura card with its own tracker, so you see progress before you tap.",
    screen: "/screens/spaces.webp",
    aura: "ocean",
    hotspots: [
      { x: 75, y: 19, title: "Routines & Grow", body: "Habit rings and goal progress, each with a round arrow to open the space." },
      { x: 25, y: 46, title: "Body", body: "A wave of your energy check-ins this week." },
      { x: 75, y: 50.5, title: "Move", body: "A sketch of your last route or bars of kilometres per day." },
      { x: 82, y: 72, title: "Mind & Insights", body: "Practice minutes and a mood wave for the week." },
    ],
  },
];

export type FeatureGroup = {
  id: string;
  name: string;
  aura: Aura;
  summary: string;
  screen: string;
  items: { title: string; body: string }[];
};

export const featureGroups: FeatureGroup[] = [
  {
    id: "checkin",
    name: "Daily check-in",
    aura: "dusk",
    summary: "A gentle daily gate before the day begins. It resets at 04:30 and always has a safety exit.",
    screen: "/screens/checkin.webp",
    items: [
      { title: "Mood, energy and stress", body: "Rate each from 1 to 5, with a word for every value." },
      { title: "Sleep, without guessing", body: "No default value. Choose 'I'm not sure' to leave it unknown." },
      { title: "Context tags", body: "Work, sleep, exercise, social and more, so Insights can see what lifts or drains you." },
      { title: "Help is always visible", body: "'Need help now?' opens a helpline finder. Crisis words show urgent-care cards immediately." },
    ],
  },
  {
    id: "focus",
    name: "Focus",
    aura: "ocean",
    summary: "A full-screen ocean aura that brightens as you work, with 14 focus types and procedural sound.",
    screen: "/screens/focus.webp",
    items: [
      { title: "Dot-matrix countdown", body: "MM:SS in LED dots with an arc gauge of progress." },
      { title: "Tick ruler", body: "Set any length from 5 to 120 minutes. Labels for deep work, study, creative and admin." },
      { title: "Durable sessions", body: "Survives the app being closed. It comes back paused and marked interrupted, and logs only after a safe save." },
      { title: "Soundscapes", body: "Fourteen focus types with procedural sound and research notes." },
    ],
  },
  {
    id: "mind",
    name: "Mind",
    aura: "violet",
    summary: "Breathwork, guided meditation, NSDR and cognitive practice, narrated on the phone.",
    screen: "/screens/mind.webp",
    items: [
      { title: "8 breathwork patterns", body: "Box, 4-7-8, coherent, physiological sigh, resonance and more, each with a live breath trace." },
      { title: "8 guided meditations", body: "From morning intention to sleep wind-down, with continuous narration." },
      { title: "NSDR 10 and 20", body: "Non-sleep deep rest with a toe-to-crown journey and a slowly drifting aura." },
      { title: "Practice", body: "Colour words, two-back and breath counting, each with an evidence card and practice scores." },
    ],
  },
  {
    id: "body",
    name: "Body",
    aura: "jade",
    summary: "Fifteen Health Connect signals with honest freshness, baselines and confidence.",
    screen: "/screens/body.webp",
    items: [
      { title: "15 signals", body: "Steps, heart rate, resting HR, HRV, sleep, VO₂ max, SpO₂, temperature, hydration and more." },
      { title: "Baselines, not guesses", body: "7-day average, a personal baseline from the prior three weeks, coverage and confidence." },
      { title: "12 organ guides", body: "How each organ contributes, how to look after it, linked signals and exercises." },
      { title: "Records", body: "Scan documents with on-device OCR, review them, and keep them as encrypted PDFs." },
    ],
  },
  {
    id: "move",
    name: "Move & Exercises",
    aura: "amber",
    summary: "Live GPS tracking on Mapbox, Gray's route guide, and 36 guided moves.",
    screen: "/screens/exercises.webp",
    items: [
      { title: "Walk, jog, run, ride", body: "Speed gauge, time, distance, pace and climb, durable like Focus." },
      { title: "Gray's routes", body: "Asks length and what matters (parks, quiet, well-lit), then rejects bad routes honestly." },
      { title: "Guided routines", body: "Morning mobility, desk reset, beginner strength, core ten and more." },
      { title: "Exercise player", body: "Countdown ring, spoken cues, switch sides and rest breaks." },
    ],
  },
  {
    id: "grow",
    name: "Grow & Routines",
    aura: "signal",
    summary: "Goals that become actions, and habits you can see building up.",
    screen: "/screens/grow.webp",
    items: [
      { title: "Journey path", body: "A glowing curve that links milestone nodes. Finished steps light up." },
      { title: "Ask Gray for next steps", body: "Five concrete, measurable steps. Tick the ones to add." },
      { title: "Versioned plans", body: "Months, then weeks, with dependencies. Replanning keeps finished steps." },
      { title: "Habit heat grid", body: "Daily targets, streaks, reminders and a 12-week history." },
    ],
  },
  {
    id: "journal",
    name: "Journal & Insights",
    aura: "amber",
    summary: "Private reflection and patterns described honestly, never as causes.",
    screen: "/screens/journal.webp",
    items: [
      { title: "Prompts by time of day", body: "Write freely, add photos and videos, and rate your mood. Every entry is encrypted." },
      { title: "Gray's summary", body: "A short on-device summary after you save, stored encrypted." },
      { title: "Cross-space insights", body: "A correlation matrix, where your time went, and a mood trend annotated with events." },
      { title: "Export", body: "PDF and Excel exports with a preview first." },
    ],
  },
  {
    id: "night",
    name: "Bedtime & Night report",
    aura: "dusk",
    summary: "A wind-down that respects you, and a report of the day worth keeping.",
    screen: "/screens/nsdr.webp",
    items: [
      { title: "Bedtime Mode", body: "Full-screen wind-down, an optional Do Not Disturb, and locks you choose." },
      { title: "Night report", body: "Check-in, focus, movement, mind, routines, journal and sleep cards, from 19:00." },
      { title: "Share cards", body: "Story and wide formats with safe areas for Instagram and WhatsApp." },
      { title: "Usage summary", body: "Screen time, pickups and late-night minutes, which you grant." },
    ],
  },
];

export const securityPoints = [
  { k: "AES-256", title: "Encrypted vault", body: "SQLCipher database with its key sealed in Android Keystore, using StrongBox when the phone has it." },
  { k: "0 KB", title: "No personal uploads", body: "Health data, journal and check-ins stay on the phone. No cloud backup, by design." },
  { k: "Lock", title: "Biometric app lock", body: "Fingerprint, face or PIN, with auto-lock. Sensitive screens aren't drawn while locked." },
  { k: "Log", title: "Activity log", body: "Every write, approval and permission change is recorded as a short code, never as personal text." },
  { k: "Undo", title: "You approve every action", body: "Gray shows the reason, a before/after diff, scope and risk. Reversible actions can be undone." },
  { k: "Erase", title: "Erase everything", body: "Crypto-erase destroys the keys, database, media, records and preferences in one step." },
];

export const stats = [
  { value: "15", label: "Health Connect signals, each with its own consent" },
  { value: "57", label: "accessible charts, each with a table view and spoken summary" },
  { value: "12", label: "organ guides linking your signals to everyday care" },
  { value: "0", label: "bytes of personal data sent to our servers" },
];

export type Horizon = {
  when: string;
  title: string;
  status: "Live" | "Building" | "Next" | "Research" | "Vision";
  body: string;
  items: string[];
};

export const horizons: Horizon[] = [
  {
    when: "Now",
    title: "A trustworthy daily loop",
    status: "Live",
    body: "The Android app: check-in, readiness, Gray on-device, Spaces, Mind, Body, Move and encrypted records.",
    items: ["On-device Gemini Nano", "15 Health Connect signals", "Encrypted vault and app lock", "Night report and share cards"],
  },
  {
    when: "Next 3–12 months",
    title: "Your health on every screen",
    status: "Building",
    body: "This website, a secure account and a web dashboard. Phones pair with the dashboard over an encrypted channel.",
    items: ["Supabase account and login", "Web dashboard", "Device pairing by QR or code", "Encrypted export and restore"],
  },
  {
    when: "Years 1–3",
    title: "The first Grayvalve wearable",
    status: "Research",
    body: "A sensor built around what the app already understands: sleep, recovery, stress and movement, with clear provenance.",
    items: ["Continuous HR, HRV and skin temperature", "Sleep stages and respiratory rate", "Stress signals for mental health", "Bluetooth LE to the phone"],
  },
  {
    when: "Years 3–6",
    title: "Advanced care, with clinicians",
    status: "Research",
    body: "Medical-grade devices that go through the regulatory pathway they need, and summaries you choose to share with your care team.",
    items: ["ECG-grade rhythm patch", "Clinician summaries you preview first", "Care plans with expiring access", "Regulatory clearance before any claim"],
  },
  {
    when: "Years 6–10",
    title: "Continuity across new interfaces",
    status: "Vision",
    body: "Your history and preferences survive new phones, wearables and assistive devices, and measurements recalibrate instead of silently comparing.",
    items: ["Portable personal memory", "Assistive and ambient adapters", "Provider independence", "You stay in control of every grant"],
  },
];

export type DeviceConcept = {
  name: string;
  kind: string;
  aura: Aura;
  body: string;
  signals: string[];
  art: string;
};

export const deviceConcepts: DeviceConcept[] = [
  {
    name: "Grayvalve Pulse",
    kind: "Wrist sensor · concept",
    aura: "signal",
    body: "All-day heart rate, HRV, SpO₂ and skin temperature feeding readiness and the night report, with no screen to distract you.",
    signals: ["Heart rate", "HRV", "SpO₂", "Skin temp", "Sleep stages"],
    art: "/art/lime-glass.webp",
  },
  {
    name: "Grayvalve Patch",
    kind: "Clinical patch · concept",
    aura: "ember",
    body: "A thin adhesive sensor for ECG-grade rhythm, respiratory rate and electrodermal activity, a window into stress and mental load.",
    signals: ["ECG rhythm", "Respiration", "EDA / stress", "Posture"],
    art: "/art/protein.webp",
  },
  {
    name: "Grayvalve Sense",
    kind: "Bedside companion · concept",
    aura: "violet",
    body: "Contact-free breathing and sleep-environment sensing for the bedroom: light, sound, temperature and air, with no camera.",
    signals: ["Breathing", "Room climate", "Light & noise", "Wind-down"],
    art: "/art/neural.webp",
  },
];
