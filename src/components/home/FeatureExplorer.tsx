"use client";

import { useState } from "react";
import { Phone } from "@/components/Phone";
import type { FeatureGroup } from "@/lib/content";
import styles from "./FeatureExplorer.module.css";

export function FeatureExplorer({ groups }: { groups: FeatureGroup[] }) {
  const [active, setActive] = useState(0);
  const g = groups[active];

  return (
    <div className={styles.wrap}>
      <div className={styles.chips} role="tablist" aria-label="Feature areas">
        {groups.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={i === active}
            className={`chip ${i === active ? "on" : ""}`}
            style={{ cursor: "pointer", height: 40, padding: "0 18px", fontSize: 14 }}
            onClick={() => setActive(i)}
          >
            {x.name}
          </button>
        ))}
      </div>

      <div className={`aura aura-${g.aura} ${styles.panel}`} role="tabpanel">
        <div className={styles.copy}>
          <span className="eyebrow plain" style={{ color: "rgba(255,255,255,0.75)" }}>
            {String(active + 1).padStart(2, "0")} / {String(groups.length).padStart(2, "0")}
          </span>
          <h3 className="h2" style={{ marginTop: 14 }}>
            {g.name}
          </h3>
          <p className="lede" style={{ marginTop: 14, color: "rgba(243,241,236,0.82)" }}>
            {g.summary}
          </p>
          <div className={styles.items}>
            {g.items.map((it) => (
              <div key={it.title} className={styles.item}>
                <strong>{it.title}</strong>
                <span>{it.body}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.device}>
          <Phone key={g.id} src={g.screen} alt={`Grayvalve ${g.name} screen`} className={styles.phone} />
        </div>
      </div>
    </div>
  );
}
