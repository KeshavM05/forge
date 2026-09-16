"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Star,
  Trash2,
  Plus,
  Save,
  Crown,
  Copy,
  Check,
  Eye,
  Code,
  Loader2,
  X,
  Briefcase,
  Target,
} from "lucide-react";
import { useBank, type ResumeFile, type TailoredProject } from "@/lib/bank-store";

type Selection =
  | { type: "master"; id: string }
  | { type: "tailored"; id: string }
  | null;

export default function ResumesPage() {
  const bank = useBank();
  const [selection, setSelection] = useState<Selection>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"pdf" | "source">("pdf");

  // Auto-select master on load
  useEffect(() => {
    if (!selection && bank.resumes.length > 0) {
      const master = bank.resumes.find((r) => r.isMaster);
      if (master) setSelection({ type: "master", id: master.id });
    }
  }, [selection, bank.resumes]);

  const selectedResume = selection?.type === "master"
    ? bank.resumes.find((r) => r.id === selection.id)
    : null;
  const selectedTailored = selection?.type === "tailored"
    ? bank.tailored.find((t) => t.id === selection.id)
    : null;

  const activeTex = selectedResume?.tex || selectedTailored?.tex || null;

  useEffect(() => {
    if (activeTex) compilePdf(activeTex);
    else setPdfUrl(null);
  }, [selection?.type, selection?.type === "master" ? selection.id : "", selection?.type === "tailored" ? selection.id : ""]);

  async function compilePdf(tex: string) {
    setPdfLoading(true);
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tex }),
      });
      if (!res.ok) throw new Error("Compile failed");
      const blob = await res.blob();
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(blob));
    } catch {
      setPdfUrl(null);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="flex w-full h-full">
      {/* Left sidebar */}
      <div className="w-[260px] shrink-0 flex flex-col border-r border-border-muted bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted">
          <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">Resumes</span>
          <button onClick={() => { setShowUpload(true); setSelection(null); }}
            className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-all">
            <Plus size={13} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Master / Uploaded resumes */}
          <div className="py-1">
            <div className="px-3 py-1 text-[9px] font-mono font-semibold text-text-muted uppercase tracking-widest flex items-center gap-1">
              <Crown size={9} /> Source Files
            </div>
            {bank.resumes.map((r) => (
              <div key={r.id} role="button" tabIndex={0}
                onClick={() => { setSelection({ type: "master", id: r.id }); setShowUpload(false); setViewMode("pdf"); }}
                className={`group w-full px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-all ${
                  selection?.type === "master" && selection.id === r.id ? "bg-accent/8" : "hover:bg-surface-mid/40"
                }`}>
                {r.isMaster ? <Crown size={10} className="text-warning shrink-0" /> : <FileText size={10} className="text-text-muted shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className={`text-[11px] truncate ${selection?.type === "master" && selection.id === r.id ? "text-accent font-medium" : "text-text-primary"}`}>{r.name}</p>
                  {r.isMaster && <span className="text-[8px] font-mono text-warning">MASTER</span>}
                </div>
                <div className="hidden group-hover:flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                  {!r.isMaster && <button onClick={() => bank.setMasterResume(r.id)} className="p-0.5 text-text-muted hover:text-warning"><Star size={8} /></button>}
                  <button onClick={() => { bank.deleteResume(r.id); if (selection?.type === "master" && selection.id === r.id) setSelection(null); }} className="p-0.5 text-text-muted hover:text-danger"><Trash2 size={8} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Tailored projects */}
          {bank.tailored.length > 0 && (
            <div className="py-1 border-t border-border-muted/50">
              <div className="px-3 py-1 text-[9px] font-mono font-semibold text-text-muted uppercase tracking-widest flex items-center gap-1">
                <Target size={9} /> Tailored ({bank.tailored.length})
              </div>
              {bank.tailored.map((t) => (
                <div key={t.id} role="button" tabIndex={0}
                  onClick={() => { setSelection({ type: "tailored", id: t.id }); setShowUpload(false); setViewMode("pdf"); }}
                  className={`group w-full px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-all ${
                    selection?.type === "tailored" && selection.id === t.id ? "bg-accent/8" : "hover:bg-surface-mid/40"
                  }`}>
                  <Briefcase size={10} className="text-text-muted shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] truncate ${selection?.type === "tailored" && selection.id === t.id ? "text-accent font-medium" : "text-text-primary"}`}>
                      {t.role}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-text-muted truncate">{t.company}</span>
                      <span className={`text-[8px] font-mono font-semibold ${t.atsScore >= 70 ? "text-success" : t.atsScore >= 40 ? "text-warning" : "text-danger"}`}>
                        {t.atsScore}%
                      </span>
                    </div>
                  </div>
                  <div className="hidden group-hover:flex" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { bank.deleteTailored(t.id); if (selection?.type === "tailored" && selection.id === t.id) setSelection(null); }}
                      className="p-0.5 text-text-muted hover:text-danger"><Trash2 size={8} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showUpload ? (
          <UploadPanel onUpload={(name, tex) => { const id = bank.addResume(name, tex); setShowUpload(false); setSelection({ type: "master", id }); }} onCancel={() => setShowUpload(false)} />
        ) : selectedResume || selectedTailored ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-border-muted shrink-0">
              <div className="flex items-center gap-2">
                {selectedResume?.isMaster && <Crown size={11} className="text-warning" />}
                {selectedTailored && <Target size={11} className="text-accent" />}
                <span className="text-xs font-medium text-text-primary">
                  {selectedResume?.name || selectedTailored?.name}
                </span>
                {selectedResume?.isMaster && <span className="px-1 py-px rounded bg-warning/10 text-[8px] font-mono font-semibold text-warning">MASTER</span>}
                {selectedTailored && <span className={`px-1 py-px rounded text-[8px] font-mono font-semibold ${selectedTailored.atsScore >= 70 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>ATS {selectedTailored.atsScore}%</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <CopyButton text={activeTex || ""} />
                <div className="flex p-0.5 rounded-md bg-surface-mid">
                  <button onClick={() => setViewMode("pdf")} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${viewMode === "pdf" ? "bg-surface-high text-text-primary shadow-sm" : "text-text-muted"}`}>
                    <Eye size={9} /> PDF
                  </button>
                  <button onClick={() => setViewMode("source")} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${viewMode === "source" ? "bg-surface-high text-text-primary shadow-sm" : "text-text-muted"}`}>
                    <Code size={9} /> Source
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* PDF / Source */}
              <div className="flex-1 overflow-auto">
                {viewMode === "pdf" ? (
                  <div className="h-full flex items-center justify-center p-4 bg-surface-highest/20">
                    {pdfLoading ? (
                      <div className="flex flex-col items-center gap-2 text-text-secondary">
                        <Loader2 size={20} className="animate-spin text-accent" />
                        <p className="text-xs">Compiling...</p>
                      </div>
                    ) : pdfUrl ? (
                      <iframe src={pdfUrl} className="w-full h-full bg-white rounded shadow-2xl shadow-black/30" title="PDF" />
                    ) : (
                      <p className="text-xs text-text-muted">Could not compile</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-base">
                    <pre className="max-w-3xl mx-auto text-[11px] font-mono leading-[1.6] text-text-secondary whitespace-pre-wrap">
                      {activeTex}
                    </pre>
                  </div>
                )}
              </div>

              {/* Side info for tailored projects */}
              {selectedTailored && (
                <div className="w-[240px] shrink-0 border-l border-border-muted overflow-y-auto p-3 bg-surface/50 space-y-3">
                  <div>
                    <span className="text-[9px] font-mono font-semibold text-text-muted uppercase tracking-widest">ATS Score</span>
                    <p className={`text-2xl font-bold font-mono ${selectedTailored.atsScore >= 70 ? "text-success" : "text-warning"}`}>{selectedTailored.atsScore}%</p>
                    <div className="w-full h-1 rounded-full bg-surface-highest mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${selectedTailored.atsScore >= 70 ? "bg-success" : "bg-warning"}`} style={{ width: `${selectedTailored.atsScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-semibold text-text-muted uppercase tracking-widest">Selected</span>
                    {selectedTailored.selectedExperiences.map((e) => (
                      <p key={e} className="text-[10px] text-text-secondary">{e}</p>
                    ))}
                    <p className="text-[10px] text-warning">{selectedTailored.selectedProject} (project)</p>
                  </div>
                  {selectedTailored.missingKeywords.length > 0 && (
                    <div>
                      <span className="text-[9px] font-mono font-semibold text-danger uppercase tracking-widest">{selectedTailored.missingKeywords.length} gaps</span>
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {selectedTailored.missingKeywords.map((kw) => (
                          <span key={kw} className="px-1 py-px rounded bg-danger/8 text-[8px] font-mono text-danger/70">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-[9px] text-text-muted">
                    {new Date(selectedTailored.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-xs">
            Select a resume or upload a new one
          </div>
        )}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="px-2 py-0.5 rounded text-[10px] text-text-muted hover:text-text-secondary hover:bg-surface-mid transition-all flex items-center gap-1">
      {copied ? <Check size={9} className="text-success" /> : <Copy size={9} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function UploadPanel({ onUpload, onCancel }: { onUpload: (name: string, tex: string) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [tex, setTex] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setName((prev) => prev || file.name.replace(/\.tex$/, ""));
    const reader = new FileReader();
    reader.onload = (e) => setTex(e.target?.result as string);
    reader.readAsText(file);
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (name.trim() && tex.trim()) onUpload(name.trim(), tex); }} className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="max-w-xl w-full mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">Upload Resume</span>
          <button type="button" onClick={onCancel} className="text-text-muted hover:text-text-primary"><X size={14} /></button>
        </div>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Master, GDMS Tailored...)"
          className="rounded-lg bg-surface-mid border border-border-muted px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50" />
        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => fileRef.current?.click()}
          className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-all ${dragOver ? "border-accent bg-accent/5" : "border-border-muted hover:border-border"}`}>
          <Upload size={18} className="mx-auto mb-2 text-text-muted opacity-40" />
          <p className="text-xs text-text-secondary">Drop .tex file or click to browse</p>
          <input ref={fileRef} type="file" accept=".tex,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
        <textarea value={tex} onChange={(e) => setTex(e.target.value)} rows={14} placeholder="\documentclass{article}..."
          className="rounded-lg bg-surface-mid border border-border-muted px-3 py-2 text-[11px] font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none leading-relaxed" />
        <button type="submit" disabled={!name.trim() || !tex.trim()}
          className="self-start px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-bold transition-all disabled:opacity-30 flex items-center gap-1.5">
          <Save size={12} /> Save
        </button>
      </div>
    </form>
  );
}
