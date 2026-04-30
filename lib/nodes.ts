export interface SceneVariant {
  id: string;
  visual: {
    bg: string; // CSS background value
    filter?: string; // CSS filter
    animation?: "slow-drift" | "flicker" | "pulse-dim" | "none";
    overlay?: "noise" | "vignette" | "both" | "none";
  };
  text: {
    content: string;
    font: "serif" | "sans" | "mono";
    size: "sm" | "md" | "lg" | "xl" | "2xl";
    appear: "fade" | "typewriter" | "float-up" | "instant";
    position: "center" | "bottom" | "top";
    align?: "left" | "center" | "right";
    opacity?: number;
    subtext?: string; // smaller secondary text
  };
  audio?: {
    src: string;
    volume: number;
    loop: boolean;
  };
  duration: {
    min: number; // ms before user can advance
    max?: number; // ms before auto-advance
  };
}

export interface SceneNode {
  id: string;
  label: string;
  variants: SceneVariant[];
  transitions: string[]; // node ids this leads to
  features: {
    pacing: number; // 0 = slow, 1 = fast
    intensity: number; // 0 = calm, 1 = unsettling
    textDensity: number; // 0 = sparse, 1 = dense
  };
}

export const NODES: SceneNode[] = [
  {
    id: "arrival",
    label: "You notice you've stopped.",
    transitions: ["recognition"],
    features: { pacing: 0.1, intensity: 0.3, textDensity: 0.2 },
    variants: [
      {
        id: "arrival-a",
        visual: {
          bg: "linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
          animation: "flicker",
          overlay: "both",
        },
        text: {
          content: "You notice you've stopped.",
          font: "serif",
          size: "xl",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "You're not sure when.",
        },
        audio: { src: "/audio/platform-hum.mp3", volume: 0.15, loop: true },
        duration: { min: 4000 },
      },
      {
        id: "arrival-b",
        visual: {
          bg: "#f5f3ef",
          filter: "brightness(0.97) contrast(0.9)",
          animation: "none",
          overlay: "noise",
        },
        text: {
          content: "You notice you've stopped.",
          font: "sans",
          size: "2xl",
          appear: "instant",
          position: "center",
          align: "center",
          opacity: 0.7,
        },
        duration: { min: 3000 },
      },
      {
        id: "arrival-c",
        visual: {
          bg: "linear-gradient(200deg, #0d1520 0%, #091018 50%, #050a0f 100%)",
          filter: "hue-rotate(10deg)",
          animation: "slow-drift",
          overlay: "vignette",
        },
        text: {
          content: "You've stopped.",
          font: "mono",
          size: "md",
          appear: "typewriter",
          position: "bottom",
          align: "left",
          subtext: "The world kept going.",
        },
        audio: { src: "/audio/underwater-low.mp3", volume: 0.2, loop: true },
        duration: { min: 5000 },
      },
    ],
  },

  {
    id: "recognition",
    label: "You remember something.",
    transitions: ["object"],
    features: { pacing: 0.2, intensity: 0.4, textDensity: 0.4 },
    variants: [
      {
        id: "recognition-a",
        visual: {
          bg: "linear-gradient(135deg, #0f0e14 0%, #1a1825 100%)",
          animation: "pulse-dim",
          overlay: "both",
        },
        text: {
          content: "A door you've seen before.",
          font: "serif",
          size: "lg",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "You can't remember which side you were on.",
        },
        audio: { src: "/audio/distant-room.mp3", volume: 0.12, loop: true },
        duration: { min: 5000 },
      },
      {
        id: "recognition-b",
        visual: {
          bg: "#0a0a0a",
          animation: "none",
          overlay: "noise",
        },
        text: {
          content: "The smell of somewhere.",
          font: "serif",
          size: "xl",
          appear: "float-up",
          position: "center",
          align: "center",
          subtext: "You know this place. You don't know why.",
          opacity: 0.85,
        },
        audio: { src: "/audio/silence-room.mp3", volume: 0.08, loop: true },
        duration: { min: 6000 },
      },
      {
        id: "recognition-c",
        visual: {
          bg: "linear-gradient(180deg, #13110f 0%, #1e1a15 100%)",
          filter: "sepia(0.15)",
          animation: "slow-drift",
          overlay: "vignette",
        },
        text: {
          content: "Something moved behind the glass.",
          font: "mono",
          size: "sm",
          appear: "typewriter",
          position: "bottom",
          align: "left",
          subtext: "Then it stopped.",
        },
        duration: { min: 7000 },
      },
    ],
  },

  {
    id: "object",
    label: "There's something here.",
    transitions: ["distance"],
    features: { pacing: 0.3, intensity: 0.5, textDensity: 0.3 },
    variants: [
      {
        id: "object-a",
        visual: {
          bg: "radial-gradient(ellipse at center, #1a1820 0%, #080810 100%)",
          animation: "none",
          overlay: "both",
        },
        text: {
          content: "A bag, packed but unzipped.",
          font: "serif",
          size: "lg",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "A ticket without a destination.",
        },
        audio: { src: "/audio/ambient-low.mp3", volume: 0.1, loop: true },
        duration: { min: 5000 },
      },
      {
        id: "object-b",
        visual: {
          bg: "linear-gradient(180deg, #0c0c10 0%, #14121a 100%)",
          animation: "flicker",
          overlay: "noise",
        },
        text: {
          content: "A phone with the screen on.",
          font: "sans",
          size: "lg",
          appear: "float-up",
          position: "center",
          align: "center",
          subtext: "The last message is visible but you can't read it.",
          opacity: 0.8,
        },
        duration: { min: 5000 },
      },
      {
        id: "object-c",
        visual: {
          bg: "#111009",
          filter: "sepia(0.2) brightness(0.9)",
          animation: "slow-drift",
          overlay: "vignette",
        },
        text: {
          content: "A chair, still warm.",
          font: "serif",
          size: "xl",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "A coat on the hook. Someone just left.",
        },
        duration: { min: 6000 },
      },
    ],
  },

  {
    id: "distance",
    label: "You try to measure how far you are.",
    transitions: ["time"],
    features: { pacing: 0.4, intensity: 0.4, textDensity: 0.5 },
    variants: [
      {
        id: "distance-a",
        visual: {
          bg: "linear-gradient(180deg, #0a0e14 0%, #0f1420 100%)",
          animation: "slow-drift",
          overlay: "both",
        },
        text: {
          content: "A map with no labels.",
          font: "mono",
          size: "md",
          appear: "typewriter",
          position: "center",
          align: "center",
          subtext: "Your position is marked with a dot.",
        },
        audio: { src: "/audio/wind-far.mp3", volume: 0.1, loop: true },
        duration: { min: 6000 },
      },
      {
        id: "distance-b",
        visual: {
          bg: "linear-gradient(0deg, #0a0a0a 0%, #121218 100%)",
          animation: "none",
          overlay: "vignette",
        },
        text: {
          content: "A hallway.",
          font: "serif",
          size: "2xl",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "The further you look, the further it goes.",
        },
        duration: { min: 7000 },
      },
      {
        id: "distance-c",
        visual: {
          bg: "#0e100c",
          filter: "brightness(0.85)",
          animation: "slow-drift",
          overlay: "noise",
        },
        text: {
          content: "A road in both directions.",
          font: "sans",
          size: "lg",
          appear: "float-up",
          position: "bottom",
          align: "left",
          subtext: "No landmarks. Just wind.",
          opacity: 0.75,
        },
        audio: { src: "/audio/wind-open.mp3", volume: 0.18, loop: true },
        duration: { min: 5000 },
      },
    ],
  },

  {
    id: "time",
    label: "You're not sure how long this has been.",
    transitions: ["figure"],
    features: { pacing: 0.3, intensity: 0.6, textDensity: 0.6 },
    variants: [
      {
        id: "time-a",
        visual: {
          bg: "radial-gradient(ellipse at 50% 40%, #181618 0%, #0a0a0c 100%)",
          animation: "flicker",
          overlay: "both",
        },
        text: {
          content: "The second hand moves.",
          font: "serif",
          size: "lg",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "Backwards. Slowly.",
        },
        audio: { src: "/audio/clock-reverse.mp3", volume: 0.15, loop: false },
        duration: { min: 6000 },
      },
      {
        id: "time-b",
        visual: {
          bg: "linear-gradient(180deg, #1a1a1a 0%, #050505 100%)",
          animation: "pulse-dim",
          overlay: "vignette",
        },
        text: {
          content: "Day. Night. Day again.",
          font: "mono",
          size: "xl",
          appear: "typewriter",
          position: "center",
          align: "center",
          subtext: "It slows. Then stops.",
        },
        duration: { min: 7000 },
      },
      {
        id: "time-c",
        visual: {
          bg: "#080808",
          animation: "none",
          overlay: "noise",
        },
        text: {
          content: "Morning.\nYears ago.\nJust now.\nBefore.",
          font: "serif",
          size: "lg",
          appear: "float-up",
          position: "center",
          align: "center",
          opacity: 0.7,
        },
        duration: { min: 8000 },
      },
    ],
  },

  {
    id: "figure",
    label: "Someone else might be here.",
    transitions: ["pull"],
    features: { pacing: 0.4, intensity: 0.8, textDensity: 0.3 },
    variants: [
      {
        id: "figure-a",
        visual: {
          bg: "linear-gradient(180deg, #0c0c10 0%, #08080d 100%)",
          animation: "flicker",
          overlay: "both",
        },
        text: {
          content: "A silhouette at the far end.",
          font: "serif",
          size: "lg",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "It doesn't move. It doesn't respond.",
        },
        duration: { min: 7000 },
      },
      {
        id: "figure-b",
        visual: {
          bg: "#060608",
          animation: "none",
          overlay: "vignette",
        },
        text: {
          content: "A voice.",
          font: "serif",
          size: "2xl",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "One sentence. Half heard.\nThen silence.",
        },
        audio: { src: "/audio/voice-fragment.mp3", volume: 0.2, loop: false },
        duration: { min: 8000 },
      },
      {
        id: "figure-c",
        visual: {
          bg: "radial-gradient(ellipse at 70% 60%, #0f0d14 0%, #060508 100%)",
          animation: "pulse-dim",
          overlay: "noise",
        },
        text: {
          content: "A shadow that doesn't match anything in the room.",
          font: "mono",
          size: "md",
          appear: "typewriter",
          position: "bottom",
          align: "left",
        },
        duration: { min: 9000 },
      },
    ],
  },

  {
    id: "pull",
    label: "One direction feels stronger.",
    transitions: ["threshold"],
    features: { pacing: 0.5, intensity: 0.7, textDensity: 0.4 },
    variants: [
      {
        id: "pull-a",
        visual: {
          bg: "radial-gradient(ellipse at 50% 100%, #1a1208 0%, #080608 60%, #050408 100%)",
          animation: "pulse-dim",
          overlay: "vignette",
        },
        text: {
          content: "Light from under a door.",
          font: "serif",
          size: "xl",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "Warm. Like afternoon.",
        },
        duration: { min: 5000 },
      },
      {
        id: "pull-b",
        visual: {
          bg: "linear-gradient(180deg, #080808 0%, #0c0a0a 100%)",
          animation: "none",
          overlay: "both",
        },
        text: {
          content: "A sound from behind you.",
          font: "serif",
          size: "lg",
          appear: "float-up",
          position: "center",
          align: "center",
          subtext: "Familiar. You can't place it.",
        },
        audio: { src: "/audio/familiar-sound.mp3", volume: 0.15, loop: false },
        duration: { min: 6000 },
      },
      {
        id: "pull-c",
        visual: {
          bg: "#0a0908",
          filter: "sepia(0.1)",
          animation: "slow-drift",
          overlay: "noise",
        },
        text: {
          content: "Your own footsteps.\nLeading somewhere.",
          font: "mono",
          size: "md",
          appear: "typewriter",
          position: "bottom",
          align: "left",
          subtext: "You didn't make them yet.",
        },
        duration: { min: 7000 },
      },
    ],
  },

  {
    id: "threshold",
    label: "You're almost somewhere.",
    transitions: ["choice"],
    features: { pacing: 0.6, intensity: 0.9, textDensity: 0.5 },
    variants: [
      {
        id: "threshold-a",
        visual: {
          bg: "radial-gradient(ellipse at 50% 80%, #1c1408 0%, #080608 50%, #040406 100%)",
          animation: "pulse-dim",
          overlay: "both",
        },
        text: {
          content: "A door handle.",
          font: "serif",
          size: "xl",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "Have you touched it before?",
        },
        duration: { min: 6000 },
      },
      {
        id: "threshold-b",
        visual: {
          bg: "linear-gradient(0deg, #0a0808 0%, #080a0c 100%)",
          animation: "flicker",
          overlay: "vignette",
        },
        text: {
          content: "The edge of the platform.",
          font: "sans",
          size: "lg",
          appear: "float-up",
          position: "center",
          align: "center",
          subtext: "A train is approaching.\nOr leaving.",
          opacity: 0.85,
        },
        audio: { src: "/audio/train-distant.mp3", volume: 0.2, loop: false },
        duration: { min: 7000 },
      },
      {
        id: "threshold-c",
        visual: {
          bg: "#080808",
          animation: "none",
          overlay: "noise",
        },
        text: {
          content: "A phone ringing in an empty room.",
          font: "serif",
          size: "xl",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "You could answer it.",
        },
        audio: { src: "/audio/phone-ring.mp3", volume: 0.18, loop: false },
        duration: { min: 6000 },
      },
    ],
  },

  {
    id: "choice",
    label: "Stay or move.",
    transitions: ["loop"],
    features: { pacing: 0.5, intensity: 0.7, textDensity: 0.6 },
    variants: [
      {
        id: "choice-a",
        visual: {
          bg: "radial-gradient(ellipse at 50% 50%, #201808 0%, #080604 100%)",
          animation: "pulse-dim",
          overlay: "vignette",
        },
        text: {
          content: "The light gets brighter.",
          font: "serif",
          size: "xl",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "The room gets quieter.",
        },
        duration: { min: 6000 },
      },
      {
        id: "choice-b",
        visual: {
          bg: "#0a0a0c",
          animation: "slow-drift",
          overlay: "both",
        },
        text: {
          content: "The sounds return.",
          font: "sans",
          size: "lg",
          appear: "float-up",
          position: "center",
          align: "center",
          subtext: "Layered. Then fading.",
          opacity: 0.8,
        },
        audio: { src: "/audio/layers-fade.mp3", volume: 0.2, loop: false },
        duration: { min: 7000 },
      },
      {
        id: "choice-c",
        visual: {
          bg: "#050505",
          animation: "none",
          overlay: "noise",
        },
        text: {
          content: "You could keep going.",
          font: "mono",
          size: "lg",
          appear: "typewriter",
          position: "center",
          align: "center",
          subtext: "You've been here before.",
        },
        duration: { min: 8000 },
      },
    ],
  },

  {
    id: "loop",
    label: "You're still between.",
    transitions: ["arrival", "recognition", "figure"],
    features: { pacing: 0.2, intensity: 0.5, textDensity: 0.3 },
    variants: [
      {
        id: "loop-a",
        visual: {
          bg: "linear-gradient(180deg, #0c0a10 0%, #080810 100%)",
          animation: "flicker",
          overlay: "both",
        },
        text: {
          content: "You recognize this.",
          font: "serif",
          size: "xl",
          appear: "fade",
          position: "center",
          align: "center",
          subtext: "Something is different now.",
        },
        duration: { min: 5000 },
      },
      {
        id: "loop-b",
        visual: {
          bg: "#06080c",
          filter: "hue-rotate(15deg)",
          animation: "slow-drift",
          overlay: "vignette",
        },
        text: {
          content: "A new corridor.",
          font: "serif",
          size: "2xl",
          appear: "float-up",
          position: "center",
          align: "center",
          subtext: "It wasn't there before.",
        },
        audio: { src: "/audio/corridor-deep.mp3", volume: 0.12, loop: true },
        duration: { min: 6000 },
      },
      {
        id: "loop-c",
        visual: {
          bg: "#030303",
          animation: "none",
          overlay: "noise",
        },
        text: {
          content: "",
          font: "mono",
          size: "sm",
          appear: "fade",
          position: "bottom",
          align: "right",
          subtext: "Your cursor is the only thing moving.",
        },
        duration: { min: 10000 },
      },
    ],
  },
];

export const NODE_MAP = Object.fromEntries(NODES.map((n) => [n.id, n]));

export function getNode(id: string): SceneNode {
  const node = NODE_MAP[id];
  if (!node) throw new Error(`Node not found: ${id}`);
  return node;
}

export function pickVariant(node: SceneNode, exclude: string[] = []): SceneVariant {
  const available = node.variants.filter((v) => !exclude.includes(v.id));
  const pool = available.length > 0 ? available : node.variants;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickNextNode(current: SceneNode, history: string[]): SceneNode {
  // Avoid immediate repeats, otherwise random
  const options = current.transitions.filter((id) => id !== history[history.length - 1]);
  const nextId = options.length > 0
    ? options[Math.floor(Math.random() * options.length)]
    : current.transitions[0];
  return getNode(nextId);
}
