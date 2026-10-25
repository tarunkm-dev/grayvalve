"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import s from "./NanoShowcase.module.css";

/*
 * A scripted preview of Nano intelligence in the dashboard: the conversation types itself out
 * when it scrolls into view. Illustrative only; the real assistant runs on Gemini Nano in the
 * viewer's own browser.
 */

const script = [
  { from: "you", text: "My energy crashes every afternoon. What should I change?" },
  {
    from: "nano",
    text: "Your afternoon dips line up with nights under 7 hours and lunches after 14:00. Try lunch by 13:00, a 10-minute walk after it, and caffeine before noon. I'll compare next week.",
  },
  { from: "you", text: "Plan tomorrow's meals around a 6 km run." },
  {
    from: "nano",
    text: "Breakfast: oats, Greek yoghurt, berries. Lunch: chicken, rice and greens. Snack 90 min pre-run: banana and toast. Dinner: salmon, potatoes, salad. Hydration target: 2.6 L.",
  },
];

export function NanoShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? script.length : 0);

  useEffect(() => {
    if (reduce) {
      setShown(script.length);
      return;
    }
    if (!inView || shown >= script.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 300 : 1700);
    return () => clearTimeout(t);
  }, [inView, shown, reduce]);

  return (
    <div ref={ref} className={s.window}>
      <div className={s.bar}>
        <span className={s.orb} aria-hidden="true" />
        <div>
          <strong>Nano intelligence</strong>
          <span>Gemini Nano · running in this browser</span>
        </div>
        <span className={s.badge}>
          <span className="pulse-dot" aria-hidden="true" /> On-device
        </span>
      </div>
      <div className={s.log}>
        <AnimatePresence initial={false}>
          {script.slice(0, shown).map((m, i) => (
            <motion.div
              key={i}
              className={`${s.msg} ${m.from === "you" ? s.you : s.nano}`}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {shown < script.length && shown > 0 && (
          <div className={`${s.msg} ${s.nano} ${s.typing}`} aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
      <div className={s.chips}>
        {["Improve my sleep", "Meal prep for the week", "Weekly health review", "Build a training plan"].map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
    </div>
  );
}
