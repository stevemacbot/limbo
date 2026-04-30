import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession, saveSession, SessionState } from "@/lib/session";
import { NODES, pickVariant } from "@/lib/nodes";

// GET /api/session?id=xxx — fetch or create session
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const session = await getSession(id);
    if (session) return NextResponse.json(session);
  }

  // Create new session starting at node 0
  const firstNode = NODES[0];
  const firstVariant = pickVariant(firstNode);
  const now = new Date().toISOString();

  const session: SessionState = {
    id: id ?? uuidv4(),
    currentNodeId: firstNode.id,
    currentVariantId: firstVariant.id,
    nodeHistory: [firstNode.id],
    variantHistory: [firstVariant.id],
    startedAt: now,
    lastActiveAt: now,
    visitCount: 1,
  };

  await saveSession(session);
  return NextResponse.json(session);
}
