"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/*
 * A number that counts up to its value the first time it scrolls into view.
 * Adapted from React Bits' CountUp (reactbits.dev, MIT + Commons Clause). The final value is in
 * the HTML from the start, so it reads correctly without JavaScript and for screen readers.
 */
export function CountUp({ to, from = 0, duration = 1.6, decimals = 0, className, format }: {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const show = (n: number) => (format ? format(n) : n.toFixed(decimals));

  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const el = ref.current;
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = show(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, to, from, duration]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {show(to)}
    </span>
  );
}
