"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

/*
 * A paragraph whose words light up one after another as it scrolls through the viewport.
 * Adapted from React Bits' ScrollReveal (reactbits.dev, MIT + Commons Clause) on Motion.
 * Words wrapped in *asterisks* are drawn in the accent colour.
 */

function Word({ word, progress, range, accent }: { word: string; progress: MotionValue<number>; range: [number, number]; accent: boolean }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity, color: accent ? "var(--signal)" : undefined }}>
      {word}{" "}
    </motion.span>
  );
}

export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  if (reduce) {
    return (
      <p ref={ref} className={className}>
        {words.map((w, i) => (
          <span key={i} style={{ color: w.startsWith("*") ? "var(--signal)" : undefined }}>
            {w.replace(/\*/g, "")}{" "}
          </span>
        ))}
      </p>
    );
  }
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} word={w.replace(/\*/g, "")} accent={w.startsWith("*")} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
      ))}
    </p>
  );
}
