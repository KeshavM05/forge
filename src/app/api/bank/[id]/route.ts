import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { bankItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const TEMP_USER_ID = "dev-user";

function getD1(request: NextRequest): D1Database | null {
  const env = (request as unknown as { cf?: { env?: CloudflareEnv } }).cf?.env;
  return env?.DB ?? null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const d1 = getD1(request);
  if (!d1) {
    return NextResponse.json({ error: "D1 not available" }, { status: 503 });
  }
  const db = getDb(d1);
  const { id } = await params;
  const body = await request.json();

  await db
    .update(bankItems)
    .set({
      kind: body.kind,
      roleOrCompany: body.roleOrCompany || null,
      text: body.text,
      tags: JSON.stringify(body.tags || []),
      atsKeywords: JSON.stringify(body.atsKeywords || []),
      active: body.active ?? true,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(bankItems.id, id), eq(bankItems.userId, TEMP_USER_ID)));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const d1 = getD1(request);
  if (!d1) {
    return NextResponse.json({ error: "D1 not available" }, { status: 503 });
  }
  const db = getDb(d1);
  const { id } = await params;

  await db
    .delete(bankItems)
    .where(and(eq(bankItems.id, id), eq(bankItems.userId, TEMP_USER_ID)));

  return NextResponse.json({ success: true });
}
