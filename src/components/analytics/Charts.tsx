"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Fit } from "@/lib/analytics";
import s from "./Charts.module.css";

/*
 * Analytics charts: plain SVG, sized by viewBox so they scale to any card, drawn in with Motion
 * (still under reduced motion). Every chart has a text label for screen readers; missing days are
 * gaps, never zeros.
 */

const W = 640;

function short(day: string) {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export type Line = { label: string; color: string; values: (number | null)[]; dashed?: boolean; area?: boolean };

/** Multi-series line chart over days, with an optional shaded band (usual range) and flagged days. */
export function LineChart({
  days,
  lines,
  height = 220,
  min,
  max,
  band,
  flags = [],
  unit = "",
  label,
}: {
  days: string[];
  lines: Line[];
  height?: number;
  min?: number;
  max?: number;
  band?: { low: number; high: number; label: string };
  flags?: number[];
  unit?: string;
  label: string;
}) {
  const reduce = useReducedMotion();
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const all = lines.flatMap((l) => l.values.filter((v): v is number => v !== null)).concat(band ? [band.low, band.high] : []);
  const lo = min ?? (all.length ? Math.min(...all) : 0);
  const hi = max ?? (all.length ? Math.max(...all) : 1);
  const pad = { l: 36, r: 12, t: 14, b: 26 };
  const x = (i: number) => pad.l + (i / Math.max(1, days.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / Math.max(1e-9, hi - lo)) * (height - pad.t - pad.b);
  const path = (vals: (number | null)[]) => {
    let d = "";
    let pen = false;
    vals.forEach((v, i) => {
      if (v === null) return (pen = false);
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };
  const ticks = [lo, (lo + hi) / 2, hi];

  return (
    <div className={s.chart}>
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label} onPointerLeave={() => setHover(null)}>
        <defs>
          {lines.map((l, k) => (
            <linearGradient key={k} id={`${gid}-a${k}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={l.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={l.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t, k) => (
          <g key={k}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className={s.grid} />
            <text x={pad.l - 6} y={y(t) + 4} className={s.axis} textAnchor="end">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {band && (
          <g>
            <rect x={pad.l} width={W - pad.l - pad.r} y={y(band.high)} height={Math.max(1, y(band.low) - y(band.high))} className={s.band} />
            <text x={W - pad.r - 4} y={y(band.high) - 4} className={s.axis} textAnchor="end">
              {band.label}
            </text>
          </g>
        )}
        {flags.map((i) => (
          <line key={i} x1={x(i)} x2={x(i)} y1={pad.t} y2={height - pad.b} className={s.flag} />
        ))}
        {lines.map((l, k) => {
          const d = path(l.values);
          if (!d) return null;
          return (
            <g key={l.label}>
              {l.area && <path d={`${d}L${x(l.values.length - 1)},${height - pad.b}L${x(l.values.findIndex((v) => v !== null))},${height - pad.b}Z`} fill={`url(#${gid}-a${k})`} />}
              <motion.path
                d={d}
                fill="none"
                stroke={l.color}
                strokeWidth={2.2}
                strokeDasharray={l.dashed ? "5 5" : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: k * 0.15, ease: [0.2, 0.7, 0.2, 1] }}
              />
            </g>
          );
        })}
        {[0, Math.floor((days.length - 1) / 2), days.length - 1].map((i) => (
          <text key={i} x={x(i)} y={height - 6} className={s.axis} textAnchor={i === 0 ? "start" : i === days.length - 1 ? "end" : "middle"}>
            {days[i] ? short(days[i]) : ""}
          </text>
        ))}
        {days.map((_, i) => (
          <rect key={i} x={x(i) - (W / days.length) / 2} width={W / days.length} y={0} height={height} fill="transparent" onPointerEnter={() => setHover(i)} />
        ))}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={height - pad.b} className={s.cursor} />
            {lines.map((l) => (l.values[hover] !== null ? <circle key={l.label} cx={x(hover)} cy={y(l.values[hover]!)} r={4} fill={l.color} stroke="#000" strokeWidth={2} /> : null))}
          </g>
        )}
      </svg>
      <div className={s.legendRow}>
        {lines.map((l) => (
          <span key={l.label}>
            <i style={{ background: l.color }} /> {l.label}
            {hover !== null && <b>{l.values[hover] === null ? "—" : `${Math.round(l.values[hover]! * 10) / 10}${unit}`}</b>}
          </span>
        ))}
        {hover !== null && <em>{short(days[hover])}</em>}
      </div>
    </div>
  );
}

/** Correlation matrix: colour is direction and strength; click a cell to explore that pair. */
export function Matrix({ labels, cells, selected, onPick, label }: { labels: string[]; cells: (Fit | null)[][]; selected: [number, number]; onPick: (a: number, b: number) => void; label: string }) {
  return (
    <div className={s.matrix} role="grid" aria-label={label} style={{ gridTemplateColumns: `minmax(70px, auto) repeat(${labels.length}, minmax(0, 1fr))` }}>
      <span />
      {labels.map((l) => (
        <span key={l} className={s.mHead} role="columnheader">
          {l}
        </span>
      ))}
      {cells.map((row, i) => (
        <div key={i} role="row" style={{ display: "contents" }}>
          <span className={s.mRow} role="rowheader">
            {labels[i]}
          </span>
          {row.map((c, j) => {
            const r = c?.r ?? 0;
            const on = selected[0] === i && selected[1] === j;
            const bg = c ? (r > 0 ? `rgba(159, 208, 183, ${Math.abs(r) * 0.85})` : `rgba(212, 85, 62, ${Math.abs(r) * 0.85})`) : "rgba(255,255,255,0.03)";
            return (
              <button
                key={j}
                type="button"
                role="gridcell"
                className={`${s.cell} ${on ? s.cellOn : ""}`}
                style={{ background: bg }}
                disabled={!c}
                onClick={() => onPick(i, j)}
                aria-label={c ? `${labels[i]} and ${labels[j]}: r ${r.toFixed(2)}, ${c.n} days` : `${labels[i]} and ${labels[j]}: not enough data`}
              >
                {c ? r.toFixed(2) : "·"}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Scatter plot with the least-squares line. */
export function Scatter({ xs, ys, fit, xLabel, yLabel, color = "var(--signal)", label }: { xs: (number | null)[]; ys: (number | null)[]; fit: Fit | null; xLabel: string; yLabel: string; color?: string; label: string }) {
  const reduce = useReducedMotion();
  const H = 300;
  const pts = xs.map((x, i) => [x, ys[i]] as const).filter((p): p is readonly [number, number] => p[0] !== null && p[1] !== null);
  if (pts.length < 2) return <p className={s.empty}>Not enough days with both readings yet.</p>;
  const pad = { l: 44, r: 14, t: 14, b: 40 };
  const [x0, x1] = [Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0]))];
  const [y0, y1] = [Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))];
  const sx = (v: number) => pad.l + ((v - x0) / Math.max(1e-9, x1 - x0)) * (W - pad.l - pad.r);
  const sy = (v: number) => pad.t + (1 - (v - y0) / Math.max(1e-9, y1 - y0)) * (H - pad.t - pad.b);
  return (
    <div className={s.chart}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={sy(y0 + t * (y1 - y0))} y2={sy(y0 + t * (y1 - y0))} className={s.grid} />
            <text x={pad.l - 6} y={sy(y0 + t * (y1 - y0)) + 4} className={s.axis} textAnchor="end">
              {Math.round(y0 + t * (y1 - y0))}
            </text>
            <text x={sx(x0 + t * (x1 - x0))} y={H - 22} className={s.axis} textAnchor={t === 0 ? "start" : t === 1 ? "end" : "middle"}>
              {Math.round(x0 + t * (x1 - x0))}
            </text>
          </g>
        ))}
        <text x={W / 2} y={H - 4} className={s.axisTitle} textAnchor="middle">
          {xLabel}
        </text>
        <text x={12} y={H / 2} className={s.axisTitle} textAnchor="middle" transform={`rotate(-90 12 ${H / 2})`}>
          {yLabel}
        </text>
        {fit && (
          <motion.line
            x1={sx(x0)}
            y1={sy(fit.intercept + fit.slope * x0)}
            x2={sx(x1)}
            y2={sy(fit.intercept + fit.slope * x1)}
            stroke={color}
            strokeWidth={2}
            strokeDasharray="6 5"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 0.8 }}
          />
        )}
        {pts.map(([px, py], i) => (
          <motion.circle
            key={`${i}-${px}-${py}`}
            cx={sx(px)}
            cy={sy(py)}
            r={5}
            fill={color}
            fillOpacity={0.75}
            stroke="#000"
            strokeWidth={1.5}
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.015, type: "spring", stiffness: 300, damping: 20 }}
          />
        ))}
      </svg>
    </div>
  );
}

