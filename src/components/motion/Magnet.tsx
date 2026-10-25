"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/*
 * Pulls its child gently toward the pointer when it comes near.
 * Adapted from React Bits' Magnet (reactbits.dev, MIT + Commons Clause). Fine pointers only.
 */
export function Magnet({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

  if (reduce) return <div className={className} style={{ display: "inline-flex" }}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y, display: "inline-flex" }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
