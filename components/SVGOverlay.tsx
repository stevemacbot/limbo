"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { prepareWithSegments, layoutWithLines, type LayoutLine } from "@chenglou/pretext";

// Map text size label → approximate pixel size (desktop baseline)
const SIZE_PX: Record<string, number> = {
  sm: 14, md: 18, lg: 22, xl: 29, "2xl": 38,
};

// Map font label → CSS font family
const FONT_FAMILY: Record<string, string> = {
  serif: "Fraunces",
  sans: "Newsreader",
  mono: "DM Mono",
};

const FONT_WEIGHT: Record<string, string> = {
  serif: "600",
  sans: "400",
  mono: "400",
};

type AnimType = "drift" | "trace" | "fragment";

interface Props {
  text: string;
  font: "serif" | "sans" | "mono";
  size: "sm" | "md" | "lg" | "xl" | "2xl";
  intensity: number; // 0–1 from node features
  pacing: number;    // 0–1 from node features
  align: "left" | "center" | "right";
}

interface MeasuredLine {
  text: string;
  width: number;
  y: number;     // top of line in the text block
  xOffset: number; // centering offset
}

function pickAnimType(intensity: number): AnimType {
  if (intensity >= 0.7) return "fragment";
  if (intensity >= 0.4) return "trace";
  return "drift";
}

// Seeded PRNG so animations are deterministic per text
function seededRng(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => {
    h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) | 0;
    h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) | 0;
    return ((h >>> 0) / 0xffffffff);
  };
}

export default function SVGOverlay({ text, font, size, intensity, pacing, align }: Props) {
  const [lines, setLines] = useState<MeasuredLine[]>([]);
  const containerRef = useRef<SVGSVGElement>(null);
  const animType = pickAnimType(intensity);
  const lineHeightPx = SIZE_PX[size] * 1.35;
  const fontStr = `${FONT_WEIGHT[font]} ${SIZE_PX[size]}px ${FONT_FAMILY[font]}`;

  // Measure text layout with pretext
  useEffect(() => {
    const maxWidth = Math.min(window.innerWidth - 64, 680);
    try {
      const prepared = prepareWithSegments(text.replace(/\n/g, " "), fontStr);
      const result = layoutWithLines(prepared, maxWidth, lineHeightPx);
      const measured: MeasuredLine[] = result.lines.map((line: LayoutLine, i: number) => {
        const xOffset =
          align === "center" ? (maxWidth - line.width) / 2 :
          align === "right"  ? (maxWidth - line.width) : 0;
        return { text: line.text, width: line.width, y: i * lineHeightPx, xOffset };
      });
      setLines(measured);
    } catch {
      // Font not yet loaded or pretext error — skip overlay
    }
  }, [text, fontStr, lineHeightPx, align]);

  const svgContent = useMemo(() => {
    if (!lines.length) return null;
    const rng = seededRng(text);
    const blockWidth = Math.max(...lines.map((l) => l.width));
    const blockHeight = lines.length * lineHeightPx;
    const maxWidth = Math.min(
      typeof window !== "undefined" ? window.innerWidth - 64 : 680,
      680
    );
    // Position of the text block's top-left within our SVG coordinate space
    const blockX = align === "center" ? (maxWidth - blockWidth) / 2 : 0;

    if (animType === "trace") {
      return <TraceAnim lines={lines} blockX={blockX} blockHeight={blockHeight} rng={rng} pacing={pacing} />;
    }
    if (animType === "drift") {
      return <DriftAnim lines={lines} blockX={blockX} blockWidth={blockWidth} blockHeight={blockHeight} rng={rng} pacing={pacing} />;
    }
    // fragment
    return <FragmentAnim lines={lines} blockX={blockX} blockWidth={blockWidth} blockHeight={blockHeight} rng={rng} />;
  }, [lines, animType, text, lineHeightPx, pacing, align]);

  if (!lines.length) return null;

  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 64, 680) : 680;
  const svgH = lines.length * lineHeightPx + lineHeightPx * 2;

  return (
    <svg
      ref={containerRef}
      width={maxW}
      height={svgH}
      viewBox={`0 0 ${maxW} ${svgH}`}
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "50%",
        marginTop: `-${svgH / 2}px`,
        pointerEvents: "none",
        overflow: "visible",
        opacity: 0.6,
      }}
    >
      {svgContent}
    </svg>
  );
}

