"use client";

import { useState } from "react";
import { Phone } from "@/components/Phone";
import type { Showcase } from "@/lib/content";
import styles from "./RootShowcase.module.css";

export function RootShowcase({ roots }: { roots: Showcase[] }) {
  const [tab, setTab] = useState(0);
  const [pin, setPin] = useState(0);
  const root = roots[tab];

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs} role="tablist" aria-label="Grayvalve destinations">
        {roots.map((r, i) => (
          <button
            key={r.id}
            role="tab"
            id={`tab-${r.id}`}
            aria-selected={i === tab}
            aria-controls={`panel-${r.id}`}
            className={`${styles.tab} ${i === tab ? styles.tabOn : ""}`}
            onClick={() => {
              setTab(i);
              setPin(0);
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className={styles.grid} role="tabpanel" id={`panel-${root.id}`} aria-labelledby={`tab-${root.id}`}>
        <div className={styles.copy}>
          <span className="eyebrow">{root.eyebrow}</span>
          <h3 className="h2" style={{ marginTop: 18 }}>
            {root.title}
          </h3>
          <p className="lede" style={{ marginTop: 18 }}>
            {root.body}
          </p>

          <ol className={styles.list}>
            {root.hotspots.map((h, i) => (
              <li key={h.title}>
                <button
                  className={`${styles.item} ${i === pin ? styles.itemOn : ""}`}
                  onClick={() => setPin(i)}
                  onMouseEnter={() => setPin(i)}
                  aria-pressed={i === pin}
                >
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <strong>{h.title}</strong>
                    <span className={styles.itemBody}>{h.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.stage}>
          <div className={`aura aura-${root.aura} no-frame ${styles.glow}`} aria-hidden="true" />
          <Phone key={root.id} src={root.screen} alt={`Grayvalve ${root.label} screen`} className={styles.phone}>
            {root.hotspots.map((h, i) => (
              <button
                key={h.title}
                className={`${styles.pin} ${i === pin ? styles.pinOn : ""}`}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                onClick={() => setPin(i)}
                aria-label={`${i + 1}: ${h.title}`}
              >
                {i + 1}
              </button>
            ))}
          </Phone>
        </div>
      </div>
    </div>
  );
}
