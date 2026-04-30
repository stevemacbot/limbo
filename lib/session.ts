import { Redis } from "@upstash/redis";

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
    : null;

export interface SessionState {
  id: string;
  currentNodeId: string;
  currentVariantId: string;
  nodeHistory: string[]; // node ids visited
  variantHistory: string[]; // variant ids seen (to avoid repeats)
  startedAt: string;
  lastActiveAt: string;
  visitCount: number;
}

export interface NodeVisit {
  sessionId: string;
  nodeId: string;
  variantId: string;
  startedAt: number;
  engagementScore?: number;
  dwellMs?: number;
  mouseEntropy?: number;
  hoverZones?: number;
}

const SESSION_TTL = 60 * 60 * 2; // 2 hours

function sessionKey(id: string) { return `limbo:session:${id}`; }
function visitKey(nodeId: string, variantId: string) { return `limbo:agg:${nodeId}:${variantId}`; }

export async function getSession(id: string): Promise<SessionState | null> {
  if (!redis) return null;
  return redis.get<SessionState>(sessionKey(id));
}

export async function saveSession(session: SessionState): Promise<void> {
  if (!redis) return;
  await redis.set(sessionKey(session.id), session, { ex: SESSION_TTL });
}

export interface AggregateStats {
  count: number;
  totalScore: number;
  avgScore: number;
}

export async function recordNodeVisit(visit: NodeVisit): Promise<void> {
  if (!redis || visit.engagementScore === undefined) return;

  const key = visitKey(visit.nodeId, visit.variantId);
  const existing = await redis.get<AggregateStats>(key) ?? { count: 0, totalScore: 0, avgScore: 0 };

  const count = existing.count + 1;
  const totalScore = existing.totalScore + visit.engagementScore;
  await redis.set(key, {
    count,
    totalScore,
    avgScore: Math.round((totalScore / count) * 100) / 100,
  });
}

export async function getVariantStats(nodeId: string, variantId: string): Promise<AggregateStats> {
  if (!redis) return { count: 0, totalScore: 0, avgScore: 0 };
  return (await redis.get<AggregateStats>(visitKey(nodeId, variantId))) ?? { count: 0, totalScore: 0, avgScore: 0 };
}
