"use client";

import { Children, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/** Floats the sign-in art cards in one by one, then lets them drift gently. */
export function AuthStage({ children, positions }: { children: ReactNode; positions: string[] }) {
  const reduce = useReducedMotion();
  return (
    <>
      {Children.map(children, (child, i) =>
        reduce ? (
          <div className={positions[i]}>{child}</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: [0, -10, 0], filter: "blur(0px)" }}
            transition={{
              opacity: { duration: 0.8, delay: 0.3 + i * 0.18 },
              filter: { duration: 0.8, delay: 0.3 + i * 0.18 },
              y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: 1 + i * 0.4 },
            }}
            className={positions[i]}
          >
            {child}
          </motion.div>
        ),
      )}
    </>
  );
}
