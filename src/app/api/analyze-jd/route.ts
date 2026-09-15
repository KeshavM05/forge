import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { jobDescription } = await request.json();
  if (!jobDescription || typeof jobDescription !== "string") {
    return NextResponse.json(
      { error: "jobDescription is required" },
      { status: 400 }
    );
  }

  const keywords = extractKeywords(jobDescription);
  return NextResponse.json({ keywords });
}

function extractKeywords(text: string): string[] {
  const lines = text.toLowerCase().split(/\n/);
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s/]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const freq = new Map<string, number>();
  for (const w of words) {
    if (STOP_WORDS.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }

  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (STOP_WORDS.has(words[i]) || STOP_WORDS.has(words[i + 1])) continue;
    const bi = `${words[i]} ${words[i + 1]}`;
    bigrams.push(bi);
  }
  for (const bi of bigrams) {
    freq.set(bi, (freq.get(bi) || 0) + 1);
  }

  const requirementLines = lines.filter(
    (l) =>
      l.includes("require") ||
      l.includes("must have") ||
      l.includes("experience with") ||
      l.includes("proficiency") ||
      l.includes("familiarity") ||
      l.includes("knowledge of")
  );
  for (const line of requirementLines) {
    const lineWords = line
      .replace(/[^a-z0-9+#.\-\s/]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    for (const w of lineWords) {
      freq.set(w, (freq.get(w) || 0) + 2);
    }
  }

  return [...freq.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "had",
  "her",
  "was",
  "one",
  "our",
  "out",
  "has",
  "have",
  "been",
  "some",
  "them",
  "than",
  "its",
  "over",
  "such",
  "that",
  "with",
  "will",
  "this",
  "from",
  "they",
  "what",
  "which",
  "their",
  "other",
  "about",
  "more",
  "would",
  "make",
  "like",
  "into",
  "could",
  "time",
  "very",
  "when",
  "come",
  "each",
  "also",
  "your",
  "work",
  "role",
  "team",
  "ability",
  "strong",
  "looking",
  "including",
  "well",
  "join",
  "help",
  "part",
  "working",
  "etc",
]);
