/*
 * Visualisation primitives, ported from the Android viz library (ui/components/Viz*.kt).
 * Each chart is plain SVG with an accessible summary so it can render on the server.
 */

type Common = { label: string; className?: string };

function smoothPath(points: [number, number][]) {
  if (points.length < 2) return "";
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

/** Wave line: trends such as readiness, energy or mood. `null` values are gaps (unknown stays unknown). */
export function WaveLine({
  data,
  color = "var(--signal)",
  height = 80,
  fill = true,
  label,
  className,
  max,
  min,
}: Common & { data: (number | null)[]; color?: string; height?: number; fill?: boolean; max?: number; min?: number }) {
  const w = 300;
  const vals = data.filter((v): v is number => v !== null);
  const hi = max ?? Math.max(...vals);
  const lo = min ?? Math.min(...vals);
  const span = hi - lo || 1;
  const pts: [number, number][] = [];
  data.forEach((v, i) => {
    if (v === null) return;
    pts.push([(i / (data.length - 1)) * w, height - 6 - ((v - lo) / span) * (height - 16)]);
  });
  const line = smoothPath(pts);
  const last = pts[pts.length - 1];
  const id = `wl-${label.replace(/\W/g, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className={className} role="img" aria-label={label} style={{ width: "100%", height }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && pts.length > 1 && <path d={`${line} L${last[0]},${height} L${pts[0][0]},${height} Z`} fill={`url(#${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {last && <circle cx={last[0]} cy={last[1]} r="4" fill={color} />}
    </svg>
  );
}

/** Bars: daily totals. The highlighted index is drawn in the accent, the rest in a tonal fill. */
export function Bars({
  data,
  labels,
  highlight,
  color = "var(--amber)",
  height = 120,
  label,
  className,
}: Common & { data: number[]; labels?: string[]; highlight?: number; color?: string; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div className={className} role="img" aria-label={label}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height }}>
        {data.map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${Math.max(4, (v / max) * 100)}%`,
              borderRadius: 8,
              background: i === highlight ? color : `color-mix(in srgb, ${color} 38%, transparent)`,
              transition: "height 600ms var(--ease)",
            }}
          />
        ))}
      </div>
      {labels && (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {labels.map((l, i) => (
            <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, color: i === highlight ? "var(--content)" : "var(--faint)" }}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Tick meter: a count (hours, 15-minute blocks) as lit ticks along a ruler. */
export function TickMeter({ value, total, color = "var(--content)", label, className }: Common & { value: number; total: number; color?: string }) {
  return (
    <div className={className} role="img" aria-label={label} style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: i % 4 === 0 ? 28 : 18,
            borderRadius: 2,
            background: i < value ? color : "rgba(255,255,255,0.16)",
          }}
        />
      ))}
    </div>
  );
}

/** Range band: today's value against a personal low–high baseline, with the Signal marker. */
export function RangeBand({ value, low, high, min, max, unit, label, className }: Common & { value: number; low: number; high: number; min: number; max: number; unit?: string }) {
  const pos = (v: number) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <div className={className} role="img" aria-label={label}>
      <div style={{ position: "relative", height: 34 }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {Array.from({ length: 41 }).map((_, i) => (
            <span key={i} style={{ width: 2, height: i % 5 === 0 ? 22 : 12, background: "rgba(255,255,255,0.35)", borderRadius: 1 }} />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: pos(low),
            width: `calc(${pos(high)} - ${pos(low)})`,
            height: 22,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 4,
          }}
        />
        <div style={{ position: "absolute", left: pos(value), bottom: 0, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true">
            <path d="M0 0H14L7 9Z" fill="var(--signal)" />
          </svg>
          <span style={{ width: 3, height: 24, background: "var(--signal)", borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--faint)", marginTop: 8, letterSpacing: "0.06em" }}>
        <span>
          low {low}
          {unit}
        </span>
        <span>
          high {high}
          {unit}
        </span>
      </div>
    </div>
  );
}

const STAGE_COLORS: Record<string, string> = {
  Awake: "var(--amber)",
  REM: "var(--lavender)",
  Light: "var(--ocean)",
  Deep: "var(--violet)",
};

/** Sleep stage band: the night as a hypnogram strip, plus totals per stage. */
export function SleepStages({ segments, label, className }: Common & { segments: { stage: "Awake" | "REM" | "Light" | "Deep"; min: number }[] }) {
  const total = segments.reduce((s, x) => s + x.min, 0);
  const rows = ["Awake", "REM", "Light", "Deep"] as const;
  const totals = rows.map((r) => ({ r, m: segments.filter((s) => s.stage === r).reduce((a, b) => a + b.min, 0) }));
  let acc = 0;
  return (
    <div className={className} role="img" aria-label={label}>
      <div style={{ position: "relative", height: 112 }}>
        {rows.map((r, i) => (
          <div key={r} style={{ position: "absolute", left: 0, right: 0, top: i * 28 + 13, height: 1, background: "rgba(255,255,255,0.06)" }} />
        ))}
        {segments.map((s, i) => {
          const left = (acc / total) * 100;
          acc += s.min;
          const row = rows.indexOf(s.stage);
          return (
            <div
              key={i}
              title={`${s.stage} ${s.min} min`}
              style={{
                position: "absolute",
                left: `${left}%`,
                width: `${(s.min / total) * 100}%`,
                top: row * 28 + 4,
                height: 20,
                background: STAGE_COLORS[s.stage],
                borderRadius: 6,
                border: "1px solid rgba(0,0,0,0.4)",
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8, marginTop: 14 }}>
        {totals.map(({ r, m }) => (
          <div key={r} style={{ fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--faint)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: STAGE_COLORS[r] }} />
              {r}
            </div>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>
              {Math.floor(m / 60)}h {m % 60}m
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Pulse rings: up to three bounded progress values, concentric. */
export function PulseRings({ rings, size = 150, label, className }: Common & { rings: { value: number; color: string }[]; size?: number }) {
  const stroke = size * 0.075;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} role="img" aria-label={label}>
      {rings.map((r, i) => {
        const radius = size / 2 - stroke / 2 - i * (stroke + 5);
        const c = 2 * Math.PI * radius;
        return (
          <g key={i} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={r.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${c * Math.min(1, r.value)} ${c}`}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Arc gauge: a 240° gauge for averages, speed or focus progress. */
export function ArcGauge({ value, max, color = "var(--signal)", size = 140, label, className, children }: Common & { value: number; max: number; color?: string; size?: number; children?: React.ReactNode }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const arc = c * (240 / 360);
  const filled = arc * Math.min(1, value / max);
  return (
    <div className={className} style={{ position: "relative", width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(150deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${filled} ${c}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>{children}</div>
    </div>
  );
}

/** Week heat strip: unknown days are outlined, never drawn as zero. */
export function HeatStrip({ data, color = "var(--jade)", label, className }: Common & { data: (number | null)[]; color?: string }) {
  return (
    <div className={className} role="img" aria-label={label} style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(data.length, 14)}, 1fr)`, gap: 4 }}>
      {data.map((v, i) => (
        <span
          key={i}
          style={{
            aspectRatio: "1",
            borderRadius: 5,
            background: v === null ? "transparent" : `color-mix(in srgb, ${color} ${Math.round(18 + v * 82)}%, transparent)`,
            border: v === null ? "1px dashed rgba(255,255,255,0.18)" : "none",
          }}
        />
      ))}
    </div>
  );
}
