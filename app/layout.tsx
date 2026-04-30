import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "limbo",
  description: "You're between two places.",
};

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --text: #e8e4dc;
    --ff-display: 'Fraunces', Georgia, serif;
    --ff-body: 'Newsreader', Georgia, serif;
    --ff-mono: 'DM Mono', 'Courier New', monospace;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #070708;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Overlays ── */
  .overlay-noise {
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9998;
    opacity: 0.7;
  }

  .overlay-vignette {
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%);
    pointer-events: none;
    z-index: 9997;
  }

  /* ── Scene animations ── */
  @keyframes scene-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes drift {
    0%   { background-position: 0% 0%; }
    25%  { background-position: 2% 1%; }
    50%  { background-position: 0% 2%; }
    75%  { background-position: -1% 1%; }
    100% { background-position: 0% 0%; }
  }

  @keyframes flicker {
    0%, 100% { opacity: 1; }
    92%       { opacity: 1; }
    93%       { opacity: 0.88; }
    94%       { opacity: 1; }
    96%       { opacity: 0.92; }
    97%       { opacity: 1; }
  }

  @keyframes pulse-dim {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.93; }
  }

  @keyframes hint-pulse {
    0%, 100% { opacity: 0.25; }
    50%       { opacity: 0.12; }
  }

  .anim-drift  { animation: drift   28s ease-in-out infinite; }
  .anim-flicker { animation: flicker 8s ease-in-out infinite; }
  .anim-pulse  { animation: pulse-dim 6s ease-in-out infinite; }

  /* ── SVG overlay animations ── */
  @keyframes trace-draw {
    0%   { stroke-dashoffset: var(--perimeter, 9999); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 0.4; }
  }
  @keyframes trace-rotate {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -60; }
  }
  @keyframes drift-up {
    0%   { transform: translateY(0px);   opacity: var(--op, 0.12); }
    50%  { opacity: calc(var(--op, 0.12) * 1.5); }
    100% { transform: translateY(-45px); opacity: 0; }
  }
  @keyframes fragment-flicker {
    0%, 100% { opacity: var(--op, 0.1);  }
    30%       { opacity: calc(var(--op, 0.1) * 2.5); }
    60%       { opacity: calc(var(--op, 0.1) * 0.5); }
  }

  /* ── Mobile ── */
  .scene-text-2xl { font-size: clamp(1.5rem, 6vw, 2.4rem); }
  .scene-text-xl  { font-size: clamp(1.2rem, 5vw, 1.8rem); }
  .scene-text-lg  { font-size: clamp(1rem,  4vw, 1.4rem); }
  .scene-text-md  { font-size: clamp(0.9rem, 3.5vw, 1.1rem); }
  .scene-text-sm  { font-size: clamp(0.8rem, 3vw, 0.9rem); }

  @media (max-width: 600px) {
    .scene-padding { padding: 1.5rem !important; }
    .scene-padding-bottom { padding: 0 1.5rem 3rem !important; }
  }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#070708" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
