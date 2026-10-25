"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

/*
 * Scroll-linked motion helpers on Motion. Each one is a no-op under reduced motion.
 */

/** Moves its children against the scroll: speed 0.2 drifts 20% of the travel, negative goes the other way. */
export function Parallax({ children, speed = 0.2, className, style }: { children: ReactNode; speed?: number; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  return (
    <motion.div ref={ref} className={className} style={{ ...style, y: reduce ? 0 : y }}>
      {children}
    </motion.div>
  );
}

/** Tilts a panel up from a 3D lean to flat as it enters, like a laptop lid opening. */
export function TiltIn({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const rotateX = useTransform(p, [0, 1], [28, 0]);
  const scale = useTransform(p, [0, 1], [0.86, 1]);
  const opacity = useTransform(p, [0, 0.4], [0.3, 1]);
  return (
    <div style={{ perspective: 1400 }}>
      <motion.div ref={ref} className={className} style={{ ...style, ...(reduce ? {} : { rotateX, scale, opacity, transformOrigin: "50% 100%" }) }}>
        {children}
      </motion.div>
    </div>
  );
}

/** Fades and lifts children in when they scroll into view; `delay` staggers siblings. */
export function Reveal({ children, delay = 0, className, style, y = 32 }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties; y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
