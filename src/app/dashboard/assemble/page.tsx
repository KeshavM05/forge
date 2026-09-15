"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Circle, Search, AlertTriangle } from "lucide-react";
import { computeCoverage, type CoverageResult } from "@/lib/ats";
import { useIDEDispatch } from "@/components/ide/ide-context";

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
  const [analyzing, setAnalyzing] = useState(false);
  const dispatch = useIDEDispatch();

  useEffect(() => {
    fetch("/api/bank")
      .then((r) => r.json() as Promise<{ items?: BankItem[] }>)
      .then((data) => setItems(data.items || []));
  }, []);

  useEffect(() => {
    if (keywords.length === 0) {
      setCoverage(null);
      dispatch({ type: "SET_COVERAGE", score: null });
      return;
    }
    const selectedTexts = items
      .filter((i) => selectedIds.has(i.id))
      .map((i) => i.text);
    const result = computeCoverage(keywords, selectedTexts);
    setCoverage(result);
    dispatch({ type: "SET_COVERAGE", score: result.score });
    dispatch({
      type: "SET_COUNTS",
      selected: selectedIds.size,
      bank: items.length,
    });
  }, [selectedIds, keywords, items, dispatch]);

  async function analyzeJd() {
    if (!jd.trim()) return;
    setAnalyzing(true);
    const res = await fetch("/api/analyze-jd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription: jd }),
    });
    const data = (await res.json()) as { keywords?: string[] };
    setKeywords(data.keywords || []);
    setAnalyzing(false);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full">
      {/* Left: JD + Keywords */}
      <div className="lg:col-span-3 flex flex-col bg-surface-low border-r border-border-muted/30 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted/30">
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
            Job Description
          </span>
        </div>
        <div className="p-3 flex flex-col gap-3">
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={8}
            placeholder="Paste the full job description here..."
            className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/60 resize-none"
          />
          <button
            onClick={analyzeJd}
            disabled={analyzing || !jd.trim()}
            className="w-full px-3 py-1.5 rounded bg-accent text-base text-xs font-medium hover:bg-accent-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Search size={12} />
            {analyzing ? "Analyzing..." : "Extract Keywords"}
          </button>
        </div>

        {keywords.length > 0 && (
          <div className="px-3 pb-3">
            <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider block mb-2">
              Extracted Keywords ({keywords.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {keywords.map((kw) => {
                const isCovered = coverage?.covered.includes(kw);
                return (
                  <span
                    key={kw}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isCovered
                        ? "bg-success-dim/20 text-success"
                        : "bg-danger-dim/20 text-danger"
                    }`}
                  >
                    {kw}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Center: Item Selection */}
      <div className="lg:col-span-5 flex flex-col overflow-y-auto border-r border-border-muted/30">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted/30">
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
            Select Items ({selectedIds.size} selected)
          </span>
          {selectedIds.size > 0 && (
            <button
              onClick={downloadTex}
              className="px-2 py-0.5 rounded bg-accent text-base text-[11px] font-medium hover:bg-accent-bold transition-colors"
            >
              Download .tex
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
            <p>
              No items in bank.{" "}
              <a href="/dashboard/bank" className="text-accent hover:underline">
                Add some first.
              </a>
            </p>
          </div>
        ) : (
          <div className="flex-1 p-2 space-y-1">
            {items.map((item) => {
              const selected = selectedIds.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors flex gap-2.5 ${
                    selected
                      ? "bg-accent-subtle border border-accent/30"
                      : "bg-surface-low/50 border border-transparent hover:border-border-muted/30 hover:bg-surface-mid/50"
                  }`}
                >
                  {selected ? (
                    <CheckCircle
                      size={16}
                      className="text-accent shrink-0 mt-0.5"
                    />
                  ) : (
                    <Circle
                      size={16}
                      className="text-text-muted shrink-0 mt-0.5"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-mono font-medium text-accent uppercase">
                        {item.kind}
                      </span>
                      {item.roleOrCompany && (
                        <span className="text-[10px] text-text-muted truncate">
                          · {item.roleOrCompany}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-primary leading-relaxed line-clamp-2">
                      {item.text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: ATS Coverage */}
      <div className="lg:col-span-4 flex flex-col bg-surface-low/40 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted/30">
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
            ATS Coverage
          </span>
        </div>

        {coverage ? (
          <div className="p-4 space-y-4">
            {/* Score */}
            <div className="flex items-center gap-3">
              <span
                className={`text-4xl font-bold font-mono ${
                  coverage.score >= 70
                    ? "text-success"
                    : coverage.score >= 40
                      ? "text-warning"
                      : "text-danger"
                }`}
              >
                {coverage.score}%
              </span>
              <div className="text-xs text-text-secondary">
                <p>
                  {coverage.covered.length}/{keywords.length} keywords covered
                </p>
                <p>{selectedIds.size} items selected</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-surface-highest">
              <div
                className={`h-full rounded-full transition-all ${
                  coverage.score >= 70
                    ? "bg-success"
                    : coverage.score >= 40
                      ? "bg-warning"
                      : "bg-danger"
                }`}
                style={{ width: `${coverage.score}%` }}
              />
            </div>

            {/* Covered */}
            {coverage.covered.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle size={12} className="text-success" />
                  <span className="text-[11px] font-mono font-medium text-success">
                    Covered ({coverage.covered.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {coverage.covered.map((kw) => (
                    <span
                      key={kw}
                      className="px-1.5 py-0.5 rounded bg-success-dim/15 text-[10px] font-mono text-success"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing */}
            {coverage.missing.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={12} className="text-danger" />
                  <span className="text-[11px] font-mono font-medium text-danger">
                    Missing ({coverage.missing.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {coverage.missing.map((kw) => (
                    <span
                      key={kw}
                      className="px-1.5 py-0.5 rounded bg-danger-dim/15 text-[10px] font-mono text-danger"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-6 text-center">
            <Search size={24} className="mb-2 opacity-40" />
            <p className="text-sm mb-1">Paste a JD to see coverage</p>
            <p className="text-xs">
              Keywords are extracted and matched against your selected items
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function groupByKind(items: BankItem[]): Record<string, BankItem[]> {
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
  sections.push("\\begin{document}");
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
    const kindItems = grouped[kind];
    if (!kindItems || kindItems.length === 0) continue;
    sections.push(
      `\\section*{${sectionTitles[kind] || kind.charAt(0).toUpperCase() + kind.slice(1)}}`
    );
    if (kind === "skill") {
      sections.push(
        kindItems.map((i) => escapeLatex(i.text)).join(" \\textbar\\ ")
      );
    } else {
      sections.push("\\begin{itemize}[leftmargin=*]");
      for (const item of kindItems) {
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
