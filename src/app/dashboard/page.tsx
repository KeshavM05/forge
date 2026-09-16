"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Sparkles,
  CheckCircle,
  Send,
  X,
  Download,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ArrowRightLeft,
  FileText,
  Loader2,
  Pencil,
  Eye,
  Code,
} from "lucide-react";
import { type SeedEntry } from "@/lib/seed-bank";
import { assembleResume, type BulletEdit } from "@/lib/latex-assembler";
import { useIDEDispatch } from "@/components/ide/ide-context";
import { useBank } from "@/lib/bank-store";

type AnalysisResult = {
  jdAnalysis: {
    role: string;
    company: string;
    keyRequirements: string[];
    atsKeywords: string[];
  };
  selection: {
    experiences: { index: number; title: string; reason: string }[];
    project: { index: number; title: string; reason: string };
  };
  coverage: {
    score: number;
    covered: string[];
    missing: string[];
  };
  suggestedEdits: BulletEdit[];
};

type Step = "input" | "analyzing" | "review" | "compiled";

export default function AgentWorkspace() {
  const bank = useBank();
  const dispatch = useIDEDispatch();
  const [jd, setJd] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedExps, setSelectedExps] = useState<SeedEntry[]>([]);
  const [selectedProject, setSelectedProject] = useState<SeedEntry | null>(null);
  const [acceptedEdits, setAcceptedEdits] = useState<Set<number>>(new Set());
  const [outputTex, setOutputTex] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"pdf" | "tex">("pdf");
  const [error, setError] = useState<string | null>(null);

  const experiences = bank.experiences;
  const projects = bank.projects;

  const synthesize = useCallback(async () => {
    if (!jd.trim() || experiences.length === 0) return;
    setStep("analyzing");
    setError(null);
    dispatch({ type: "SET_AGENT_STATUS", status: "running" });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, experiences, projects }),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error || "Analysis failed");
      }

      const data = (await res.json()) as AnalysisResult;
      setAnalysis(data);

      const selExps = data.selection.experiences
        .map((s) => experiences[s.index])
        .filter(Boolean);
      const selProj = projects[data.selection.project.index] || projects[0];

      setSelectedExps(selExps);
      setSelectedProject(selProj);
      setAcceptedEdits(new Set());

      const tex = assembleResume(selExps, selProj, bank.educationTex, bank.skillsTex);
      setOutputTex(tex);
      setStep("review");

      dispatch({ type: "SET_AGENT_STATUS", status: "done" });
      dispatch({ type: "SET_COVERAGE", score: data.coverage.score });

      compilePdf(tex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStep("input");
      dispatch({ type: "SET_AGENT_STATUS", status: "idle" });
    }
  }, [jd, experiences, projects, bank.educationTex, bank.skillsTex, dispatch]);

  async function compilePdf(tex: string) {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tex }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Compile failed" })) as { error: string };
        throw new Error(err.error || "Compilation failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(url);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "PDF compile failed");
    } finally {
      setPdfLoading(false);
    }
  }

  function recompile() {
    const edits = analysis?.suggestedEdits
      ?.filter((_, i) => acceptedEdits.has(i)) || [];
    const tex = assembleResume(
      selectedExps, selectedProject!, bank.educationTex, bank.skillsTex, edits
    );
    setOutputTex(tex);
    compilePdf(tex);
  }

  function toggleEdit(index: number) {
    setAcceptedEdits((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  function downloadTex() {
    const blob = new Blob([outputTex], { type: "application/x-tex" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "resume.tex";
    a.click();
  }

  function downloadPdf() {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "resume.pdf";
    a.click();
  }

  function reset() {
    setStep("input");
    setJd("");
    setAnalysis(null);
    setSelectedExps([]);
    setSelectedProject(null);
    setAcceptedEdits(new Set());
    setOutputTex("");
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfError(null);
    setError(null);
    dispatch({ type: "SET_AGENT_STATUS", status: "idle" });
    dispatch({ type: "SET_COVERAGE", score: null });
  }

  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  return (
    <div className="flex w-full h-full">
      {/* LEFT — Agent Panel */}
      <div className="w-[440px] shrink-0 flex flex-col border-r border-border-muted bg-surface overflow-y-auto">
        <div className="p-4 flex flex-col gap-4 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              Agent
            </h2>
            {step !== "input" && step !== "analyzing" && (
              <button onClick={reset} className="text-[11px] text-text-muted hover:text-text-primary transition-colors">
                New session
              </button>
            )}
          </div>

          {/* JD Input */}
          <div className="rounded-lg bg-surface-mid p-3 focus-within:ring-1 focus-within:ring-accent/40 transition-all">
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows={step === "input" ? 12 : 3}
              placeholder="Paste the full job description here..."
              className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none resize-none leading-relaxed"
              disabled={step === "analyzing"}
            />
            {step === "input" && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-muted/50">
                <span className="text-[10px] text-text-muted">
                  {experiences.length} exp · {projects.length} proj in bank
                </span>
                <button
                  onClick={synthesize}
                  disabled={!jd.trim() || experiences.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-bold transition-all disabled:opacity-30"
                >
                  <Send size={11} />
                  Synthesize
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-danger/10 border border-danger/30 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}

          {/* Analyzing State */}
          {step === "analyzing" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-secondary">
              <Loader2 size={20} className="animate-spin text-accent" />
              <p className="text-xs">Analyzing JD with Claude Sonnet...</p>
              <p className="text-[10px] text-text-muted">Extracting keywords, scoring entries, finding gaps</p>
            </div>
          )}

          {/* Analysis Results */}
          {(step === "review" || step === "compiled") && analysis && (
            <>
              {/* JD Summary */}
              <div className="rounded-lg bg-surface-mid/50 p-3">
                <p className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest mb-1.5">
                  {analysis.jdAnalysis.role} at {analysis.jdAnalysis.company}
                </p>
                <div className="flex flex-wrap gap-1">
                  {analysis.jdAnalysis.keyRequirements.map((req) => (
                    <span key={req} className="px-1.5 py-px rounded bg-accent/8 text-[10px] text-accent">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected Entries */}
              <Section label="Experiences" count={selectedExps.length}>
                {selectedExps.map((exp, i) => (
                  <EntryCard
                    key={exp.title + i}
                    entry={exp}
                    reason={analysis.selection.experiences[i]?.reason}
                    alternatives={experiences.filter((e) => e.title !== exp.title)}
                    onSwap={(e) => {
                      const next = [...selectedExps];
                      next[i] = e;
                      setSelectedExps(next);
                    }}
                  />
                ))}
              </Section>

              <Section label="Project" count={1}>
                {selectedProject && (
                  <EntryCard
                    entry={selectedProject}
                    reason={analysis.selection.project.reason}
                    alternatives={projects.filter(
                      (p) => p.title !== selectedProject.title && !selectedExps.some((e) => e.title === p.title)
                    )}
                    onSwap={(p) => setSelectedProject(p)}
                  />
                )}
              </Section>

              {/* Suggested Edits */}
              {analysis.suggestedEdits.length > 0 && (
                <Section label="Suggested Edits" count={analysis.suggestedEdits.length}>
                  {analysis.suggestedEdits.map((edit, i) => (
                    <div key={i} className={`rounded-lg p-2.5 text-[10px] font-mono border transition-all cursor-pointer ${
                      acceptedEdits.has(i) ? "bg-success/5 border-success/30" : "bg-surface-mid/50 border-border-muted/50 hover:border-border"
                    }`} onClick={() => toggleEdit(i)}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-text-muted">{edit.entryTitle} · bullet {edit.bulletIndex}</span>
                        <span className={`text-[9px] font-semibold ${acceptedEdits.has(i) ? "text-success" : "text-text-muted"}`}>
                          {acceptedEdits.has(i) ? "ACCEPTED" : "CLICK TO ACCEPT"}
                        </span>
                      </div>
                      <p className="text-danger/60 line-through mb-0.5 leading-relaxed">{stripLatex(edit.original)}</p>
                      <p className="text-success leading-relaxed">{stripLatex(edit.edited)}</p>
                      <p className="text-text-muted mt-1 italic">{edit.reason}</p>
                    </div>
                  ))}
                </Section>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-3">
                {acceptedEdits.size > 0 && (
                  <button onClick={recompile} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-success/90 text-white text-xs font-semibold hover:bg-success transition-all">
                    <Sparkles size={13} />
                    Apply {acceptedEdits.size} edit{acceptedEdits.size > 1 ? "s" : ""} & Recompile
                  </button>
                )}
                <button onClick={downloadTex} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-surface-mid text-text-secondary text-xs font-medium hover:bg-surface-high transition-all" title="Download .tex">
                  <Code size={12} /> .tex
                </button>
                {pdfUrl && (
                  <button onClick={downloadPdf} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-bold transition-all" title="Download PDF">
                    <Download size={12} /> PDF
                  </button>
                )}
                <button onClick={reset} className="px-3 py-2 rounded-md bg-surface-mid text-text-muted hover:text-danger hover:bg-danger/10 text-xs transition-all">
                  <X size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT — PDF Preview + ATS */}
      <div className="flex-1 flex flex-col overflow-hidden bg-base">
        {analysis ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-border-muted shrink-0">
              <div className="flex items-center p-0.5 rounded-md bg-surface-mid">
                <button onClick={() => setViewMode("pdf")} className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${viewMode === "pdf" ? "bg-surface-high text-text-primary shadow-sm" : "text-text-muted"}`}>
                  <Eye size={11} /> Preview
                </button>
                <button onClick={() => setViewMode("tex")} className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${viewMode === "tex" ? "bg-surface-high text-text-primary shadow-sm" : "text-text-muted"}`}>
                  <Code size={11} /> LaTeX
                </button>
              </div>
              <ATSBadge coverage={analysis.coverage} />
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Document area */}
              <div className="flex-1 overflow-auto bg-surface-highest/30">
                {viewMode === "pdf" ? (
                  <div className="h-full flex items-center justify-center p-4">
                    {pdfLoading ? (
                      <div className="flex flex-col items-center gap-3 text-text-secondary">
                        <Loader2 size={24} className="animate-spin text-accent" />
                        <p className="text-xs">Compiling LaTeX...</p>
                      </div>
                    ) : pdfError ? (
                      <div className="flex flex-col items-center gap-2 text-danger text-center max-w-sm">
                        <AlertTriangle size={20} />
                        <p className="text-xs font-medium">Compilation Error</p>
                        <p className="text-[10px] text-text-muted">{pdfError}</p>
                        <button onClick={() => compilePdf(outputTex)} className="mt-2 px-3 py-1 rounded-md bg-surface-mid text-text-secondary text-[11px] hover:bg-surface-high transition-all">
                          Retry
                        </button>
                      </div>
                    ) : pdfUrl ? (
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full rounded shadow-2xl shadow-black/40 bg-white"
                        title="Resume PDF Preview"
                      />
                    ) : (
                      <p className="text-xs text-text-muted">No PDF yet</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4">
                    <pre className="max-w-[700px] mx-auto text-[11px] font-mono leading-[1.65] text-text-secondary whitespace-pre-wrap">
                      {outputTex}
                    </pre>
                  </div>
                )}
              </div>

              {/* ATS Panel */}
              <div className="w-[250px] shrink-0 border-l border-border-muted overflow-y-auto p-4 bg-surface/50">
                <ATSPanel coverage={analysis.coverage} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-4 px-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-mid/60 flex items-center justify-center">
              <FileText size={22} className="text-text-muted/60" />
            </div>
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-1">Paste a job description to begin</p>
              <p className="text-xs text-text-muted max-w-xs">
                Claude analyzes the JD, selects the best content from your bank, scores ATS coverage, and compiles a real PDF preview
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-mono text-text-muted">{count}</span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function EntryCard({ entry, reason, alternatives, onSwap }: { entry: SeedEntry; reason?: string; alternatives: SeedEntry[]; onSwap: (e: SeedEntry) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showSwap, setShowSwap] = useState(false);

  return (
    <div className="rounded-lg bg-surface-mid/50 border border-border-muted/50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <button onClick={() => setExpanded(!expanded)} className="flex-1 flex items-center gap-2 text-left min-w-0">
          {expanded ? <ChevronDown size={11} className="text-text-muted shrink-0" /> : <ChevronRight size={11} className="text-text-muted shrink-0" />}
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-text-primary truncate">{entry.title}</p>
            <p className="text-[10px] text-text-muted truncate">{entry.subtitle}</p>
          </div>
        </button>
        <CheckCircle size={12} className="text-accent shrink-0" />
        {alternatives.length > 0 && (
          <button onClick={() => setShowSwap(!showSwap)} className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-all">
            <ArrowRightLeft size={10} />
          </button>
        )}
      </div>
      {reason && <p className="px-3 pb-1.5 text-[10px] text-accent/70 italic">{reason}</p>}
      {expanded && (
        <div className="px-3 pb-2 space-y-1">
          {entry.bullets.map((b, i) => (
            <p key={i} className="text-[10px] text-text-secondary leading-relaxed pl-4 border-l border-border-muted">{stripLatex(b)}</p>
          ))}
        </div>
      )}
      {showSwap && (
        <div className="border-t border-border-muted/30 bg-surface-low/50 p-1.5 space-y-0.5">
          {alternatives.map((alt) => (
            <button key={alt.title} onClick={() => { onSwap(alt); setShowSwap(false); }}
              className="w-full text-left px-2 py-1 rounded text-[10px] text-text-secondary hover:bg-surface-mid hover:text-text-primary transition-colors truncate">
              {alt.title} — <span className="text-text-muted">{alt.subtitle}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ATSBadge({ coverage }: { coverage: AnalysisResult["coverage"] }) {
  const c = coverage.score >= 70 ? "text-success" : coverage.score >= 40 ? "text-warning" : "text-danger";
  return (
    <div className="flex items-center gap-2">
      <span className={`text-base font-bold font-mono ${c}`}>{coverage.score}%</span>
      <span className="text-[10px] text-text-muted">{coverage.covered.length}/{coverage.covered.length + coverage.missing.length} keywords</span>
    </div>
  );
}

function ATSPanel({ coverage }: { coverage: AnalysisResult["coverage"] }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">ATS Score</span>
          <span className={`text-2xl font-bold font-mono ${coverage.score >= 70 ? "text-success" : coverage.score >= 40 ? "text-warning" : "text-danger"}`}>{coverage.score}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface-highest overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${coverage.score >= 70 ? "bg-success" : coverage.score >= 40 ? "bg-warning" : "bg-danger"}`} style={{ width: `${coverage.score}%` }} />
        </div>
      </div>
      {coverage.covered.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <CheckCircle size={10} className="text-success" />
            <span className="text-[10px] font-mono text-success font-medium">{coverage.covered.length} covered</span>
          </div>
          <div className="flex flex-wrap gap-1">{coverage.covered.map((kw) => (
            <span key={kw} className="px-1.5 py-px rounded bg-success/8 text-[9px] font-mono text-success/80">{kw}</span>
          ))}</div>
        </div>
      )}
      {coverage.missing.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <AlertTriangle size={10} className="text-danger" />
            <span className="text-[10px] font-mono text-danger font-medium">{coverage.missing.length} gaps</span>
          </div>
          <div className="flex flex-wrap gap-1">{coverage.missing.map((kw) => (
            <span key={kw} className="px-1.5 py-px rounded bg-danger/8 text-[9px] font-mono text-danger/70">{kw}</span>
          ))}</div>
        </div>
      )}
    </div>
  );
}

function stripLatex(text: string): string {
  return text
    .replace(/\\textbf\{([^}]*)\}/g, "$1")
    .replace(/\\textit\{([^}]*)\}/g, "$1")
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")
    .replace(/\\emph\{([^}]*)\}/g, "$1")
    .replace(/\\\$/g, "$").replace(/\\&/g, "&").replace(/\\%/g, "%")
    .replace(/\\_/g, "_").replace(/\\#/g, "#").replace(/\\\\/g, "")
    .replace(/\{|\}/g, "");
}
