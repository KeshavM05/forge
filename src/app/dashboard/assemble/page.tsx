"use client";

import { useState, useEffect } from "react";
import { computeCoverage, type CoverageResult } from "@/lib/ats";

type BankItem = {
  id: string;
  kind: string;
  roleOrCompany: string | null;
  text: string;
  tags: string;
  active: boolean;
};

export default function AssemblePage() {
  const [jd, setJd] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [items, setItems] = useState<BankItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [coverage, setCoverage] = useState<CoverageResult | null>(null);
  const [step, setStep] = useState<"jd" | "select" | "review">("jd");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetch("/api/bank")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []));
  }, []);

  useEffect(() => {
    if (keywords.length === 0) return;
    const selectedTexts = items
      .filter((i) => selectedIds.has(i.id))
      .map((i) => i.text);
    setCoverage(computeCoverage(keywords, selectedTexts));
  }, [selectedIds, keywords, items]);

  async function analyzeJd() {
    if (!jd.trim()) return;
    setAnalyzing(true);
    const res = await fetch("/api/analyze-jd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription: jd }),
    });
    const data = await res.json();
    setKeywords(data.keywords || []);
    setAnalyzing(false);
    setStep("select");
  }

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function downloadTex() {
    const selectedItems = items.filter((i) => selectedIds.has(i.id));
    const grouped = groupByKind(selectedItems);
    const tex = buildTex(grouped);
    const blob = new Blob([tex], { type: "application/x-tex" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.tex";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Assemble Resume
      </h1>

      {step === "jd" && (
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">
            Paste the job description
          </label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={12}
            placeholder="Paste the full job description here..."
            className="w-full rounded-lg border border-foreground/15 bg-background px-4 py-3 text-sm resize-none font-mono"
          />
          <button
            onClick={analyzeJd}
            disabled={analyzing || !jd.trim()}
            className="self-start rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {analyzing ? "Analyzing..." : "Analyze & Select"}
          </button>
        </div>
      )}

      {step === "select" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Select items ({selectedIds.size} selected)
              </p>
              <button
                onClick={() => setStep("jd")}
                className="text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                Edit JD
              </button>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-foreground/40">
                No items in your bank.{" "}
                <a
                  href="/dashboard/bank"
                  className="text-blue-600 hover:underline"
                >
                  Add some first.
                </a>
              </p>
            ) : (
              items.map((item) => (
                <label
                  key={item.id}
                  className={`flex gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                    selectedIds.has(item.id)
                      ? "border-blue-500 bg-blue-600/5"
                      : "border-foreground/10 hover:border-foreground/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-md bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {item.kind}
                      </span>
                      {item.roleOrCompany && (
                        <span className="text-xs text-foreground/50">
                          {item.roleOrCompany}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{item.text}</p>
                  </div>
                </label>
              ))
            )}
            {selectedIds.size > 0 && (
              <button
                onClick={downloadTex}
                className="self-start rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 mt-2"
              >
                Download .tex
              </button>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <CoveragePanel coverage={coverage} keywords={keywords} />
          </aside>
        </div>
      )}
    </div>
  );
}

function CoveragePanel({
  coverage,
  keywords,
}: {
  coverage: CoverageResult | null;
  keywords: string[];
}) {
  if (!coverage) return null;
  return (
    <div className="rounded-xl border border-foreground/10 p-4 sticky top-6">
      <h3 className="font-semibold mb-3">ATS Coverage</h3>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl font-bold">
          <span
            className={
              coverage.score >= 70
                ? "text-green-600"
                : coverage.score >= 40
                  ? "text-yellow-600"
                  : "text-red-600"
            }
          >
            {coverage.score}%
          </span>
        </div>
        <div className="text-sm text-foreground/50">
          {coverage.covered.length}/{keywords.length} keywords covered
        </div>
      </div>
      {coverage.covered.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-green-600 mb-1">Covered</p>
          <div className="flex flex-wrap gap-1">
            {coverage.covered.map((kw) => (
              <span
                key={kw}
                className="rounded bg-green-600/10 px-1.5 py-0.5 text-xs text-green-700 dark:text-green-400"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
      {coverage.missing.length > 0 && (
        <div>
          <p className="text-xs font-medium text-red-600 mb-1">Missing</p>
          <div className="flex flex-wrap gap-1">
            {coverage.missing.map((kw) => (
              <span
                key={kw}
                className="rounded bg-red-600/10 px-1.5 py-0.5 text-xs text-red-700 dark:text-red-400"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function groupByKind(
  items: BankItem[]
): Record<string, BankItem[]> {
  const groups: Record<string, BankItem[]> = {};
  for (const item of items) {
    if (!groups[item.kind]) groups[item.kind] = [];
    groups[item.kind].push(item);
  }
  return groups;
}

function buildTex(grouped: Record<string, BankItem[]>): string {
  const sections: string[] = [];

  sections.push("\\documentclass[letterpaper,11pt]{article}");
  sections.push("\\usepackage[margin=0.75in]{geometry}");
  sections.push("\\usepackage{enumitem}");
  sections.push("\\setlength{\\parindent}{0pt}");
  sections.push("");
  sections.push("% TODO: Replace with your LaTeX template preamble");
  sections.push("");
  sections.push("\\begin{document}");
  sections.push("");
  sections.push("% TODO: Add your header/name section from your template");
  sections.push("");

  const sectionOrder = [
    "experience",
    "project",
    "education",
    "skill",
    "certification",
  ];
  const sectionTitles: Record<string, string> = {
    experience: "Experience",
    project: "Projects",
    education: "Education",
    skill: "Skills",
    certification: "Certifications",
  };

  for (const kind of sectionOrder) {
    const items = grouped[kind];
    if (!items || items.length === 0) continue;

    sections.push(
      `\\section*{${sectionTitles[kind] || kind.charAt(0).toUpperCase() + kind.slice(1)}}`
    );

    if (kind === "skill") {
      sections.push(
        items.map((i) => escapeLatex(i.text)).join(" \\textbar\\ ")
      );
    } else {
      sections.push("\\begin{itemize}[leftmargin=*]");
      for (const item of items) {
        const prefix = item.roleOrCompany
          ? `\\textbf{${escapeLatex(item.roleOrCompany)}} --- `
          : "";
        sections.push(`  \\item ${prefix}${escapeLatex(item.text)}`);
      }
      sections.push("\\end{itemize}");
    }
    sections.push("");
  }

  sections.push("\\end{document}");
  return sections.join("\n");
}

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}~^]/g, (m) => `\\${m}`);
}
