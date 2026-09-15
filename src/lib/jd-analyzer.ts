import { type SeedEntry } from "./seed-bank";

export type SelectionResult = {
  experiences: SeedEntry[];
  project: SeedEntry;
  reasoning: Record<string, string>;
};

export type ATSResult = {
  keywords: string[];
  covered: string[];
  missing: string[];
  score: number;
};

export function extractJDKeywords(jd: string): string[] {
  const text = jd.toLowerCase();
  const words = text
    .replace(/[^a-z0-9+#.\-\s/]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const freq = new Map<string, number>();
  for (const w of words) {
    if (STOP_WORDS.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }

  for (let i = 0; i < words.length - 1; i++) {
    if (STOP_WORDS.has(words[i]) || STOP_WORDS.has(words[i + 1])) continue;
    const bi = `${words[i]} ${words[i + 1]}`;
    freq.set(bi, (freq.get(bi) || 0) + 1);
  }

  const requirementPatterns = [
    "require",
    "must have",
    "proficient",
    "experience with",
    "knowledge of",
    "familiarity",
    "understanding of",
  ];
  const lines = text.split(/\n/);
  for (const line of lines) {
    if (requirementPatterns.some((p) => line.includes(p))) {
      const lineWords = line
        .replace(/[^a-z0-9+#.\-\s/]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
      for (const w of lineWords) {
        freq.set(w, (freq.get(w) || 0) + 3);
      }
    }
  }

  return [...freq.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);
}

export function selectBestEntries(
  jd: string,
  experiences: SeedEntry[],
  projects: SeedEntry[]
): SelectionResult {
  const jdLower = jd.toLowerCase();
  const keywords = extractJDKeywords(jd);

  function scoreEntry(entry: SeedEntry): number {
    let score = 0;
    const allText = [
      entry.title,
      entry.subtitle || "",
      ...entry.bullets,
      ...entry.tags,
    ]
      .join(" ")
      .toLowerCase();

    for (const kw of keywords) {
      if (allText.includes(kw)) score += 3;
    }
    for (const tag of entry.tags) {
      if (jdLower.includes(tag.toLowerCase())) score += 2;
    }
    for (const bullet of entry.bullets) {
      const bulletLower = bullet.toLowerCase().replace(/\\textbf\{/g, "").replace(/\}/g, "");
      for (const kw of keywords) {
        if (bulletLower.includes(kw)) score += 1;
      }
    }
    return score;
  }

  const scoredExps = experiences
    .map((e) => ({ entry: e, score: scoreEntry(e) }))
    .sort((a, b) => b.score - a.score);

  const top3 = scoredExps.slice(0, 3).map((s) => s.entry);

  const selectedExpTitles = new Set(top3.map((e) => e.title));
  const scoredProjects = projects
    .filter((p) => !selectedExpTitles.has(p.title))
    .map((p) => ({ entry: p, score: scoreEntry(p) }))
    .sort((a, b) => b.score - a.score);

  const bestProject = scoredProjects[0]?.entry || projects[0];

  const reasoning: Record<string, string> = {};
  for (const exp of top3) {
    const matchedTags = exp.tags.filter((t) => jdLower.includes(t.toLowerCase()));
    reasoning[exp.title] = `Matched tags: ${matchedTags.join(", ")}`;
  }
  reasoning[bestProject.title] = `Best non-duplicate project for remaining keyword coverage`;

  return { experiences: top3, project: bestProject, reasoning };
}

export function computeATS(
  keywords: string[],
  experiences: SeedEntry[],
  project: SeedEntry
): ATSResult {
  const allText = [
    ...experiences.flatMap((e) => e.bullets),
    ...project.bullets,
    ...experiences.flatMap((e) => e.tags),
    ...project.tags,
  ]
    .join(" ")
    .toLowerCase()
    .replace(/\\textbf\{/g, "")
    .replace(/\}/g, "");

  const covered: string[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    if (allText.includes(kw.toLowerCase())) {
      covered.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const score =
    keywords.length === 0
      ? 100
      : Math.round((covered.length / keywords.length) * 100);

  return { keywords, covered, missing, score };
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "has", "have", "been", "some", "them",
  "than", "its", "over", "such", "that", "with", "will", "this", "from",
  "they", "what", "which", "their", "other", "about", "more", "would",
  "make", "like", "into", "could", "time", "very", "when", "come", "each",
  "also", "your", "work", "role", "team", "ability", "strong", "looking",
  "including", "well", "join", "help", "part", "working", "etc", "within",
  "apply", "new", "may", "two", "using", "must", "both", "during",
  "between", "these", "being", "various", "while", "where", "will",
  "who", "how", "day", "per", "week", "days", "year", "years",
]);
