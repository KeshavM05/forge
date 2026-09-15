import { NextResponse } from "next/server";
import { MASTER_BANK } from "@/lib/seed-bank";

export async function GET() {
  const items = MASTER_BANK.map((entry, i) => ({
    id: `seed-${i}`,
    kind: entry.kind,
    title: entry.title,
    subtitle: entry.subtitle,
    dateRange: entry.dateRange,
    location: entry.location,
    bullets: entry.bullets,
    tags: entry.tags,
  }));
  return NextResponse.json({ items });
}
