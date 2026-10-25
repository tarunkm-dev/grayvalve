"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import s from "./BreathOrb.module.css";

const PHASES = [
  { label: "Breathe in", scale: 1 },
  { label: "Hold", scale: 1 },
  { label: "Breathe out", scale: 0.62 },
  { label: "Hold", scale: 0.62 },
];

/** A box-breathing guide (4 · 4 · 4 · 4) as a glowing orb. Still, with the pattern written out, under reduced motion. */
export function BreathOrb({ seconds = 4, size = 320 }: { seconds?: number; size?: number }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), seconds * 1000);
    return () => clearInterval(t);
  }, [reduce, seconds]);

  return (
    <div className={s.wrap} style={{ width: size, maxWidth: "100%" }}>
      <div className={s.track} />
      <motion.div
        className={s.orb}
        initial={false}
        animate={{ scale: reduce ? 0.8 : PHASES[phase].scale }}
        transition={{ duration: seconds, ease: "easeInOut" }}
      />
      <motion.div
        className={s.halo}
        initial={false}
        animate={{ scale: reduce ? 0.9 : PHASES[phase].scale * 1.18, opacity: phase === 0 || phase === 1 ? 0.9 : 0.4 }}
        transition={{ duration: seconds, ease: "easeInOut" }}
      />
      <div className={s.label} aria-live="off">
        <strong>{reduce ? "Box breathing" : PHASES[phase].label}</strong>
        <span>4 · 4 · 4 · 4</span>
      </div>
    </div>
  );
}
