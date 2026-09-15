export type CoverageResult = {
  covered: string[];
  missing: string[];
  score: number;
};

export function computeCoverage(
  jdKeywords: string[],
  selectedTexts: string[]
): CoverageResult {
  const selectedLower = selectedTexts
    .map((t) => t.toLowerCase())
    .join(" ");
  const covered: string[] = [];
  const missing: string[] = [];

  for (const kw of jdKeywords) {
    if (selectedLower.includes(kw.toLowerCase())) {
      covered.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const total = jdKeywords.length;
  const score = total === 0 ? 100 : Math.round((covered.length / total) * 100);

  return { covered, missing, score };
}
