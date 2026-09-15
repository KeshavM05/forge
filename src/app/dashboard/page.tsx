"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  CheckCircle,
  Circle,
  Send,
  ThumbsUp,
  X,
  Download,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { type SeedEntry } from "@/lib/seed-bank";
import {
  extractJDKeywords,
  selectBestEntries,
  computeATS,
  type ATSResult,
} from "@/lib/jd-analyzer";
import { assembleResume, type BulletEdit } from "@/lib/latex-assembler";
import { useIDEDispatch } from "@/components/ide/ide-context";
import { useBank } from "@/lib/bank-store";

type Step = "input" | "review" | "done";

export default function AgentWorkspace() {
  const bank = useBank();
  const [jd, setJd] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [selectedExps, setSelectedExps] = useState<SeedEntry[]>([]);
  const [selectedProject, setSelectedProject] = useState<SeedEntry | null>(
    null
  );
  const [reasoning, setReasoning] = useState<Record<string, string>>({});
  const [ats, setAts] = useState<ATSResult | null>(null);
  const [edits, setEdits] = useState<BulletEdit[]>([]);
  const [outputTex, setOutputTex] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const dispatch = useIDEDispatch();

  const experiences = bank.experiences;
  const projects = bank.projects;

  const synthesize = useCallback(() => {
    if (!jd.trim()) return;
    setAnalyzing(true);
    dispatch({ type: "SET_AGENT_STATUS", status: "running" });

    setTimeout(() => {
      const keywords = extractJDKeywords(jd);
      const selection = selectBestEntries(jd, experiences, projects);
      const coverage = computeATS(
        keywords,
        selection.experiences,
        selection.project
      );

      setSelectedExps(selection.experiences);
      setSelectedProject(selection.project);
      setReasoning(selection.reasoning);
      setAts(coverage);
      setEdits([]);
      setStep("review");
      setAnalyzing(false);

      dispatch({ type: "SET_AGENT_STATUS", status: "done" });
      dispatch({ type: "SET_COVERAGE", score: coverage.score });
      dispatch({
        type: "SET_COUNTS",
        selected: 3,
        bank: experiences.length + projects.length,
      });
    }, 600);
  }, [jd, dispatch]);

  function swapExperience(index: number, newEntry: SeedEntry) {
    const next = [...selectedExps];
    next[index] = newEntry;
    setSelectedExps(next);
    if (ats) {
      const keywords = extractJDKeywords(jd);
      const newAts = computeATS(keywords, next, selectedProject!);
      setAts(newAts);
      dispatch({ type: "SET_COVERAGE", score: newAts.score });
    }
  }

  function swapProject(newEntry: SeedEntry) {
    setSelectedProject(newEntry);
    if (ats) {
      const keywords = extractJDKeywords(jd);
      const newAts = computeATS(keywords, selectedExps, newEntry);
      setAts(newAts);
      dispatch({ type: "SET_COVERAGE", score: newAts.score });
    }
  }

  function approve() {
    if (!selectedProject) return;
    const tex = assembleResume(
      selectedExps,
      selectedProject,
      bank.educationTex,
      bank.skillsTex,
      edits
    );
    setOutputTex(tex);
    setStep("done");
  }

  function downloadTex() {
    const blob = new Blob([outputTex], { type: "application/x-tex" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.tex";
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setStep("input");
    setJd("");
    setSelectedExps([]);
    setSelectedProject(null);
    setAts(null);
    setEdits([]);
    setOutputTex("");
    dispatch({ type: "SET_AGENT_STATUS", status: "idle" });
    dispatch({ type: "SET_COVERAGE", score: null });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full bg-base text-text-primary">
      {/* LEFT: Agent Composer / Selection */}
      <div className="lg:col-span-5 flex flex-col bg-surface-low/40 overflow-y-auto">
        <div className="max-w-[560px] w-full mx-auto flex flex-col gap-5 p-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-base font-semibold tracking-tight">
                Agent Workspace
              </span>
            </div>
            {step !== "input" && (
              <button
                onClick={reset}
                className="text-[11px] font-mono text-text-secondary hover:text-text-primary transition-colors"
              >
                New Session
              </button>
            )}
          </div>

          {/* JD Input */}
          <div className="bg-surface-mid rounded-lg p-3 shadow-xl focus-within:ring-1 focus-within:ring-accent/60 transition-all">
            <div className="flex items-start gap-2.5">
              <Sparkles size={18} className="text-accent mt-0.5 shrink-0" />
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={step === "input" ? 6 : 2}
                placeholder="Paste the full job description here..."
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none"
                disabled={step === "done"}
              />
            </div>
            {step === "input" && (
              <div className="flex items-center justify-between pt-2 mt-2">
                <span className="text-[11px] font-mono text-text-muted">
                  Selects 3 experiences + 1 project from your bank
                </span>
                <button
                  onClick={synthesize}
                  disabled={analyzing || !jd.trim()}
                  className="px-3 py-1 bg-accent text-base rounded text-sm font-medium flex items-center gap-1.5 hover:bg-accent-bold transition-colors disabled:opacity-50"
                >
                  <span>{analyzing ? "Analyzing..." : "Synthesize"}</span>
                  <Send size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Selection Review */}
          {step !== "input" && selectedProject && (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
                  Selected Experiences (3)
                </span>
                {selectedExps.map((exp, i) => (
                  <EntryCard
                    key={exp.title + i}
                    entry={exp}
                    reason={reasoning[exp.title]}
                    selected
                    alternatives={experiences.filter(
                      (e) =>
                        !selectedExps.includes(e) || e.title === exp.title
                    )}
                    onSwap={(e) => swapExperience(i, e)}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
                  Selected Project (1)
                </span>
                <EntryCard
                  entry={selectedProject}
                  reason={reasoning[selectedProject.title]}
                  selected
                  alternatives={projects.filter(
                    (p) => p.title !== selectedProject.title
                  )}
                  onSwap={swapProject}
                />
              </div>

              {step === "review" && (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={approve}
                    className="flex-1 px-4 py-2 bg-accent text-base rounded text-sm font-medium hover:bg-accent-bold transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <ThumbsUp size={15} />
                    Approve & Generate .tex
                  </button>
                  <button
                    onClick={reset}
                    className="px-3 py-2 bg-surface-low hover:bg-danger-dim/30 hover:text-danger text-text-secondary rounded text-sm transition-colors"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {step === "done" && (
                <button
                  onClick={downloadTex}
                  className="px-4 py-2 bg-success text-base rounded text-sm font-medium hover:bg-success-dim transition-all flex items-center justify-center gap-2"
                >
                  <Download size={15} />
                  Download resume.tex
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT: ATS Coverage + Preview */}
      <div className="lg:col-span-7 flex flex-col bg-surface overflow-y-auto">
        {ats ? (
          <div className="flex flex-col gap-6 p-6 max-w-[640px] mx-auto w-full">
            {/* ATS Score */}
            <div className="flex items-center gap-4">
              <span
                className={`text-5xl font-bold font-mono ${
                  ats.score >= 70
                    ? "text-success"
                    : ats.score >= 40
                      ? "text-warning"
                      : "text-danger"
                }`}
              >
                {ats.score}%
              </span>
              <div>
                <p className="text-sm text-text-primary font-medium">
                  ATS Coverage
                </p>
                <p className="text-xs text-text-secondary">
                  {ats.covered.length}/{ats.keywords.length} keywords matched
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-surface-highest">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  ats.score >= 70
                    ? "bg-success"
                    : ats.score >= 40
                      ? "bg-warning"
                      : "bg-danger"
                }`}
                style={{ width: `${ats.score}%` }}
              />
            </div>

            {/* Covered keywords */}
            {ats.covered.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle size={14} className="text-success" />
                  <span className="text-[11px] font-mono font-medium text-success uppercase tracking-wider">
                    Covered ({ats.covered.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ats.covered.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded bg-success-dim/15 text-xs font-mono text-success"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {ats.missing.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={14} className="text-danger" />
                  <span className="text-[11px] font-mono font-medium text-danger uppercase tracking-wider">
                    Missing ({ats.missing.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ats.missing.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded bg-danger-dim/15 text-xs font-mono text-danger"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TeX Preview */}
            {step === "done" && outputTex && (
              <div>
                <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider block mb-2">
                  Generated LaTeX
                </span>
                <pre className="bg-base rounded-lg p-4 text-[11px] font-mono text-text-secondary overflow-x-auto max-h-[500px] overflow-y-auto leading-5 shadow-inner">
                  {outputTex}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3">
            <Sparkles size={32} className="opacity-30" />
            <p className="text-sm">
              Paste a JD and hit Synthesize to see ATS coverage
            </p>
            <p className="text-xs text-text-muted">
              Forge picks 3 experiences + 1 project from your bank
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  reason,
  selected,
  alternatives,
  onSwap,
}: {
  entry: SeedEntry;
  reason?: string;
  selected: boolean;
  alternatives: SeedEntry[];
  onSwap: (e: SeedEntry) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showSwap, setShowSwap] = useState(false);

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        selected
          ? "bg-accent-subtle border-accent/30"
          : "bg-surface-mid/50 border-border-muted/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-left"
        >
          {expanded ? (
            <ChevronDown size={14} className="text-text-secondary shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-text-secondary shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-text-primary">
              {entry.title}
            </p>
            <p className="text-[11px] text-text-secondary">
              {entry.subtitle} · {entry.dateRange}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          {selected && (
            <CheckCircle size={14} className="text-accent" />
          )}
          <button
            onClick={() => setShowSwap(!showSwap)}
            className="text-[10px] font-mono text-text-muted hover:text-text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-surface-high"
          >
            swap
          </button>
        </div>
      </div>

      {reason && (
        <p className="text-[10px] font-mono text-text-muted mt-1 ml-5">
          {reason}
        </p>
      )}

      {expanded && (
        <ul className="mt-2 ml-5 space-y-1">
          {entry.bullets.map((bullet, i) => (
            <li key={i} className="text-xs text-text-secondary flex gap-1.5">
              <Circle size={4} className="shrink-0 mt-1.5 text-text-muted" />
              <span className="font-mono text-[11px] leading-relaxed">
                {bullet
                  .replace(/\\textbf\{/g, "")
                  .replace(/\}/g, "")
                  .replace(/\\\\/g, "")
                  .replace(/\\&/g, "&")
                  .replace(/\\%/g, "%")
                  .replace(/\\\$/g, "$")}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showSwap && alternatives.length > 0 && (
        <div className="mt-2 ml-5 border-t border-border-muted/30 pt-2 space-y-1">
          <span className="text-[10px] font-mono text-text-muted">
            Swap with:
          </span>
          {alternatives
            .filter((a) => a.title !== entry.title)
            .map((alt) => (
              <button
                key={alt.title}
                onClick={() => {
                  onSwap(alt);
                  setShowSwap(false);
                }}
                className="w-full text-left px-2 py-1 rounded text-xs text-text-secondary hover:bg-surface-high hover:text-text-primary transition-colors"
              >
                {alt.title} — {alt.subtitle}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
