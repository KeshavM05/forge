"use client";

import { useState, useCallback, useEffect } from "react";
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
  ArrowRightLeft,
  FileText,
} from "lucide-react";
import { type SeedEntry } from "@/lib/seed-bank";
import {
  extractJDKeywords,
  selectBestEntries,
  computeATS,
  type ATSResult,
} from "@/lib/jd-analyzer";
import { assembleResume } from "@/lib/latex-assembler";
import { useIDEDispatch } from "@/components/ide/ide-context";
import { useBank } from "@/lib/bank-store";

type Step = "input" | "review" | "done";

export default function AgentWorkspace() {
  const bank = useBank();
  const dispatch = useIDEDispatch();
  const [jd, setJd] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [selectedExps, setSelectedExps] = useState<SeedEntry[]>([]);
  const [selectedProject, setSelectedProject] = useState<SeedEntry | null>(null);
  const [reasoning, setReasoning] = useState<Record<string, string>>({});
  const [ats, setAts] = useState<ATSResult | null>(null);
  const [outputTex, setOutputTex] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "tex">("preview");

  const experiences = bank.experiences;
  const projects = bank.projects;

  const synthesize = useCallback(() => {
    if (!jd.trim()) return;
    setAnalyzing(true);
    dispatch({ type: "SET_AGENT_STATUS", status: "running" });

    requestAnimationFrame(() => {
      setTimeout(() => {
        const keywords = extractJDKeywords(jd);
        const selection = selectBestEntries(jd, experiences, projects);
        const coverage = computeATS(keywords, selection.experiences, selection.project);

        setSelectedExps(selection.experiences);
        setSelectedProject(selection.project);
        setReasoning(selection.reasoning);
        setAts(coverage);

        const tex = assembleResume(
          selection.experiences,
          selection.project,
          bank.educationTex,
          bank.skillsTex
        );
        setOutputTex(tex);
        setStep("review");
        setAnalyzing(false);

        dispatch({ type: "SET_AGENT_STATUS", status: "done" });
        dispatch({ type: "SET_COVERAGE", score: coverage.score });
      }, 300);
    });
  }, [jd, experiences, projects, bank.educationTex, bank.skillsTex, dispatch]);

  function recompute() {
    if (!selectedProject || !ats) return;
    const keywords = extractJDKeywords(jd);
    const coverage = computeATS(keywords, selectedExps, selectedProject);
    setAts(coverage);
    dispatch({ type: "SET_COVERAGE", score: coverage.score });
    setOutputTex(
      assembleResume(selectedExps, selectedProject, bank.educationTex, bank.skillsTex)
    );
  }

  function swapExperience(index: number, newEntry: SeedEntry) {
    const next = [...selectedExps];
    next[index] = newEntry;
    setSelectedExps(next);
  }

  function swapProject(newEntry: SeedEntry) {
    setSelectedProject(newEntry);
  }

  useEffect(() => {
    if (step === "review") recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExps, selectedProject]);

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
    setOutputTex("");
    dispatch({ type: "SET_AGENT_STATUS", status: "idle" });
    dispatch({ type: "SET_COVERAGE", score: null });
  }

  const hasBank = experiences.length > 0;

  return (
    <div className="flex w-full h-full">
      {/* LEFT — Prompt + Selections */}
      <div className="w-[420px] shrink-0 flex flex-col border-r border-border-muted bg-surface overflow-y-auto">
        <div className="p-4 flex flex-col gap-4 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              Agent
            </h2>
            {step !== "input" && (
              <button
                onClick={reset}
                className="text-[11px] text-text-muted hover:text-text-primary transition-colors"
              >
                New session
              </button>
            )}
          </div>

          {/* JD Prompt */}
          <div className="rounded-lg bg-surface-mid p-3 focus-within:ring-1 focus-within:ring-accent/40 transition-all">
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows={step === "input" ? 10 : 3}
              placeholder="Paste the full job description..."
              className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none resize-none leading-relaxed"
              disabled={step === "done"}
            />
            {step === "input" && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-muted/50">
                {!hasBank ? (
                  <span className="text-[10px] text-danger">
                    Add entries to your bank first
                  </span>
                ) : (
                  <span className="text-[10px] text-text-muted">
                    Picks 3 exp + 1 project
                  </span>
                )}
                <button
                  onClick={synthesize}
                  disabled={analyzing || !jd.trim() || !hasBank}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={11} />
                  )}
                  {analyzing ? "Analyzing" : "Synthesize"}
                </button>
              </div>
            )}
          </div>

          {/* Selections */}
          {step !== "input" && selectedProject && (
            <>
              <Section label="Experiences" count={3}>
                {selectedExps.map((exp, i) => (
                  <EntryCard
                    key={exp.title + i}
                    entry={exp}
                    reason={reasoning[exp.title]}
                    alternatives={experiences.filter((e) => e.title !== exp.title)}
                    onSwap={(e) => swapExperience(i, e)}
                  />
                ))}
              </Section>

              <Section label="Project" count={1}>
                <EntryCard
                  entry={selectedProject}
                  reason={reasoning[selectedProject.title]}
                  alternatives={projects.filter(
                    (p) =>
                      p.title !== selectedProject.title &&
                      !selectedExps.some((e) => e.title === p.title)
                  )}
                  onSwap={swapProject}
                />
              </Section>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-2">
                <button
                  onClick={downloadTex}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-bold transition-all"
                >
                  <Download size={13} />
                  Download .tex
                </button>
                <button
                  onClick={reset}
                  className="px-3 py-2 rounded-md bg-surface-mid text-text-secondary hover:text-danger hover:bg-danger/10 text-xs transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT — Document Preview + ATS */}
      <div className="flex-1 flex flex-col overflow-hidden bg-base">
        {step !== "input" && ats ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-muted shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center p-0.5 rounded-md bg-surface-mid">
                  <button
                    onClick={() => setViewMode("preview")}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                      viewMode === "preview"
                        ? "bg-surface-high text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setViewMode("tex")}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                      viewMode === "tex"
                        ? "bg-surface-high text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    LaTeX
                  </button>
                </div>
              </div>
              <ATSBadge ats={ats} />
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Document */}
              <div className="flex-1 overflow-auto p-6 flex justify-center">
                {viewMode === "preview" ? (
                  <ResumePreview
                    experiences={selectedExps}
                    project={selectedProject!}
                  />
                ) : (
                  <pre className="w-full max-w-[700px] text-[11px] font-mono leading-[1.6] text-text-secondary whitespace-pre-wrap">
                    {outputTex}
                  </pre>
                )}
              </div>

              {/* ATS Panel */}
              <div className="w-[260px] shrink-0 border-l border-border-muted overflow-y-auto p-4 bg-surface/50">
                <ATSPanel ats={ats} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-4 px-6">
            <div className="w-12 h-12 rounded-xl bg-surface-mid flex items-center justify-center">
              <FileText size={20} className="text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-1">
                Paste a job description to begin
              </p>
              <p className="text-xs text-text-muted">
                Forge will select the best content from your bank and assemble a
                tailored resume
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">
          {label}
        </span>
        <span className="text-[10px] font-mono text-text-muted">{count}</span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function EntryCard({
  entry,
  reason,
  alternatives,
  onSwap,
}: {
  entry: SeedEntry;
  reason?: string;
  alternatives: SeedEntry[];
  onSwap: (e: SeedEntry) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showSwap, setShowSwap] = useState(false);

  return (
    <div className="rounded-lg bg-surface-mid/60 border border-border-muted/60 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <button onClick={() => setExpanded(!expanded)} className="flex-1 flex items-center gap-2 text-left min-w-0">
          {expanded ? <ChevronDown size={12} className="text-text-muted shrink-0" /> : <ChevronRight size={12} className="text-text-muted shrink-0" />}
          <div className="min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">{entry.title}</p>
            <p className="text-[10px] text-text-muted truncate">{entry.subtitle}</p>
          </div>
        </button>
        <CheckCircle size={13} className="text-accent shrink-0" />
        {alternatives.length > 0 && (
          <button
            onClick={() => setShowSwap(!showSwap)}
            className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-all"
            title="Swap"
          >
            <ArrowRightLeft size={11} />
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-3 pb-2 space-y-1">
          {entry.bullets.map((b, i) => (
            <p key={i} className="text-[10px] text-text-secondary leading-relaxed pl-4 border-l border-border-muted">
              {stripLatex(b)}
            </p>
          ))}
        </div>
      )}

      {showSwap && (
        <div className="border-t border-border-muted/50 bg-surface-low/50 p-2 space-y-0.5">
          {alternatives.map((alt) => (
            <button
              key={alt.title}
              onClick={() => { onSwap(alt); setShowSwap(false); }}
              className="w-full text-left px-2 py-1.5 rounded text-[11px] text-text-secondary hover:bg-surface-mid hover:text-text-primary transition-colors truncate"
            >
              {alt.title} — <span className="text-text-muted">{alt.subtitle}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ATSBadge({ ats }: { ats: ATSResult }) {
  const color =
    ats.score >= 70 ? "text-success" : ats.score >= 40 ? "text-warning" : "text-danger";
  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-bold font-mono ${color}`}>{ats.score}%</span>
      <span className="text-[10px] text-text-muted">
        {ats.covered.length}/{ats.keywords.length}
      </span>
    </div>
  );
}

function ATSPanel({ ats }: { ats: ATSResult }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">Coverage</span>
          <span className={`text-2xl font-bold font-mono ${ats.score >= 70 ? "text-success" : ats.score >= 40 ? "text-warning" : "text-danger"}`}>
            {ats.score}%
          </span>
        </div>
        <div className="w-full h-1 rounded-full bg-surface-highest overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${ats.score >= 70 ? "bg-success" : ats.score >= 40 ? "bg-warning" : "bg-danger"}`}
            style={{ width: `${ats.score}%` }}
          />
        </div>
      </div>

      {ats.covered.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle size={10} className="text-success" />
            <span className="text-[10px] font-mono text-success font-medium">{ats.covered.length} covered</span>
          </div>
          <div className="flex flex-wrap gap-1">{ats.covered.map((kw) => (
            <span key={kw} className="px-1.5 py-px rounded bg-success/8 text-[10px] font-mono text-success/80">{kw}</span>
          ))}</div>
        </div>
      )}

      {ats.missing.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle size={10} className="text-danger" />
            <span className="text-[10px] font-mono text-danger font-medium">{ats.missing.length} missing</span>
          </div>
          <div className="flex flex-wrap gap-1">{ats.missing.map((kw) => (
            <span key={kw} className="px-1.5 py-px rounded bg-danger/8 text-[10px] font-mono text-danger/70">{kw}</span>
          ))}</div>
        </div>
      )}
    </div>
  );
}

function ResumePreview({
  experiences,
  project,
}: {
  experiences: SeedEntry[];
  project: SeedEntry;
}) {
  return (
    <div className="w-full max-w-[600px] bg-white text-[#111] rounded shadow-2xl shadow-black/40 p-8 sm:p-10 font-serif text-[10.5px] leading-[1.5] min-h-[780px]">
      {/* Header */}
      <div className="text-center pb-3 mb-3 border-b border-[#ccc]">
        <h1 className="text-[17px] font-bold tracking-tight uppercase font-sans text-[#0a0a0a]">
          Keshav Mehndiratta
        </h1>
        <p className="text-[8.5px] text-[#555] font-sans mt-1 tracking-wide">
          +1(343)333-7585 · keshav.m@queensu.ca · linkedin.com/in/keshav-mehndiratta · keshavhq.com · github.com/KeshavM05
        </p>
      </div>

      {/* Education */}
      <ResumeSection title="Education">
        <div className="flex justify-between font-sans text-[9.5px]">
          <span className="font-bold text-[#0a0a0a]">Queen&apos;s University</span>
          <span className="text-[#666]">Kingston, Ontario</span>
        </div>
        <p className="text-[8.5px] text-[#666] italic font-sans">
          Bachelor of Applied Science, Mechatronics &amp; Robotics Engineering
        </p>
      </ResumeSection>

      {/* Experience */}
      <ResumeSection title="Experience">
        {experiences.map((exp) => (
          <div key={exp.title} className="mb-2.5 last:mb-0">
            <div className="flex justify-between font-sans text-[9.5px]">
              <span className="font-bold text-[#0a0a0a]">{exp.title}</span>
              <span className="text-[#666]">{exp.dateRange?.replace(/--/g, "–")}</span>
            </div>
            <div className="flex justify-between font-sans text-[8.5px] text-[#666] italic mb-0.5">
              <span>{exp.subtitle}</span>
              <span>{exp.location}</span>
            </div>
            <ul className="list-disc pl-3 space-y-0.5 text-[#222]">
              {exp.bullets.map((b, i) => (
                <li key={i} className="text-[9px]">{stripLatex(b)}</li>
              ))}
            </ul>
          </div>
        ))}
      </ResumeSection>

      {/* Projects */}
      <ResumeSection title="Projects">
        <div className="mb-1">
          <div className="flex justify-between font-sans text-[9.5px]">
            <span>
              <span className="font-bold text-[#0a0a0a]">{project.title}</span>
              {project.subtitle && (
                <span className="text-[#666] italic"> | {project.subtitle}</span>
              )}
            </span>
            <span className="text-[#666]">{project.dateRange?.replace(/--/g, "–")}</span>
          </div>
          <ul className="list-disc pl-3 space-y-0.5 text-[#222]">
            {project.bullets.map((b, i) => (
              <li key={i} className="text-[9px]">{stripLatex(b)}</li>
            ))}
          </ul>
        </div>
      </ResumeSection>

      {/* Skills */}
      <ResumeSection title="Technical Skills">
        <div className="space-y-0.5 text-[8.5px] font-sans text-[#222]">
          <p><strong className="text-[#0a0a0a]">Languages:</strong> Python, C++, C, TypeScript, JavaScript, SQL, Bash, MATLAB, Assembly, Java</p>
          <p><strong className="text-[#0a0a0a]">AI &amp; Robotics:</strong> ROS2, Nav2, YOLOv8, OpenCV, TensorFlow, NumPy, PX4, Gazebo, PID, SLAM</p>
          <p><strong className="text-[#0a0a0a]">Full-Stack:</strong> React Native, React.js, Angular, Express.js, Node.js, TanStack Query, Drizzle ORM</p>
          <p><strong className="text-[#0a0a0a]">Cloud &amp; DevOps:</strong> AWS, Docker, Git, CI/CD, Linux, n8n</p>
          <p><strong className="text-[#0a0a0a]">Hardware:</strong> NVIDIA Jetson, Raspberry Pi, Arduino, LiDAR, SolidWorks, I2C/SPI/UART</p>
        </div>
      </ResumeSection>
    </div>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="border-b border-[#0a0a0a] pb-0.5 mb-1.5">
        <span className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a] font-sans">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function stripLatex(text: string): string {
  return text
    .replace(/\\textbf\{([^}]*)\}/g, "$1")
    .replace(/\\textit\{([^}]*)\}/g, "$1")
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")
    .replace(/\\emph\{([^}]*)\}/g, "$1")
    .replace(/\\\$/g, "$")
    .replace(/\\&/g, "&")
    .replace(/\\%/g, "%")
    .replace(/\\_/g, "_")
    .replace(/\\#/g, "#")
    .replace(/\\\\/g, "")
    .replace(/\{|\}/g, "");
}
