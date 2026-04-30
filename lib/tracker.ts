export interface TrackingEvent {
  type: "mouse_move" | "dwell" | "transition" | "session_start" | "cursor_idle";
  ts: number;
  data: Record<string, number | string | boolean>;
}

export interface EngagementSnapshot {
  nodeId: string;
  variantId: string;
  dwellMs: number;
  mouseEntropy: number; // 0-1: how erratic/exploratory the mouse movement was
  hoverZones: number; // number of distinct regions cursor visited
  score: number; // composite engagement score
}

// Compute mouse entropy from a list of positions
// High entropy = lots of varied movement (engaged)
// Low entropy = stationary or very linear (not engaged or reading slowly)
export function computeMouseEntropy(positions: Array<{ x: number; y: number }>): number {
  if (positions.length < 3) return 0;

  let totalDist = 0;
  let dirChanges = 0;
  let prevDx = 0;
  let prevDy = 0;

  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i].x - positions[i - 1].x;
    const dy = positions[i].y - positions[i - 1].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    totalDist += dist;

    if (i > 1) {
      const dotProduct = dx * prevDx + dy * prevDy;
      const prevMag = Math.sqrt(prevDx * prevDx + prevDy * prevDy);
      const curMag = Math.sqrt(dx * dx + dy * dy);
      if (prevMag > 0 && curMag > 0) {
        const cosAngle = dotProduct / (prevMag * curMag);
        // Direction change > 45 degrees counts
        if (cosAngle < 0.7) dirChanges++;
      }
    }
    prevDx = dx;
    prevDy = dy;
  }

  // Normalize: avg movement per second, direction changes per second
  const entropyScore = Math.min(1, (dirChanges / positions.length) * 3 + (totalDist / (window.innerWidth * positions.length)) * 2);
  return Math.round(entropyScore * 100) / 100;
}

// Count distinct hover zones (divide viewport into 3×3 grid)
export function countHoverZones(positions: Array<{ x: number; y: number }>): number {
  const zones = new Set<string>();
  for (const pos of positions) {
    const col = Math.floor((pos.x / window.innerWidth) * 3);
    const row = Math.floor((pos.y / window.innerHeight) * 3);
    zones.add(`${col},${row}`);
  }
  return zones.size;
}

// Composite engagement score for a node visit
export function computeEngagementScore(
  dwellMs: number,
  mouseEntropy: number,
  hoverZones: number,
  minDwellMs: number
): number {
  // Dwell score: normalize against min dwell, cap at 3x
  const dwellScore = Math.min(1, dwellMs / (minDwellMs * 3));

  // Zone score: 9 zones max
  const zoneScore = Math.min(1, hoverZones / 6);

  // Composite
  const score = dwellScore * 0.5 + mouseEntropy * 0.3 + zoneScore * 0.2;
  return Math.round(score * 100) / 100;
}
