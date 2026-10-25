"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import s from "./DayStory.module.css";

/*
 * "A day with Grayvalve": a scroll-driven story. On wide screens the scene pins (CSS sticky) and
 * GSAP ScrollTrigger maps the scroll through it to chapters; the clock, copy, phone screen and
 * aura colour change as you go. On phones and under reduced motion it's a plain list of chapters,
 * so the whole story is readable without any scrolling trick.
 */

export type Chapter = {
  time: string;
  kicker: string;
  title: string;
  body: string;
  screen: string;
  aura: string;
  stat: { label: string; value: string };
};

export function DayStory({ chapters }: { chapters: Chapter[] }) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 960px) and (prefers-reduced-motion: no-preference)", () => {
      setPinned(true);
      return () => setPinned(false);
    });
    return () => mm.revert();
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!pinned || !el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        setActive(Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length)));
        if (bar.current) bar.current.style.transform = `scaleY(${self.progress})`;
      },
    });
    // The phone floats slightly against the scroll for depth.
    const tween = gsap.fromTo(
      el.querySelector(`.${s.phoneWrap}`),
      { yPercent: 6 },
      { yPercent: -6, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 } },
    );
    ScrollTrigger.refresh();
    return () => {
      st.kill();
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [pinned, chapters.length]);

  const c = chapters[active];

  if (!pinned) {
    return (
      <div ref={root} className={s.stacked}>
        {chapters.map((ch) => (
          <article key={ch.time} className={s.stackItem} style={{ "--aura": ch.aura } as React.CSSProperties}>
            <div>
              <span className={s.time}>{ch.time}</span>
              <span className={s.kicker}>{ch.kicker}</span>
              <h3 className={s.title}>{ch.title}</h3>
              <p className={s.body}>{ch.body}</p>
              <div className={s.stat}>
                <span>{ch.stat.label}</span>
                <strong>{ch.stat.value}</strong>
              </div>
            </div>
            <div className={`phone ${s.stackPhone}`}>
              <div className="phone-screen">
                <Image src={`/screens/${ch.screen}.webp`} alt={`Grayvalve ${ch.kicker} screen`} fill sizes="240px" />
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div ref={root} className={s.track} style={{ height: `${chapters.length * 90 + 40}vh`, "--aura": c.aura } as React.CSSProperties}>
      <div className={s.scene}>
        <div className={s.glow} aria-hidden="true" />
        <div className={`container ${s.grid}`}>
          <div className={s.rail} aria-hidden="true">
            <span className={s.railFill} ref={bar} />
            {chapters.map((ch, i) => (
              <span key={ch.time} className={`${s.railTick} ${i <= active ? s.railOn : ""}`} style={{ top: `${(i / (chapters.length - 1)) * 100}%` }}>
                <em>{ch.time}</em>
              </span>
            ))}
          </div>

          <div className={s.copy} aria-live="polite">
            <div key={c.time} className={s.copyIn}>
              <span className={s.clock}>{c.time}</span>
              <span className={s.kicker}>{c.kicker}</span>
              <h3 className={s.titleBig}>{c.title}</h3>
              <p className={s.body}>{c.body}</p>
              <div className={s.stat}>
                <span>{c.stat.label}</span>
                <strong>{c.stat.value}</strong>
              </div>
            </div>
          </div>

          <div className={s.phoneWrap}>
            <div className="phone">
              <div className="phone-screen">
                {chapters.map((ch, i) => (
                  <Image
                    key={ch.screen + i}
                    src={`/screens/${ch.screen}.webp`}
                    alt={i === active ? `Grayvalve ${ch.kicker} screen` : ""}
                    fill
                    sizes="320px"
                    className={`${s.screen} ${i === active ? s.screenOn : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
