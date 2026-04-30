"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { SceneVariant, SceneNode } from "@/lib/nodes";
import SceneEngine from "@/components/SceneEngine";

interface SceneState {
  nodeId: string;
  variant: SceneVariant;
}

export default function StoryPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scene, setScene] = useState<SceneState | null>(null);
  const [canAdvance, setCanAdvance] = useState(false);
  const [started, setStarted] = useState(false);
  const [fading, setFading] = useState(false);
  const initRef = useRef(false);
  const advancingRef = useRef(false); // prevent double-advance

  // Init session
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const stored = typeof window !== "undefined" ? localStorage.getItem("limbo_session_id") : null;
    const url = stored ? `/api/session?id=${stored}` : "/api/session";

    fetch(url)
      .then((r) => r.json())
      .then((session) => {
        if (typeof window !== "undefined") localStorage.setItem("limbo_session_id", session.id);
        setSessionId(session.id);
        import("@/lib/nodes").then(({ getNode }) => {
          const node = getNode(session.currentNodeId);
          const variant = node.variants.find((v) => v.id === session.currentVariantId) ?? node.variants[0];
          setScene({ nodeId: node.id, variant });
        });
      })
      .catch(() => {
        // Fallback: start from node 0
        import("@/lib/nodes").then(({ NODES, pickVariant }) => {
          const node = NODES[0];
          setScene({ nodeId: node.id, variant: pickVariant(node) });
        });
      });
  }, []);

  const handleAdvance = useCallback(async (metrics: {
    dwellMs: number;
    mouseEntropy: number;
    hoverZones: number;
    score: number;
  }) => {
    if (!scene || advancingRef.current) return;
    advancingRef.current = true;
    setCanAdvance(false);

    // Fade out current scene
    setFading(true);
    await new Promise((r) => setTimeout(r, 500));

    try {
      let nextNodeId: string;
      let nextVariant: SceneVariant;

      if (sessionId) {
        try {
          const res = await fetch("/api/next-node", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, ...metrics }),
          });
          if (res.ok) {
            const data = await res.json();
            nextNodeId = data.node.id;
            nextVariant = data.variant;
          } else {
            throw new Error("not ok");
          }
        } catch {
          const { getNode, pickVariant, pickNextNode } = await import("@/lib/nodes");
          const currentNode = getNode(scene.nodeId);
          const next: SceneNode = pickNextNode(currentNode, []);
          nextNodeId = next.id;
          nextVariant = pickVariant(next);
        }
      } else {
        const { getNode, pickVariant, pickNextNode } = await import("@/lib/nodes");
        const currentNode = getNode(scene.nodeId);
        const next: SceneNode = pickNextNode(currentNode, []);
        nextNodeId = next.id;
        nextVariant = pickVariant(next);
      }

      setScene({ nodeId: nextNodeId!, variant: nextVariant! });
      setFading(false);
    } catch (err) {
      console.error("advance error", err);
      setFading(false);
    } finally {
      advancingRef.current = false;
    }
  }, [scene, sessionId]);

  // Entry screen
  if (!started) {
    return (
      <div
        onClick={() => setStarted(true)}
        style={{
          position: "fixed", inset: 0, background: "#070708",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          cursor: "pointer", gap: "1.5rem",
          touchAction: "none", userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div className="overlay-noise" />
        <div className="overlay-vignette" />
        <p style={{
          fontFamily: "var(--ff-display)", fontStyle: "italic",
          fontSize: "clamp(2rem, 8vw, 2.8rem)", fontWeight: 700,
          color: "rgba(232, 228, 220, 0.9)", letterSpacing: "-0.02em",
          animation: "scene-fade-in 2s ease both",
        }}>
          limbo
        </p>
        <p style={{
          fontFamily: "var(--ff-body)", fontSize: "0.82rem",
          color: "rgba(232, 228, 220, 0.3)", letterSpacing: "0.18em",
          textTransform: "uppercase",
          animation: "scene-fade-in 2s 1s ease both",
        }}>
          tap to enter
        </p>
      </div>
    );
  }

  if (!scene) {
    return <div style={{ position: "fixed", inset: 0, background: "#070708" }}><div className="overlay-noise" /></div>;
  }

  return (
    <div
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 0.5s ease",
        position: "fixed", inset: 0,
      }}
    >
      <SceneEngine
        key={scene.variant.id}
        variant={scene.variant}
        nodeId={scene.nodeId}
        sessionId={sessionId ?? "anon"}
        onAdvance={handleAdvance}
        canAdvance={canAdvance && !fading}
        onCanAdvance={() => setCanAdvance(true)}
      />
    </div>
  );
}
