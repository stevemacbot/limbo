"use client";
import { useEffect, useRef, useState } from "react";
import { SceneVariant } from "@/lib/nodes";
import SceneEngine from "@/components/SceneEngine";

interface SceneState {
  nodeId: string;
  variant: SceneVariant;
}

export default function StoryPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scene, setScene] = useState<SceneState | null>(null);
  const [prevScene, setPrevScene] = useState<SceneState | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);
  const [started, setStarted] = useState(false);
  const initRef = useRef(false);

  // Init session
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const stored = localStorage.getItem("limbo_session_id");
    const url = stored ? `/api/session?id=${stored}` : "/api/session";

    fetch(url)
      .then((r) => r.json())
      .then((session) => {
        localStorage.setItem("limbo_session_id", session.id);
        setSessionId(session.id);

        // Load the current node/variant from session
        import("@/lib/nodes").then(({ getNode }) => {
          const node = getNode(session.currentNodeId);
          const variant = node.variants.find((v) => v.id === session.currentVariantId) ?? node.variants[0];
          setScene({ nodeId: node.id, variant });
        });
      })
      .catch(() => {
        // Fallback: load first scene directly
        import("@/lib/nodes").then(({ NODES, pickVariant }) => {
          const node = NODES[0];
          const variant = pickVariant(node);
          setScene({ nodeId: node.id, variant });
        });
      });
  }, []);

  async function handleAdvance(metrics: {
    dwellMs: number;
    mouseEntropy: number;
    hoverZones: number;
    score: number;
  }) {
    if (!scene || !sessionId || transitioning) return;
    setTransitioning(true);
    setPrevScene(scene);
    setCanAdvance(false);

    try {
      const res = await fetch("/api/next-node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ...metrics,
        }),
      });
      const data = await res.json();
      // Brief crossfade delay
      setTimeout(() => {
        setScene({ nodeId: data.node.id, variant: data.variant });
        setTransitioning(false);
        setPrevScene(null);
      }, 600);
    } catch {
      // On error, still advance using local logic
      import("@/lib/nodes").then(({ getNode, pickVariant, pickNextNode }) => {
        const currentNode = getNode(scene.nodeId);
        const nextNode = pickNextNode(currentNode, []);
        const nextVariant = pickVariant(nextNode);
        setTimeout(() => {
          setScene({ nodeId: nextNode.id, variant: nextVariant });
          setTransitioning(false);
          setPrevScene(null);
        }, 600);
      });
    }
  }

  // Entry screen
  if (!started) {
    return (
      <div
        onClick={() => setStarted(true)}
        style={{
          position: "fixed",
          inset: 0,
          background: "#070708",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          gap: "1.5rem",
        }}
      >
        <div className="overlay-noise" />
        <div className="overlay-vignette" />
        <p
          style={{
            fontFamily: "var(--ff-display)",
            fontStyle: "italic",
            fontSize: "2.8rem",
            fontWeight: 700,
            color: "rgba(232, 228, 220, 0.9)",
            letterSpacing: "-0.02em",
            animation: "scene-fade-in 2s ease both",
          }}
        >
          limbo
        </p>
        <p
          style={{
            fontFamily: "var(--ff-body)",
            fontSize: "0.82rem",
            color: "rgba(232, 228, 220, 0.3)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            animation: "scene-fade-in 2s 1s ease both",
          }}
        >
          click to enter
        </p>
      </div>
    );
  }

  if (!scene) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#070708" }}>
        <div className="overlay-noise" />
      </div>
    );
  }

  return (
    <>
      {/* Previous scene fades out during transition */}
      {prevScene && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            opacity: transitioning ? 0 : 1,
            transition: "opacity 0.6s ease",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: prevScene.variant.visual.bg }} />
        </div>
      )}

      {/* Current scene */}
      <div
        style={{
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.6s ease",
          zIndex: 2,
        }}
      >
        <SceneEngine
          key={scene.variant.id}
          variant={scene.variant}
          nodeId={scene.nodeId}
          sessionId={sessionId ?? "anon"}
          onAdvance={handleAdvance}
          canAdvance={canAdvance && !transitioning}
          onCanAdvance={() => setCanAdvance(true)}
        />
      </div>
    </>
  );
}