// ── Trace animation: thin paths tracing around each line ──────────────────────
function TraceAnim({ lines, blockX, blockHeight, rng, pacing }: {
  lines: MeasuredLine[];
  blockX: number;
  blockHeight: number;
  rng: () => number;
  pacing: number;
}) {
  const dur = 10 + pacing * 8; // slower pacing = longer trace
  const pad = 6;

  return (
    <g stroke="rgba(232,228,220,0.18)" fill="none" strokeWidth="0.5">
      {lines.map((line, i) => {
        const x = line.xOffset - pad;
        const y = line.y - pad;
        const w = line.width + pad * 2;
        const h = 22 + pad * 2;
        const perimeter = 2 * (w + h);
        const delay = rng() * 3;
        return (
          <rect
            key={i}
            x={x} y={y} width={w} height={h} rx="2"
            strokeDasharray={`${perimeter}`}
            strokeDashoffset={`${perimeter}`}
            style={{
              animation: `trace-draw ${dur + rng() * 4}s ${delay}s ease-in-out infinite alternate`,
            }}
          />
        );
      })}
      {/* Full block outline */}
      <rect
        x={blockX - 18} y={-12}
        width={Math.max(...lines.map((l) => l.width)) + 36}
        height={blockHeight + 24} rx="4"
        stroke="rgba(232,228,220,0.06)"
        strokeDasharray="4 8"
        style={{ animation: `trace-rotate ${dur * 2.5}s linear infinite` }}
      />
    </g>
  );
}

// ── Drift animation: floating particles near text ────────────────────────────
function DriftAnim({ lines, blockX, blockWidth, blockHeight, rng, pacing }: {
  lines: MeasuredLine[];
  blockX: number;
  blockWidth: number;
  blockHeight: number;
  rng: () => number;
  pacing: number;
}) {
  const particleCount = 18;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const lineIdx = Math.floor(rng() * lines.length);
    const line = lines[lineIdx];
    const px = line.xOffset + rng() * line.width;
    const py = line.y + rng() * 22 - 4;
    const r = 0.8 + rng() * 2;
    const dur = 6 + rng() * 10;
    const delay = rng() * -dur;
    const drift = -(20 + rng() * 40);
    const opacity = 0.08 + rng() * 0.18;
    return { id: i, px, py, r, dur, delay, drift, opacity };
  });

  return (
    <g fill="rgba(232,228,220,1)">
      {particles.map((p) => (
        <circle
          key={p.id}
          cx={p.px} cy={p.py} r={p.r}
          opacity={p.opacity}
          style={{
            animation: `drift-up ${p.dur}s ${p.delay}s ease-in-out infinite`,
            transformOrigin: `${p.px}px ${p.py}px`,
          }}
        />
      ))}
    </g>
  );
}

// ── Fragment animation: geometric shards radiating from text center ───────────
function FragmentAnim({ lines, blockX, blockWidth, blockHeight, rng }: {
  lines: MeasuredLine[];
  blockX: number;
  blockWidth: number;
  blockHeight: number;
  rng: () => number;
}) {
  const cx = blockX + blockWidth / 2;
  const cy = blockHeight / 2;
  const shardCount = 8;

  const shards = Array.from({ length: shardCount }, (_, i) => {
    const angle = (i / shardCount) * Math.PI * 2 + rng() * 0.4;
    const len = 30 + rng() * 60;
    const x2 = cx + Math.cos(angle) * len;
    const y2 = cy + Math.sin(angle) * len;
    const dur = 3 + rng() * 5;
    const delay = rng() * -dur;
    const opacity = 0.08 + rng() * 0.14;
    // Slight curve via quadratic bezier
    const qx = cx + Math.cos(angle + 0.3) * (len * 0.5);
    const qy = cy + Math.sin(angle + 0.3) * (len * 0.5);
    return { id: i, cx, cy, x2, y2, qx, qy, dur, delay, opacity };
  });

  return (
    <g stroke="rgba(232,228,220,1)" fill="none" strokeWidth="0.5">
      {shards.map((s) => (
        <path
          key={s.id}
          d={`M ${s.cx} ${s.cy} Q ${s.qx} ${s.qy} ${s.x2} ${s.y2}`}
          opacity={s.opacity}
          style={{ animation: `fragment-flicker ${s.dur}s ${s.delay}s ease-in-out infinite` }}
        />
      ))}
      {/* Small circle at center */}
      <circle cx={cx} cy={cy} r="2" fill="rgba(232,228,220,0.12)"
        style={{ animation: `fragment-flicker 4s ease-in-out infinite` }} />
    </g>
  );
}
