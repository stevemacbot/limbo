import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
    : null;

// POST /api/events — ingest batched tracking events
export async function POST(req: NextRequest) {
  const { sessionId, nodeId, variantId, events } = await req.json();
  if (!sessionId || !events?.length) return NextResponse.json({ ok: true });

  if (redis) {
    // Store as a capped list — last 500 events per session
    const key = `limbo:events:${sessionId}`;
    const payload = JSON.stringify({ nodeId, variantId, ts: Date.now(), events });
    await redis.lpush(key, payload);
    await redis.ltrim(key, 0, 499);
    await redis.expire(key, 60 * 60 * 24); // 24h TTL
  }

  return NextResponse.json({ ok: true });
}
