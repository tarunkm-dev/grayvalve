"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import type { Organ } from "@/lib/body-content";
import s from "./BodyAtlas.module.css";

/*
 * The Body Atlas: pick an organ and see it rendered in the centre, with the signals that relate to
 * it and how to look after it. On the landing page it walks through the organs by itself while in
 * view, until the viewer picks one (never under reduced motion).
 */
export function BodyAtlas({ organs, autoPlay = false, caption }: { organs: Organ[]; autoPlay?: boolean; caption?: string }) {
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px -20% 0px" });
  const reduce = useReducedMotion();
  const organ = organs[index];

  useEffect(() => {
    if (!autoPlay || touched || reduce || !inView) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % organs.length), 5200);
    return () => clearInterval(t);
  }, [autoPlay, touched, reduce, inView, organs.length]);

  const pick = (i: number) => {
    setTouched(true);
    setIndex(i);
  };

  return (
    <div ref={ref} className={s.atlas} style={{ "--organ": organ.aura } as React.CSSProperties}>
      <div className={s.list} role="tablist" aria-label="Organs" aria-orientation="vertical">
        {organs.map((o, i) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            id={`organ-tab-${o.id}`}
            aria-selected={i === index}
            aria-controls="organ-panel"
            className={s.tab}
            onClick={() => pick(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowRight") pick((index + 1) % organs.length);
              if (e.key === "ArrowUp" || e.key === "ArrowLeft") pick((index - 1 + organs.length) % organs.length);
            }}
            tabIndex={i === index ? 0 : -1}
            style={{ "--c": o.aura } as React.CSSProperties}
          >
            <span className={s.tabDot} />
            <span className={s.tabName}>{o.name}</span>
            <span className={s.tabSys}>{o.system}</span>
            {i === index && autoPlay && !touched && !reduce && <span key={index} className={s.tabTimer} />}
          </button>
        ))}
      </div>

      <div className={s.stage} aria-hidden="true">
        <div className={s.rings}>
          <span />
          <span />
          <span />
        </div>
        <div className={s.scan} />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={organ.id}
            className={s.render}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.86, rotate: -6, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08, rotate: 6, filter: "blur(10px)" }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <Image src={`/organs/${organ.id}.webp`} alt="" width={720} height={720} sizes="(max-width: 900px) 80vw, 460px" priority={index === 0} />
          </motion.div>
        </AnimatePresence>
        <span className={s.stageLabel}>
          {String(index + 1).padStart(2, "0")} / {String(organs.length).padStart(2, "0")} · {organ.system}
        </span>
      </div>

      <div id="organ-panel" role="tabpanel" aria-labelledby={`organ-tab-${organ.id}`} className={s.panel}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={organ.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className={s.panelInner}
          >
            <h3 className={s.organName}>{organ.name}</h3>
            <p className={s.summary}>{organ.summary}</p>
            <ul className={s.signals}>
              {organ.signals.map((sig, k) => (
                <motion.li key={sig.name} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + k * 0.08 }}>
                  <span className={s.sigName}>{sig.name}</span>
                  <span className={s.sigValue}>
                    {sig.value}
                    {sig.unit && <small>{sig.unit}</small>}
                  </span>
                  {sig.band !== undefined && (
                    <span className={s.band} aria-hidden="true">
                      <span className={s.bandUsual} />
                      <motion.i initial={{ left: "0%" }} animate={{ left: `${Math.round(sig.band * 100)}%` }} transition={{ delay: 0.25, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }} />
                    </span>
                  )}
                  <span className={s.sigNote}>{sig.note}</span>
                </motion.li>
              ))}
            </ul>
            <div className={s.care}>
              <span className={s.careTitle}>How to look after it</span>
              <ul>
                {organ.care.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            {caption && <p className={s.caption}>{caption}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
