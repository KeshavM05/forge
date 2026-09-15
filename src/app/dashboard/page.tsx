"use client";

import { useState } from "react";
import {
  Sparkles,
  CheckCircle,
  Send,
  ThumbsUp,
  Pencil,
  X,
} from "lucide-react";

type PlanStep = {
  label: string;
  time: string;
  status: "done" | "running" | "pending";
};

const MOCK_PLAN: PlanStep[] = [
  {
    label: "Parsed role requisition & matched 18 key vectors",
    time: "42ms",
    status: "done",
  },
  {
    label: "Retrieved 3 vault experiences (Storage Engine Core)",
    time: "118ms",
    status: "done",
  },
  {
    label: "XeLaTeX compiled cleanly via TeXLive engine",
    time: "80ms",
    status: "done",
  },
  {
    label: "Strict 1-page budget verified (52/54 typesetting lines)",
    time: "PASS",
    status: "done",
  },
];

export default function AgentWorkspace() {
  const [prompt, setPrompt] = useState(
    "Tailor resume for Staff Systems Engineer at CloudScale. Emphasize Raft consensus latency and 1.2M QPS throughput metrics."
  );
  const [plan] = useState<PlanStep[]>(MOCK_PLAN);
  const [viewMode, setViewMode] = useState<"pdf" | "tex">("pdf");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full bg-base text-text-primary">
      {/* LEFT PANE: Agent Composer */}
      <div className="lg:col-span-5 flex flex-col p-4 lg:p-6 bg-surface-low/40 overflow-y-auto">
        <div className="max-w-[540px] w-full mx-auto flex flex-col h-full justify-between gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-base font-semibold text-text-primary tracking-tight">
                  Agent Workspace
                </span>
                <span className="font-mono text-xs text-text-muted">
                  v4.2-sync
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-mid border border-border-muted/30 text-text-secondary">
                <Sparkles size={14} className="text-accent" />
                <span className="text-[11px] font-mono font-medium text-text-primary">
                  Claude 3.7 Sonnet
                </span>
              </div>
            </div>

            {/* Prompt Bar */}
            <div className="relative bg-surface-mid rounded-lg p-3 shadow-xl focus-within:ring-1 focus-within:ring-accent/60 transition-all">
              <div className="flex items-start gap-2.5">
                <Sparkles
                  size={18}
                  className="text-accent mt-0.5 shrink-0"
                />
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                  placeholder="Tailor resume for a role. Describe the position and what to emphasize..."
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none"
                />
              </div>
              <div className="flex items-center justify-between pt-2 mt-2">
                <div className="flex items-center gap-2 text-text-secondary text-[11px] font-mono">
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-high text-text-primary">
                    <kbd>⌘</kbd>
                    <kbd>K</kbd>
                  </span>
                  <span>Actions</span>
                </div>
                <button className="px-3 py-1 bg-accent text-base rounded text-sm font-medium flex items-center gap-1.5 hover:bg-accent-bold transition-colors shadow-sm">
                  <span>Synthesize</span>
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Execution Plan */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
                Autonomous Execution Plan
              </span>
              <span className="text-[11px] font-mono text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Plan Settled
              </span>
            </div>
            <div className="bg-surface-mid/60 rounded-lg p-3.5 space-y-2.5">
              {plan.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 text-text-primary">
                    <CheckCircle size={16} className="text-success shrink-0" />
                    <span>{step.label}</span>
                  </div>
                  <span
                    className={`font-mono text-[11px] shrink-0 ml-2 ${
                      step.time === "PASS"
                        ? "text-success font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    {step.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Diff Preview */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
                Semantic AST Rewrite
              </span>
              <span className="font-mono text-xs text-text-muted">
                L74: \resumeItem
              </span>
            </div>
            <div className="rounded-lg bg-base p-3 font-mono text-xs space-y-1.5 overflow-x-auto shadow-inner">
              <div className="text-danger/80 line-through flex items-start gap-2">
                <span className="text-text-muted select-none">-</span>
                <span>
                  Architected distributed telemetry ingest layer using Go and
                  Kafka.
                </span>
              </div>
              <div className="text-success flex items-start gap-2 bg-success-dim/10 -mx-1.5 px-1.5 py-0.5 rounded">
                <span className="text-success select-none font-bold">+</span>
                <span>
                  Engineered zero-copy telemetry bus handling{" "}
                  <span className="underline decoration-success font-semibold">
                    +1.2M QPS
                  </span>
                  ; implemented{" "}
                  <span className="underline decoration-success font-semibold">
                    Raft consensus
                  </span>{" "}
                  reducing replication tail latency by 41%.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <button className="flex-1 px-4 py-2 bg-accent text-base rounded text-sm font-medium hover:bg-accent-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]">
                <ThumbsUp size={15} />
                <span>Approve Changes</span>
              </button>
              <button className="px-3.5 py-2 bg-surface-mid hover:bg-surface-high text-text-primary rounded text-sm font-medium transition-colors flex items-center gap-1.5">
                <Pencil size={14} className="text-text-secondary" />
                <span>Tweak</span>
              </button>
            </div>
            <button
              className="px-3 py-2 bg-surface-low hover:bg-danger-dim/30 hover:text-danger text-text-secondary rounded text-sm font-medium transition-colors"
              title="Discard"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Document Canvas */}
      <div className="lg:col-span-7 flex flex-col bg-surface overflow-y-auto items-center p-4 lg:p-8">
        {/* Top Controls */}
        <div className="w-full max-w-[620px] flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface-low shadow-sm">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-[11px] font-mono font-medium text-text-primary">
              Strict 1-Page Guarantee
            </span>
            <span className="text-border-muted">·</span>
            <span className="font-mono text-xs text-text-secondary">
              52/54 lines
            </span>
          </div>
          <div className="flex items-center p-0.5 rounded bg-surface-low">
            <button
              onClick={() => setViewMode("pdf")}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                viewMode === "pdf"
                  ? "bg-surface-high text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Compiled PDF
            </button>
            <button
              onClick={() => setViewMode("tex")}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                viewMode === "tex"
                  ? "bg-surface-high text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              LaTeX Source
            </button>
          </div>
        </div>

        {/* Document */}
        {viewMode === "pdf" ? <PDFPreview /> : <TeXSource />}

        {/* Canvas HUD */}
        <div className="mt-4 flex items-center gap-4 text-text-secondary text-[11px] font-mono">
          <span>100%</span>
          <span>·</span>
          <span>TeX Engine: XeTeX 3.14</span>
          <span>·</span>
          <span>Last Built: 240ms ago</span>
        </div>
      </div>
    </div>
  );
}

function PDFPreview() {
  return (
    <div className="w-full max-w-[620px] bg-[#fcfdfd] text-[#11161d] rounded-sm p-8 sm:p-10 shadow-2xl font-serif min-h-[820px] relative text-[11px] leading-[1.45]">
      {/* Highlight indicator */}
      <div className="absolute -left-2 top-48 w-1 h-14 bg-success rounded-r shadow-[0_0_12px_rgba(103,223,112,0.5)]" />

      {/* Header */}
      <div className="text-center pb-4 mb-4 border-b border-[#d8dee4]">
        <h1 className="text-lg font-bold tracking-tight text-[#090d13] uppercase font-sans">
          Your Name
        </h1>
        <p className="text-[10px] text-[#4b5563] font-sans tracking-wide mt-0.5">
          Software Engineer
        </p>
        <div className="flex items-center justify-center gap-2 mt-1.5 text-[9px] text-[#57606a] font-sans font-medium">
          <span>email@example.com</span>
          <span>·</span>
          <span>github.com/you</span>
          <span>·</span>
          <span>City, ST</span>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-4">
        <div className="flex items-center justify-between border-b border-[#090d13] pb-0.5 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#090d13] font-sans">
            Experience
          </span>
        </div>
        <div className="mb-3">
          <div className="flex justify-between font-sans text-[10px]">
            <span className="font-bold text-[#090d13]">Company Name</span>
            <span className="text-[#57606a]">2021 — Present</span>
          </div>
          <div className="flex justify-between font-sans text-[9px] text-[#57606a] italic mb-1">
            <span>Senior Software Engineer</span>
            <span>City, ST</span>
          </div>
          <ul className="list-disc pl-3.5 space-y-1 text-[#24292f] text-[9.5px]">
            <li className="bg-[#dcfce7]/70 -mx-1 px-1 rounded transition-colors duration-500">
              Engineered zero-copy telemetry bus handling{" "}
              <span className="font-bold text-[#090d13]">+1.2M QPS</span>;
              implemented{" "}
              <span className="font-bold text-[#090d13]">
                Raft consensus
              </span>{" "}
              reducing replication tail latency by 41%.
            </li>
            <li>
              Built distributed data pipeline processing 50TB daily with 99.9%
              uptime SLA.
            </li>
            <li>
              Led migration of monolithic service to microservices architecture
              serving 10M+ users.
            </li>
          </ul>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="flex items-center justify-between border-b border-[#090d13] pb-0.5 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#090d13] font-sans">
            Technical Competencies
          </span>
        </div>
        <div className="space-y-1 text-[9px] font-sans text-[#24292f]">
          <div>
            <strong className="text-[#090d13]">Languages:</strong> Python,
            TypeScript, Go, Rust, C++
          </div>
          <div>
            <strong className="text-[#090d13]">Infrastructure:</strong> AWS,
            Kubernetes, Docker, Terraform, CI/CD
          </div>
          <div>
            <strong className="text-[#090d13]">Data:</strong> PostgreSQL, Redis,
            Kafka, Elasticsearch, Spark
          </div>
        </div>
      </div>

      {/* Education */}
      <div>
        <div className="flex items-center justify-between border-b border-[#090d13] pb-0.5 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#090d13] font-sans">
            Education
          </span>
        </div>
        <div className="flex justify-between font-sans text-[9.5px]">
          <span className="font-bold text-[#090d13]">University Name</span>
          <span className="text-[#57606a]">City, ST</span>
        </div>
        <div className="text-[9px] font-sans text-[#57606a] italic">
          B.S. in Computer Science — Magna Cum Laude
        </div>
      </div>
    </div>
  );
}

function TeXSource() {
  return (
    <div className="w-full max-w-[620px] bg-surface-mid rounded-sm p-4 font-mono text-xs text-text-secondary shadow-2xl overflow-x-auto min-h-[820px]">
      <pre className="text-[11px] leading-5">
        <span className="text-accent">\documentclass</span>
        [10pt,letterpaper]{"{article}"}
        {"\n"}
        <span className="text-accent">\usepackage</span>
        [margin=0.5in]{"{geometry}"}
        {"\n"}
        <span className="text-accent">\usepackage</span>
        {"{enumitem}"}
        {"\n"}
        <span className="text-accent">\usepackage</span>
        {"{titlesec}"}
        {"\n\n"}
        <span className="text-accent">\begin</span>
        {"{document}"}
        {"\n"}
        <span className="text-success">
          {"% Typesetting Budget: 52 of 54 max page lines"}
        </span>
        {"\n"}
        <span className="text-accent">\begin</span>
        {"{center}"}
        {"\n"}
        {"    {\\Huge \\textbf{Your Name}} \\\\\n"}
        {"    Software Engineer \\\\\n"}
        {"    \\small email@example.com $\\cdot$ github.com/you\n"}
        <span className="text-accent">\end</span>
        {"{center}"}
        {"\n\n"}
        <span className="text-accent">\section*</span>
        {"{EXPERIENCE}"}
        {"\n"}
        <span className="text-accent">\textbf</span>
        {"{Company Name} \\hfill 2021--Present \\\\\n"}
        {"\\textit{Senior Software Engineer} \\\\\n"}
        <span className="text-accent">\begin</span>
        {"{itemize}[leftmargin=1.5em,noitemsep]"}
        {"\n"}
        <span className="text-success">
          {
            "    \\item Engineered zero-copy telemetry bus handling +1.2M QPS...\n"
          }
        </span>
        {"    \\item Built distributed data pipeline processing 50TB daily...\n"}
        <span className="text-accent">\end</span>
        {"{itemize}"}
        {"\n\n"}
        <span className="text-accent">\end</span>
        {"{document}"}
      </pre>
    </div>
  );
}
