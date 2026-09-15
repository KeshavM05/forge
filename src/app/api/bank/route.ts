import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { bankItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/id";

// TODO: replace with Clerk auth
const TEMP_USER_ID = "dev-user";

function getD1(request: NextRequest): D1Database | null {
  const env = (request as unknown as { cf?: { env?: CloudflareEnv } }).cf?.env;
  return env?.DB ?? null;
}

export async function GET(request: NextRequest) {
  const d1 = getD1(request);
  if (!d1) {
    return NextResponse.json({ items: [], mock: true });
  }
  const db = getDb(d1);
  const items = await db
    .select()
    .from(bankItems)
    .where(eq(bankItems.userId, TEMP_USER_ID));
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const d1 = getD1(request);
  if (!d1) {
    return NextResponse.json({ error: "D1 not available" }, { status: 503 });
  }
  const db = getDb(d1);
  const body = (await request.json()) as {
    kind: string;
    roleOrCompany?: string;
    text: string;
    tags?: string[];
    atsKeywords?: string[];
  };

  const newItem = {
    id: generateId(),
    userId: TEMP_USER_ID,
    kind: body.kind as
      | "experience"
      | "project"
      | "education"
      | "skill"
      | "certification",
    roleOrCompany: body.roleOrCompany || null,
    text: body.text,
    tags: JSON.stringify(body.tags || []),
    atsKeywords: JSON.stringify(body.atsKeywords || []),
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.insert(bankItems).values(newItem);
  return NextResponse.json({ item: newItem }, { status: 201 });
}
