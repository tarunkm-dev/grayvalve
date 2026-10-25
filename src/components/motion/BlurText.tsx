"use client";

import { motion, useReducedMotion } from "motion/react";
import { createElement, Fragment } from "react";

/*
 * Headline that resolves word by word out of a blur.
 * Adapted from React Bits' BlurText (reactbits.dev, MIT + Commons Clause) on Motion.
 * Screen readers get the whole sentence once; the animated words are hidden from them.
 * `\n` in the text starts a new line. `accent` words are drawn in the accent style.
 */

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  stagger?: number;
  accent?: string[];
  accentClassName?: string;
  /** Animate when scrolled into view (default) or immediately on mount. */
  trigger?: "view" | "mount";
  style?: React.CSSProperties;
};

export function BlurText({ text, as = "h2", className, delay = 0, stagger = 0.07, accent = [], accentClassName, trigger = "view", style }: Props) {
  const reduce = useReducedMotion();
  const lines = text.split("\n");
  let i = 0;

  const words = lines.map((line, li) => (
    <Fragment key={li}>
      {li > 0 && <br />}
      {line.split(" ").map((w, wi) => {
        const n = i++;
        const isAccent = accent.includes(w.replace(/[.,!?]/g, ""));
        const style = { display: "inline-block", whiteSpace: "pre" as const };
        const content = `${w}${wi < line.split(" ").length - 1 ? " " : ""}`;
        if (reduce) {
          return (
            <span key={wi} style={style} className={isAccent ? accentClassName : undefined}>
              {content}
            </span>
          );
        }
        const anim = { opacity: 1, filter: "blur(0px)", y: 0 };
        return (
          <motion.span
            key={wi}
            style={style}
            className={isAccent ? accentClassName : undefined}
            initial={{ opacity: 0, filter: "blur(12px)", y: 28 }}
            {...(trigger === "view" ? { whileInView: anim, viewport: { once: true, margin: "0px 0px -10% 0px" } } : { animate: anim })}
            transition={{ duration: 0.9, delay: delay + n * stagger, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {content}
          </motion.span>
        );
      })}
    </Fragment>
  ));

  return createElement(
    as,
    { className, style },
    <span className="sr-only">{text.replace(/\n/g, " ")}</span>,
    <span aria-hidden="true">{words}</span>,
  );
}
