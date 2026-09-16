"use client";

import { useState, useCallback, useEffect } from "react";
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
  Loader2,
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
    scoreAfterEdits?: number;
    coveredAfterEdits?: string[];
  };
  suggestedEdits: BulletEdit[];
  suggestedSkills?: string;
};

type Step = "input" | "analyzing" | "results";

export default function AgentWorkspace() {
  const bank = useBank();
  const dispatch = useIDEDispatch();
  const [jd, setJd] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedExps, setSelectedExps] = useState<SeedEntry[]>([]);
  const [selectedProject, setSelectedProject] = useState<SeedEntry | null>(null);
  const [acceptedEdits, setAcceptedEdits] = useState<Set<number>>(new Set());
  const [skillsAccepted, setSkillsAccepted] = useState(false);
  const [liveCoverage, setLiveCoverage] = useState<AnalysisResult["coverage"] | null>(null);
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
        body: JSON.stringify({ jd, experiences, projects, skillsTex: bank.skillsTex }),
      });
      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error || "Analysis failed");
      }
      const data = (await res.json()) as AnalysisResult;
      setAnalysis(data);

      const selExps = data.selection.experiences.map((s) => experiences[s.index]).filter(Boolean);
      const selProj = projects[data.selection.project.index] || projects[0];
      setSelectedExps(selExps);
      setSelectedProject(selProj);
      setAcceptedEdits(new Set());
      setSkillsAccepted(false);
      setLiveCoverage(data.coverage);

      const tex = assembleResume(selExps, selProj, bank.educationTex, bank.skillsTex);
      setOutputTex(tex);
      setStep("results");
      dispatch({ type: "SET_AGENT_STATUS", status: "done" });
      dispatch({ type: "SET_COVERAGE", score: data.coverage.score });
      compilePdf(tex);

      bank.saveTailored({
        name: `${data.jdAnalysis.role} — ${data.jdAnalysis.company}`,
        company: data.jdAnalysis.company,
        role: data.jdAnalysis.role,
        jd,
        tex,
        atsScore: data.coverage.score,
        coveredKeywords: data.coverage.covered,
        missingKeywords: data.coverage.missing,
        selectedExperiences: selExps.map((e) => e.title),
        selectedProject: selProj.title,
        analysis: JSON.stringify(data),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStep("input");
      dispatch({ type: "SET_AGENT_STATUS", status: "idle" });
    }
  }, [jd, experiences, projects, bank.educationTex, bank.skillsTex, bank.saveTailored, dispatch]);

  async function compilePdf(tex: string) {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tex }),
      });
      if (!res.ok) throw new Error("Compilation failed");
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
    if (!analysis || !selectedProject) return;
    const edits = analysis.suggestedEdits?.filter((_, i) => acceptedEdits.has(i)) || [];
    const skills = skillsAccepted && analysis.suggestedSkills ? analysis.suggestedSkills : bank.skillsTex;
    const tex = assembleResume(selectedExps, selectedProject, bank.educationTex, skills, edits);
    setOutputTex(tex);
    compilePdf(tex);
    if (analysis.coverage.scoreAfterEdits) {
      const newCoverage = {
        ...analysis.coverage,
        score: analysis.coverage.scoreAfterEdits,
        covered: analysis.coverage.coveredAfterEdits || analysis.coverage.covered,
        missing: analysis.coverage.missing.filter((kw) => !(analysis.coverage.coveredAfterEdits || []).includes(kw)),
      };
      setLiveCoverage(newCoverage);
      dispatch({ type: "SET_COVERAGE", score: newCoverage.score });
    }
  }

  function reset() {
    setStep("input");
    setJd("");
    setAnalysis(null);
    setSelectedExps([]);
    setSelectedProject(null);
    setAcceptedEdits(new Set());
    setSkillsAccepted(false);
    setLiveCoverage(null);
    setOutputTex("");
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfError(null);
    setError(null);
    dispatch({ type: "SET_AGENT_STATUS", status: "idle" });
    dispatch({ type: "SET_COVERAGE", score: null });
  }

  useEffect(() => { return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }; }, [pdfUrl]);

  const cov = liveCoverage || analysis?.coverage;

  // ── INPUT: full-screen centered prompt ──
  if (step === "input" || step === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-text-primary mb-2">
              What role are you applying for?
            </h1>
            <p className="text-sm text-text-secondary">
              Paste the job description and Forge will tailor your resume
            </p>
          </div>

          <div className="rounded-xl bg-surface-low border border-border-muted p-1 shadow-lg shadow-black/20">
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows={10}
              placeholder="Paste the full job description here..."
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none p-4 leading-relaxed"
              disabled={step === "analyzing"}
              autoFocus
            />
            <div className="flex items-center justify-between px-4 py-2 border-t border-border-muted/50">
              <span className="text-[11px] text-text-muted">
                {bank.experiences.length} experiences · {bank.projects.length} projects in bank
              </span>
              <button
                onClick={synthesize}
                disabled={step === "analyzing" || !jd.trim() || experiences.length === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {step === "analyzing" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing with Claude...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Synthesize
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-8 mt-8 text-[11px] text-text-muted">
            {["Paste JD", "AI selects content", "Review & edit", "Download PDF"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-6 h-px bg-border-muted -ml-4 mr-2" />}
                <div className="w-5 h-5 rounded-full bg-surface-mid flex items-center justify-center text-[10px] font-semibold text-text-secondary">{i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS: split layout ──
  return (
    <div className="flex w-full h-full">
      {/* LEFT: selections + edits */}
      <div className="w-[380px] shrink-0 flex flex-col border-r border-border-muted overflow-y-auto bg-surface">
        <div className="p-4 space-y-3 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {cov && (
                <span className={`text-lg font-bold font-mono ${cov.score >= 70 ? "text-success" : cov.score >= 40 ? "text-warning" : "text-danger"}`}>
                  {cov.score}%
                </span>
              )}
              <span className="text-xs text-text-secondary">ATS match</span>
            </div>
            <button onClick={reset} className="text-[11px] text-text-muted hover:text-text-primary transition-colors">New</button>
          </div>

          {/* JD summary */}
          {analysis && (
            <div className="rounded-lg bg-surface-mid/50 px-3 py-2">
              <p className="text-xs font-semibold text-text-primary">{analysis.jdAnalysis.role}</p>
              <p className="text-[10px] text-text-muted">{analysis.jdAnalysis.company}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {analysis.jdAnalysis.keyRequirements.slice(0, 6).map((r) => (
                  <span key={r} className="px-1.5 py-px rounded bg-accent/8 text-[9px] text-accent">{r}</span>
                ))}
              </div>
            </div>
          )}

          {/* Selected */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">Selected</span>
            {selectedExps.map((exp, i) => (
              <EntryCard key={exp.title + i} entry={exp} reason={analysis?.selection.experiences[i]?.reason}
                alternatives={experiences.filter((e) => e.title !== exp.title)}
                onSwap={(e) => { const n = [...selectedExps]; n[i] = e; setSelectedExps(n); }} />
            ))}
            {selectedProject && (
              <EntryCard entry={selectedProject} reason={analysis?.selection.project.reason}
                alternatives={projects.filter((p) => p.title !== selectedProject.title && !selectedExps.some((e) => e.title === p.title))}
                onSwap={(p) => setSelectedProject(p)} isProject />
            )}
          </div>

          {/* Edits */}
          {analysis && analysis.suggestedEdits.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">Suggested Edits</span>
              {analysis.suggestedEdits.map((edit, i) => (
                <div key={i} onClick={() => { const n = new Set(acceptedEdits); n.has(i) ? n.delete(i) : n.add(i); setAcceptedEdits(n); }}
                  className={`rounded-lg p-2 text-[10px] font-mono border transition-all cursor-pointer ${acceptedEdits.has(i) ? "bg-success/5 border-success/30" : "bg-surface-mid/40 border-border-muted/40 hover:border-border"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-muted">{edit.entryTitle}</span>
                    <span className={`text-[9px] font-semibold ${acceptedEdits.has(i) ? "text-success" : "text-text-muted"}`}>
                      {acceptedEdits.has(i) ? "ACCEPTED" : "ACCEPT"}
                    </span>
                  </div>
                  <p className="text-danger/50 line-through leading-relaxed">{stripLatex(edit.original).slice(0, 80)}...</p>
                  <p className="text-success leading-relaxed">{stripLatex(edit.edited).slice(0, 80)}...</p>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {analysis?.suggestedSkills && (
            <div onClick={() => setSkillsAccepted(!skillsAccepted)}
              className={`rounded-lg p-2 text-[10px] font-mono border transition-all cursor-pointer ${skillsAccepted ? "bg-success/5 border-success/30" : "bg-surface-mid/40 border-border-muted/40 hover:border-border"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">Skills Reorder</span>
                <span className={`text-[9px] font-semibold ${skillsAccepted ? "text-success" : "text-text-muted"}`}>{skillsAccepted ? "ACCEPTED" : "ACCEPT"}</span>
              </div>
              <p className="text-text-secondary leading-relaxed">{analysis.suggestedSkills.slice(0, 150)}...</p>
            </div>
          )}

          {/* ATS keywords */}
          {cov && (
            <div className="space-y-2">
              <div className="w-full h-1 rounded-full bg-surface-highest overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${cov.score >= 70 ? "bg-success" : cov.score >= 40 ? "bg-warning" : "bg-danger"}`} style={{ width: `${cov.score}%` }} />
              </div>
              {cov.missing.length > 0 && (
                <div>
                  <span className="text-[9px] font-mono text-danger">{cov.missing.length} missing</span>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {cov.missing.map((kw) => <span key={kw} className="px-1 py-px rounded bg-danger/8 text-[9px] font-mono text-danger/70">{kw}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="p-3 border-t border-border-muted flex gap-2">
          {(acceptedEdits.size > 0 || skillsAccepted) && (
            <button onClick={recompile} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-success text-white text-xs font-semibold hover:bg-success-dim transition-all">
              <Sparkles size={12} /> Apply & Recompile
            </button>
          )}
          <button onClick={() => { const blob = new Blob([outputTex], { type: "application/x-tex" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "resume.tex"; a.click(); }}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-surface-mid text-text-secondary text-xs font-medium hover:bg-surface-high transition-all">
            <Code size={11} /> .tex
          </button>
          {pdfUrl && (
            <button onClick={() => { const a = document.createElement("a"); a.href = pdfUrl; a.download = "resume.pdf"; a.click(); }}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-bold transition-all">
              <Download size={11} /> PDF
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: PDF preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border-muted shrink-0">
          <div className="flex p-0.5 rounded-md bg-surface-mid">
            <button onClick={() => setViewMode("pdf")} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${viewMode === "pdf" ? "bg-surface-high text-text-primary shadow-sm" : "text-text-muted"}`}>
              <Eye size={10} /> Preview
            </button>
            <button onClick={() => setViewMode("tex")} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${viewMode === "tex" ? "bg-surface-high text-text-primary shadow-sm" : "text-text-muted"}`}>
              <Code size={10} /> LaTeX
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-surface-highest/20">
          {viewMode === "pdf" ? (
            <div className="h-full flex items-center justify-center p-4">
              {pdfLoading ? (
                <div className="flex flex-col items-center gap-2 text-text-secondary">
                  <Loader2 size={20} className="animate-spin text-accent" />
                  <p className="text-xs">Compiling LaTeX...</p>
                </div>
              ) : pdfError ? (
                <div className="text-center text-danger">
                  <AlertTriangle size={18} className="mx-auto mb-2" />
                  <p className="text-xs mb-2">{pdfError}</p>
                  <button onClick={() => compilePdf(outputTex)} className="px-3 py-1 rounded bg-surface-mid text-text-secondary text-[11px]">Retry</button>
                </div>
              ) : pdfUrl ? (
                <iframe src={pdfUrl} className="w-full h-full bg-white rounded shadow-2xl shadow-black/30" title="Resume PDF" />
              ) : null}
            </div>
          ) : (
            <pre className="p-4 text-[11px] font-mono leading-[1.6] text-text-secondary whitespace-pre-wrap max-w-[700px] mx-auto">{outputTex}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

function EntryCard({ entry, reason, alternatives, onSwap, isProject }: {
  entry: SeedEntry; reason?: string; alternatives: SeedEntry[]; onSwap: (e: SeedEntry) => void; isProject?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  return (
    <div className={`rounded-lg border overflow-hidden ${isProject ? "border-warning/20 bg-warning/[0.03]" : "border-border-muted/40 bg-surface-mid/30"}`}>
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <button onClick={() => setExpanded(!expanded)} className="flex-1 flex items-center gap-1.5 text-left min-w-0">
          {expanded ? <ChevronDown size={10} className="text-text-muted shrink-0" /> : <ChevronRight size={10} className="text-text-muted shrink-0" />}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {isProject && <span className="text-[8px] font-mono font-bold text-warning bg-warning/10 px-1 rounded">PROJ</span>}
              <p className="text-[11px] font-medium text-text-primary truncate">{entry.title}</p>
            </div>
            <p className="text-[10px] text-text-muted truncate">{entry.subtitle}</p>
          </div>
        </button>
        <CheckCircle size={11} className={isProject ? "text-warning" : "text-accent"} />
        {alternatives.length > 0 && (
          <button onClick={() => setShowSwap(!showSwap)} className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-all">
            <ArrowRightLeft size={9} />
          </button>
        )}
      </div>
      {reason && <p className="px-2.5 pb-1 text-[9px] text-accent/60 italic">{reason}</p>}
      {expanded && (
        <div className="px-2.5 pb-2 space-y-0.5">
          {entry.bullets.map((b, i) => <p key={i} className="text-[9px] text-text-secondary leading-relaxed pl-3 border-l border-border-muted">{stripLatex(b)}</p>)}
        </div>
      )}
      {showSwap && (
        <div className="border-t border-border-muted/30 p-1 space-y-px">
          {alternatives.map((alt) => (
            <button key={alt.title} onClick={() => { onSwap(alt); setShowSwap(false); }}
              className="w-full text-left px-2 py-1 rounded text-[10px] text-text-secondary hover:bg-surface-mid hover:text-text-primary transition-colors truncate">
              {alt.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function stripLatex(text: string): string {
  return text.replace(/\\textbf\{([^}]*)\}/g, "$1").replace(/\\textit\{([^}]*)\}/g, "$1")
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1").replace(/\\emph\{([^}]*)\}/g, "$1")
    .replace(/\\\$/g, "$").replace(/\\&/g, "&").replace(/\\%/g, "%").replace(/\\_/g, "_")
    .replace(/\\#/g, "#").replace(/\\\\/g, "").replace(/\{|\}/g, "");
}
