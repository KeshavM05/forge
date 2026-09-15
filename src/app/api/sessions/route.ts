import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { assemblySessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/lib/id";

const TEMP_USER_ID = "dev-user";

function getD1(request: NextRequest): D1Database | null {
  const env = (request as unknown as { cf?: { env?: CloudflareEnv } }).cf?.env;
  return env?.DB ?? null;
}

export async function GET(request: NextRequest) {
  const d1 = getD1(request);
  if (!d1) {
    return NextResponse.json({ sessions: [], mock: true });
  }
  const db = getDb(d1);
  const sessions = await db
    .select()
    .from(assemblySessions)
    .where(eq(assemblySessions.userId, TEMP_USER_ID))
    .orderBy(desc(assemblySessions.createdAt));
  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  const d1 = getD1(request);
  if (!d1) {
    return NextResponse.json({ error: "D1 not available" }, { status: 503 });
  }
  const db = getDb(d1);
  const body = await request.json();

  const session = {
    id: generateId(),
    userId: TEMP_USER_ID,
    jobDescription: body.jobDescription,
    extractedKeywords: JSON.stringify(body.extractedKeywords || []),
    selectedItemIds: JSON.stringify(body.selectedItemIds || []),
    coverage: JSON.stringify(body.coverage || {}),
    suggestions: body.suggestions ? JSON.stringify(body.suggestions) : null,
    outputTex: body.outputTex || null,
    createdAt: new Date().toISOString(),
  };

  await db.insert(assemblySessions).values(session);
  return NextResponse.json({ session }, { status: 201 });
}
