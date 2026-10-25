"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Phone } from "@/components/Phone";
import { DotMatrix } from "@/components/DotMatrix";
import { RangeBand, TickMeter } from "@/components/charts";
import { Aurora } from "@/components/motion/Aurora";
import { BlurText } from "@/components/motion/BlurText";
import { Magnet } from "@/components/motion/Magnet";
import s from "./Hero.module.css";

/** A layer that drifts with the pointer and the scroll by its own depth, for a parallax stage. */
function Layer({ depth, px, py, scroll, className, children }: { depth: number; px: MotionValue<number>; py: MotionValue<number>; scroll: MotionValue<number>; className?: string; children: React.ReactNode }) {
  const x = useTransform(px, (v) => v * depth * 40);
  const y = useTransform([py, scroll] as MotionValue<number>[], ([a, b]: number[]) => a * depth * 40 - b * depth * 260);
  return (
    <motion.div className={className} style={{ x, y }}>
      {children}
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 18 });
  const py = useSpring(my, { stiffness: 60, damping: 18 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const still = useMotionValue(0);
  const scroll = reduce ? still : scrollYProgress;
  const copyY = useTransform(scroll, [0, 1], [0, 140]);
  const copyOpacity = useTransform(scroll, [0, 0.7], [1, 0]);
  const artScale = useTransform(scroll, [0, 1], [1, 1.25]);

  return (
    <section
      ref={ref}
      className={s.hero}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      <Aurora stops={["#8d74f0", "#e2fc5b", "#d4553e"]} amplitude={1.2} />
      <motion.div className={s.art} style={{ scale: artScale }} aria-hidden="true">
        <Image src="/art/lime-glass.webp" alt="" fill priority sizes="60vw" style={{ objectFit: "cover" }} />
      </motion.div>
      <div className={s.horizon} aria-hidden="true" />

      <div className={`container ${s.grid}`}>
        <motion.div className={s.copy} style={{ y: copyY, opacity: copyOpacity }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="shiny">Private, on-device AI · production release soon</span>
          </motion.span>
          <BlurText as="h1" className={`display ${s.title}`} text={"Your day,\nintelligently tuned."} accent={["tuned"]} accentClassName="accent-text" trigger="mount" delay={0.15} />
          <motion.p className="lede" style={{ marginTop: 28 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}>
            Grayvalve reads how you slept, asks how you&apos;re arriving, and builds a realistic day around your rhythm. Body and mind in one
            calm place, and everything stays on your phone.
          </motion.p>
          <motion.div className="row wrap gap-12" style={{ marginTop: 36 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}>
            <Magnet>
              <Link href="#waitlist" className="btn btn-primary">
                Join the waitlist
                <span className="chevrons" aria-hidden="true">
                  <span>›</span>
                  <span>›</span>
                  <span>›</span>
                </span>
              </Link>
            </Magnet>
            <Link href="#story" className="btn btn-glass">
              Watch a day unfold
            </Link>
          </motion.div>
          <motion.ul className={s.trust} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}>
            <li>Encrypted on device</li>
            <li>Gemini Nano on your phone</li>
            <li>Wellbeing guidance, not medical advice</li>
          </motion.ul>
        </motion.div>

        <div className={s.stage}>
          <Layer depth={0.35} px={px} py={py} scroll={scroll} className={s.phoneLayer}>
            <motion.div initial={reduce ? false : { opacity: 0, y: 80, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 1.2, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}>
              <Phone src="/screens/today.webp" alt="Grayvalve Today screen with readiness and the next move" priority className={s.phone} />
            </motion.div>
          </Layer>

          <Layer depth={0.9} px={px} py={py} scroll={scroll} className={`${s.float} ${s.floatA}`}>
            <motion.div className="aura aura-jade" initial={reduce ? false : { opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 0.9 }}>
              <div className={s.floatInner}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className={s.floatLabel}>Recovery</span>
                  <span className="badge">↑ 6%</span>
                </div>
                <div className="row gap-8" style={{ alignItems: "baseline" }}>
                  <DotMatrix value="62" dot={7} color="#fff" label="HRV 62 milliseconds" />
                  <span className={s.floatSub}>ms HRV</span>
                </div>
                <RangeBand value={62} low={48} high={66} min={30} max={80} label="HRV 62, within baseline 48 to 66" />
              </div>
            </motion.div>
          </Layer>

          <Layer depth={1.3} px={px} py={py} scroll={scroll} className={`${s.float} ${s.floatB}`}>
            <motion.div className="aura aura-ocean" initial={reduce ? false : { opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1, duration: 0.9 }}>
              <div className={s.floatInner}>
                <span className={s.floatLabel}>Sleep</span>
                <div className="tnum" style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.03em" }}>
                  7h 40m
                </div>
                <TickMeter value={8} total={12} label="7 hours 40 minutes of sleep" />
              </div>
            </motion.div>
          </Layer>

          <Layer depth={0.6} px={px} py={py} scroll={scroll} className={`${s.float} ${s.floatC}`}>
            <motion.div className={s.suggest} initial={reduce ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.35, duration: 0.9 }}>
              <span className={s.star} aria-hidden="true">
                ✦
              </span>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Gray suggests</div>
                <div style={{ fontWeight: 500 }}>Take four minutes to breathe</div>
              </div>
            </motion.div>
          </Layer>
        </div>
      </div>

      <a href="#manifesto" className={s.scrollCue} aria-label="Scroll to read more">
        <span />
      </a>
    </section>
  );
}
