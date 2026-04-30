"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { SceneVariant } from "@/lib/nodes";
import { computeMouseEntropy, computeEngagementScore, countHoverZones } from "@/lib/tracker";

interface Props {
  variant: SceneVariant;
  nodeId: string;
  sessionId: string;
  onAdvance: (metrics: { dwellMs: number; mouseEntropy: number; hoverZones: number; score: number }) => void;
  canAdvance: boolean; // true once min dwell elapsed
  onCanAdvance: () => void;
}

export default function SceneEngine({ variant, nodeId, sessionId, onAdvance, canAdvance, onCanAdvance }: Props) {
  const startRef = useRef(Date.now());
  const positionsRef = useRef<Array<{ x: number; y: number }>>([]);
  const eventBatchRef = useRef<Array<{ t: number; x: number; y: number }>>([]);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const minDwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [textVisible, setTextVisible] = useState(false);
  const [subtextVisible, setSubtextVisible] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [hint, setHint] = useState(false);

  // Reset on variant change
  useEffect(() => {
    startRef.current = Date.now();
    positionsRef.current = [];
    eventBatchRef.current = [];
    setTextVisible(false);
    setSubtextVisible(false);
    setTypewriterText("");
    setHint(false);

    // Text appear animation
    const t1 = setTimeout(() => setTextVisible(true), 800);
    const t2 = setTimeout(() => setSubtextVisible(true), variant.text.appear === "typewriter" ? 2000 : 2200);

    // Show "continue" hint after min dwell
    minDwellTimerRef.current = setTimeout(() => {
      onCanAdvance();
      setTimeout(() => setHint(true), 500);
    }, variant.duration.min);

    // Auto-advance if max set
    let autoTimer: ReturnType<typeof setTimeout> | undefined;
    if (variant.duration.max) {
      autoTimer = setTimeout(() => handleAdvance(), variant.duration.max);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (minDwellTimerRef.current) clearTimeout(minDwellTimerRef.current);
      if (autoTimer) clearTimeout(autoTimer);
    };
  }, [variant.id]);

  // Typewriter effect
  useEffect(() => {
    if (variant.text.appear !== "typewriter" || !textVisible) return;
    const content = variant.text.content;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setTypewriterText(content.slice(0, i));
      if (i >= content.length) clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, [textVisible, variant.text.appear, variant.text.content]);

  // Mouse + touch tracking
  useEffect(() => {
    const track = (x: number, y: number) => {
      positionsRef.current.push({ x, y });
      eventBatchRef.current.push({ t: Date.now(), x, y });
      if (positionsRef.current.length > 500) positionsRef.current = positionsRef.current.slice(-500);
    };
    const onMove = (e: MouseEvent) => track(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) track(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  // Batch-flush events to API every 3s
  useEffect(() => {
    flushTimerRef.current = setInterval(() => {
      const batch = eventBatchRef.current.splice(0);
      if (!batch.length) return;
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, nodeId, variantId: variant.id, events: batch }),
        keepalive: true,
      }).catch(() => {});
    }, 3000);
    return () => { if (flushTimerRef.current) clearInterval(flushTimerRef.current); };
  }, [sessionId, nodeId, variant.id]);

  // Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!variant.audio) return;
    const audio = new Audio(variant.audio.src);
    audio.loop = variant.audio.loop;
    audio.volume = 0;
    audioRef.current = audio;
    audio.play().catch(() => {});

    // Fade in
    let vol = 0;
    const fade = setInterval(() => {
      vol = Math.min(variant.audio!.volume, vol + 0.01);
      audio.volume = vol;
      if (vol >= variant.audio!.volume) clearInterval(fade);
    }, 50);

    return () => {
      clearInterval(fade);
      // Fade out
      let v = audio.volume;
      const fadeOut = setInterval(() => {
        v = Math.max(0, v - 0.02);
        audio.volume = v;
        if (v <= 0) { clearInterval(fadeOut); audio.pause(); }
      }, 50);
    };
  }, [variant.id]);

  const handleAdvance = useCallback(() => {
    if (!canAdvance) return;
    const dwellMs = Date.now() - startRef.current;
    const mouseEntropy = computeMouseEntropy(positionsRef.current);
    const hoverZones = countHoverZones(positionsRef.current);
    const score = computeEngagementScore(dwellMs, mouseEntropy, hoverZones, variant.duration.min);
    onAdvance({ dwellMs, mouseEntropy, hoverZones, score });
  }, [canAdvance, variant.duration.min, onAdvance]);

  // Click anywhere to advance
  useEffect(() => {
    const onClick = () => handleAdvance();
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [handleAdvance]);

  // Keyboard: space / enter / arrow right
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ([" ", "Enter", "ArrowRight"].includes(e.key)) handleAdvance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAdvance]);

  const { visual, text } = variant;
  const displayText = text.appear === "typewriter" ? typewriterText : text.content;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: visual.bg,
        filter: visual.filter,
        cursor: canAdvance ? "pointer" : "default",
        overflow: "hidden",
        touchAction: "none",
      }}
      className={[
        visual.animation === "slow-drift" ? "anim-drift" : "",
        visual.animation === "flicker" ? "anim-flicker" : "",
        visual.animation === "pulse-dim" ? "anim-pulse" : "",
      ].join(" ")}
    >
      {/* Noise overlay */}
      {(visual.overlay === "noise" || visual.overlay === "both") && (
        <div className="overlay-noise" />
      )}
      {/* Vignette overlay */}
      {(visual.overlay === "vignette" || visual.overlay === "both") && (
        <div className="overlay-vignette" />
      )}

      {/* Text layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: text.align === "left" ? "flex-start" : text.align === "right" ? "flex-end" : "center",
          justifyContent: text.position === "top" ? "flex-start" : text.position === "bottom" ? "flex-end" : "center",
          padding: text.position === "bottom" ? "0 3rem 4rem" : text.position === "top" ? "4rem 3rem 0" : "2rem",
          WebkitTapHighlightColor: "transparent",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            opacity: textVisible ? (text.opacity ?? 0.92) : 0,
            transition: text.appear === "fade" ? "opacity 1.8s ease" : text.appear === "float-up" ? "opacity 1.4s ease, transform 1.4s ease" : "none",
            transform: text.appear === "float-up" ? (textVisible ? "translateY(0)" : "translateY(20px)") : "none",
            fontFamily: text.font === "serif" ? "var(--ff-display)" : text.font === "mono" ? "var(--ff-mono)" : "var(--ff-body)",
            fontStyle: text.font === "serif" ? "italic" : "normal",
            fontWeight: text.font === "mono" ? 400 : 600,
            color: "var(--text)",
            lineHeight: 1.35,
            letterSpacing: text.font === "mono" ? "0.02em" : "-0.01em",
            maxWidth: "680px",
            textAlign: text.align ?? "center",
            whiteSpace: "pre-line",
          }}
          className={`scene-text-${text.size}`}
        >
          {displayText}
        </p>

        {text.subtext && (
          <p
            style={{
              marginTop: "1.2rem",
              opacity: subtextVisible ? 0.45 : 0,
              transition: "opacity 2s ease",
              fontFamily: "var(--ff-body)",
              fontSize: "0.95rem",
              fontStyle: "normal",
              fontWeight: 400,
              color: "var(--text)",
              maxWidth: "520px",
              textAlign: text.align ?? "center",
              whiteSpace: "pre-line",
            }}
          >
            {text.subtext}
          </p>
        )}
      </div>

      {/* Continue hint */}
      {hint && (
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 0.25,
            fontSize: "0.72rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text)",
            fontFamily: "var(--ff-mono)",
            animation: "hint-pulse 3s ease-in-out infinite",
            pointerEvents: "none",
          }}
        >
          continue
        </div>
      )}
    </div>
  );
}
