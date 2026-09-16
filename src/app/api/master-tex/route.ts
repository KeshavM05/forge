import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const tex = await readFile(
      join(process.cwd(), "templates", "resume", "master.tex"),
      "utf8"
    );
    return NextResponse.json({ tex });
  } catch {
    return NextResponse.json({ tex: null }, { status: 404 });
  }
}
