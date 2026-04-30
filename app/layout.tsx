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
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
