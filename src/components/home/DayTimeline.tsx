"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Phone } from "@/components/Phone";
import styles from "./DayTimeline.module.css";

export type DayStop = { time: string; title: string; body: string; screen: string; aura: string };

/** A horizontally scrolling day: real app screens in the order you'd meet them. */
export function DayTimeline({ stops }: { stops: DayStop[] }) {
  const track = useRef<HTMLOListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth > el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const item = el.querySelector("li");
    const w = item ? item.getBoundingClientRect().width + 24 : 300;
    el.scrollBy({ left: dir * w * 2, behavior: "smooth" });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <button type="button" className={styles.arrow} onClick={() => step(-1)} disabled={atStart} aria-label="Earlier in the day">
          ‹
        </button>
        <button type="button" className={styles.arrow} onClick={() => step(1)} disabled={atEnd} aria-label="Later in the day">
          ›
        </button>
      </div>

      <ol ref={track} className={`${styles.track} ${atStart ? "" : styles.fadeL} ${atEnd ? "" : styles.fadeR}`} onScroll={update}>
        {stops.map((s) => (
          <li key={s.time} className={styles.stop}>
            <div className={styles.rail}>
              <span className={styles.dot} style={{ background: s.aura, boxShadow: `0 0 14px ${s.aura}` }} />
              <time className={styles.time}>{s.time}</time>
            </div>
            <Phone src={`/screens/${s.screen}.webp`} alt={`Grayvalve at ${s.time}: ${s.title}`} className={styles.phone} />
            <div className={styles.copy}>
              <strong>{s.title}</strong>
              <span>{s.body}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
