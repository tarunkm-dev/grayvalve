/*
 * LED-style 5×7 dot-matrix numerals, the signature readout of the Grayvalve app (DotMatrixText).
 * Unlit dots stay faintly visible so the grid reads as a display, not as loose dots.
 */

const GLYPHS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ":": ["0", "0", "1", "0", "1", "0", "0"],
  ".": ["0", "0", "0", "0", "0", "0", "1"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  " ": ["00", "00", "00", "00", "00", "00", "00"],
};

type Props = {
  value: string | number;
  /** Dot pitch in px. */
  dot?: number;
  color?: string;
  dimColor?: string;
  /** Mirror a fading reflection under the digits, as on Observatory tiles. */
  reflect?: boolean;
  className?: string;
  label?: string;
};

export function DotMatrix({ value, dot = 10, color = "currentColor", dimColor, reflect = false, className, label }: Props) {
  const chars = String(value).split("");
  const cols: { x: number; on: boolean; y: number }[] = [];
  let x = 0;
  for (const ch of chars) {
    const g = GLYPHS[ch] ?? GLYPHS[" "];
    const w = g[0].length;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < w; c++) cols.push({ x: x + c, y: r, on: g[r][c] === "1" });
    }
    x += w + 1;
  }
  const width = Math.max(1, x - 1) * dot;
  const rows = reflect ? 10 : 7;
  const height = rows * dot;
  const rad = dot * 0.36;
  const dim = dimColor ?? "rgba(255,255,255,0.10)";

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label ?? String(value)}
    >
      {cols.map((d, i) => (
        <circle key={i} cx={d.x * dot + dot / 2} cy={d.y * dot + dot / 2} r={rad} fill={d.on ? color : dim} />
      ))}
      {reflect &&
        cols
          .filter((d) => d.y >= 4)
          .map((d, i) => {
            const ry = 7 + (6 - d.y);
            const fade = 0.32 - (ry - 7) * 0.1;
            return (
              <circle
                key={`r${i}`}
                cx={d.x * dot + dot / 2}
                cy={ry * dot + dot / 2}
                r={rad * 0.9}
                fill={d.on ? color : dim}
                opacity={d.on ? Math.max(0.05, fade) : 0.4}
              />
            );
          })}
    </svg>
  );
}
