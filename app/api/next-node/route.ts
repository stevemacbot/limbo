import { NextRequest, NextResponse } from "next/server";
import { getSession, saveSession, recordNodeVisit } from "@/lib/session";
import { getNode, pickVariant, pickNextNode } from "@/lib/nodes";

// POST /api/next-node — advance to next node, return new scene
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, engagementScore, dwellMs, mouseEntropy, hoverZones } = body;

  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  // Record engagement for the completed node
  await recordNodeVisit({
    sessionId,
    nodeId: session.currentNodeId,
    variantId: session.currentVariantId,
    startedAt: Date.now() - (dwellMs ?? 0),
    engagementScore,
    dwellMs,
    mouseEntropy,
    hoverZones,
  });

  // Pick next node + variant (Phase 1: random, avoiding recent variants)
  const currentNode = getNode(session.currentNodeId);
  const nextNode = pickNextNode(currentNode, session.nodeHistory);
  const nextVariant = pickVariant(nextNode, session.variantHistory.slice(-6));

  // Update session
  session.currentNodeId = nextNode.id;
  session.currentVariantId = nextVariant.id;
  session.nodeHistory = [...session.nodeHistory, nextNode.id].slice(-20);
  session.variantHistory = [...session.variantHistory, nextVariant.id].slice(-20);
  session.lastActiveAt = new Date().toISOString();
  session.visitCount += 1;

  await saveSession(session);

  return NextResponse.json({
    node: { id: nextNode.id, label: nextNode.label, transitions: nextNode.transitions },
    variant: nextVariant,
  });
}