/** Six-axis radar of lifestyle domains, 0–100. */
export function Radar({ axes, label }: { axes: { label: string; value: number | null; detail: string }[]; label: string }) {
  const reduce = useReducedMotion();
  const S = 340;
  const c = S / 2;
  const R = 120;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return [c + Math.cos(a) * R * (v / 100), c + Math.sin(a) * R * (v / 100)];
  };
  const poly = axes.map((a, i) => pt(i, a.value ?? 0).join(",")).join(" ");
  return (
    <div className={s.radarWrap}>
      <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label={label} className={s.radar}>
        {[25, 50, 75, 100].map((r) => (
          <polygon key={r} points={axes.map((_, i) => pt(i, r).join(",")).join(" ")} className={s.radarRing} />
        ))}
        {axes.map((_, i) => {
          const [ex, ey] = pt(i, 100);
          return <line key={i} x1={c} y1={c} x2={ex} y2={ey} className={s.grid} />;
        })}
        <motion.polygon
          points={poly}
          className={s.radarShape}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: `${c}px ${c}px` }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        />
        {axes.map((a, i) => {
          const [lx, ly] = pt(i, 122);
          const [dx, dy] = pt(i, a.value ?? 0);
          return (
            <g key={a.label}>
              <circle cx={dx} cy={dy} r={4} fill="var(--signal)" stroke="#000" strokeWidth={2} />
              <text x={lx} y={ly} className={s.radarLabel} textAnchor={Math.abs(lx - c) < 10 ? "middle" : lx > c ? "start" : "end"} dominantBaseline="middle">
                {a.label} {a.value === null ? "—" : a.value}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className={s.radarList}>
        {axes.map((a) => (
          <li key={a.label}>
            <span>{a.label}</span>
            <strong>{a.detail}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Weekday × metric heatmap of z-scores: the shape of your usual week. */
export function WeekHeat({ rows, label }: { rows: { label: string; values: (number | null)[] }[]; label: string }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className={s.heat} role="table" aria-label={label}>
      <div role="row" className={s.heatRow}>
        <span />
        {days.map((d) => (
          <span key={d} className={s.mHead} role="columnheader">
            {d}
          </span>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.label} role="row" className={s.heatRow}>
          <span className={s.mRow} role="rowheader">
            {r.label}
          </span>
          {r.values.map((v, i) => (
            <span
              key={i}
              role="cell"
              className={s.heatCell}
              title={v === null ? "No data" : `${v > 0 ? "+" : ""}${v.toFixed(1)} SD vs your usual`}
              style={{ background: v === null ? "rgba(255,255,255,0.03)" : v > 0 ? `rgba(226, 252, 91, ${Math.min(0.85, Math.abs(v) * 0.6)})` : `rgba(141, 116, 240, ${Math.min(0.85, Math.abs(v) * 0.6)})` }}
            >
              <span className="sr-only">{v === null ? "no data" : v.toFixed(1)}</span>
            </span>
          ))}
        </div>
      ))}
      <div className={s.heatKey}>
        <span>
          <i style={{ background: "rgba(141, 116, 240, 0.7)" }} /> Lower than your usual
        </span>
        <span>
          <i style={{ background: "rgba(226, 252, 91, 0.7)" }} /> Higher than your usual
        </span>
      </div>
    </div>
  );
}

/** Event timeline: one lane per metric, a dot on each unusual day (like a clinical record's timeline). */
export function Timeline({ days, lanes, label }: { days: string[]; lanes: { label: string; color: string; events: { i: number; z: number }[] }[]; label: string }) {
  // A wider canvas than the other charts, so labels stay small on a full-width card.
  const TW = 1100;
  const H = 26 * lanes.length + 30;
  const pad = { l: 96, r: 12 };
  const x = (i: number) => pad.l + (i / Math.max(1, days.length - 1)) * (TW - pad.l - pad.r);
  return (
    <div className={s.chart}>
      <svg viewBox={`0 0 ${TW} ${H}`} role="img" aria-label={label}>
        {lanes.map((l, k) => (
          <g key={l.label} transform={`translate(0 ${k * 26 + 14})`}>
            <text x={0} y={4} className={s.axis}>
              {l.label}
            </text>
            <line x1={pad.l} x2={TW - pad.r} y1={0} y2={0} className={s.grid} />
            {l.events.map((e) => (
              <g key={e.i}>
                <circle cx={x(e.i)} cy={0} r={4 + Math.min(4, Math.abs(e.z) * 1.5)} fill={l.color} fillOpacity={0.25} />
                <circle cx={x(e.i)} cy={0} r={3.5} fill={l.color}>
                  <title>{`${short(days[e.i])}: ${e.z > 0 ? "+" : ""}${e.z.toFixed(1)} SD`}</title>
                </circle>
              </g>
            ))}
          </g>
        ))}
        {[0, days.length - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 4} className={s.axis} textAnchor={i === 0 ? "start" : "end"}>
            {days[i] ? short(days[i]) : ""}
          </text>
        ))}
      </svg>
    </div>
  );
}

/** Semi-circular gauge for a single 0–100 score. */
export function Gauge({ value, label, color = "var(--signal)", caption }: { value: number | null; label: string; color?: string; caption?: string }) {
  const reduce = useReducedMotion();
  const r = 80;
  const len = Math.PI * r;
  const v = value ?? 0;
  return (
    <div className={s.gauge}>
      <svg viewBox="0 0 200 116" role="img" aria-label={`${label}: ${value ?? "no data"} out of 100`}>
        <path d={`M20,100 A${r},${r} 0 0 1 180,100`} fill="none" stroke="var(--track)" strokeWidth={12} strokeLinecap="round" />
        <motion.path
          d={`M20,100 A${r},${r} 0 0 1 180,100`}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={len}
          initial={reduce ? false : { strokeDashoffset: len }}
          whileInView={{ strokeDashoffset: len * (1 - v / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
          style={reduce ? { strokeDashoffset: len * (1 - v / 100) } : undefined}
        />
        <text x={100} y={92} textAnchor="middle" className={s.gaugeNum}>
          {value ?? "—"}
        </text>
      </svg>
      <span className={s.gaugeLabel}>{label}</span>
      {caption && <span className={s.gaugeCaption}>{caption}</span>}
    </div>
  );
}
