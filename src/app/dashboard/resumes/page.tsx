"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Star,
  Trash2,
  Plus,
  Save,
  Pencil,
  X,
  Crown,
  Copy,
  Check,
  Eye,
  Code,
  Loader2,
} from "lucide-react";
import { useBank, type ResumeFile } from "@/lib/bank-store";

export default function ResumesPage() {
  const bank = useBank();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"pdf" | "source">("pdf");

  useEffect(() => {
    if (!selectedId && bank.resumes.length > 0) {
      const master = bank.resumes.find((r) => r.isMaster);
      setSelectedId(master?.id ?? bank.resumes[0].id);
    }
  }, [selectedId, bank.resumes]);

  const selected = bank.resumes.find((r) => r.id === selectedId);

  useEffect(() => {
    if (selected) compilePdf(selected.tex);
  }, [selected?.id]);

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
      {/* Left: file list */}
      <div className="w-[220px] shrink-0 flex flex-col border-r border-border-muted bg-surface">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted">
          <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">Resumes</span>
          <button onClick={() => { setShowUpload(true); setSelectedId(null); }} className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-all">
            <Plus size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-0.5">
          {bank.resumes.map((r) => (
            <div key={r.id} role="button" tabIndex={0}
              onClick={() => { setSelectedId(r.id); setShowUpload(false); setViewMode("pdf"); }}
              onKeyDown={(e) => { if (e.key === "Enter") setSelectedId(r.id); }}
              className={`group w-full px-3 py-2 flex items-center gap-2 cursor-pointer transition-all ${selectedId === r.id ? "bg-accent/8" : "hover:bg-surface-mid/50"}`}>
              {r.isMaster ? <Crown size={11} className="text-warning shrink-0" /> : <FileText size={11} className="text-text-muted shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className={`text-[11px] truncate ${selectedId === r.id ? "text-accent font-medium" : "text-text-primary"}`}>{r.name}</p>
                {r.isMaster && <span className="text-[8px] font-mono text-warning">MASTER</span>}
              </div>
              <div className="hidden group-hover:flex items-center" onClick={(e) => e.stopPropagation()}>
                {!r.isMaster && <button onClick={() => bank.setMasterResume(r.id)} className="p-0.5 text-text-muted hover:text-warning"><Star size={9} /></button>}
                <button onClick={() => { bank.deleteResume(r.id); if (selectedId === r.id) setSelectedId(null); }} className="p-0.5 text-text-muted hover:text-danger"><Trash2 size={9} /></button>
              </div>
            </div>
          ))}
          {bank.resumes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center gap-2">
              <Upload size={16} className="text-text-muted opacity-30" />
              <button onClick={() => setShowUpload(true)} className="px-3 py-1 rounded bg-accent text-white text-[10px] font-medium">Upload .tex</button>
            </div>
          )}
        </div>
      </div>

      {/* Right: viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showUpload ? (
          <UploadPanel onUpload={(name, tex) => { const id = bank.addResume(name, tex); setShowUpload(false); setSelectedId(id); }} onCancel={() => setShowUpload(false)} />
        ) : selected ? (
          <>
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-border-muted shrink-0">
              <div className="flex items-center gap-2">
                {selected.isMaster && <Crown size={11} className="text-warning" />}
                <span className="text-xs font-medium text-text-primary">{selected.name}</span>
                {selected.isMaster && <span className="px-1 py-px rounded bg-warning/10 text-[8px] font-mono font-semibold text-warning">MASTER</span>}
              </div>
              <div className="flex items-center gap-1.5">
                {!selected.isMaster && (
                  <button onClick={() => bank.setMasterResume(selected.id)} className="px-2 py-0.5 rounded text-[10px] text-text-muted hover:text-warning hover:bg-warning/10 transition-all flex items-center gap-1">
                    <Star size={9} /> Set Master
                  </button>
                )}
                <CopyButton text={selected.tex} />
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
            <div className="flex-1 overflow-auto">
              {viewMode === "pdf" ? (
                <div className="h-full flex items-center justify-center p-4 bg-surface-highest/20">
                  {pdfLoading ? (
                    <div className="flex flex-col items-center gap-2 text-text-secondary">
                      <Loader2 size={20} className="animate-spin text-accent" />
                      <p className="text-xs">Compiling...</p>
                    </div>
                  ) : pdfUrl ? (
                    <iframe src={pdfUrl} className="w-full h-full bg-white rounded shadow-2xl shadow-black/30" title="Resume PDF" />
                  ) : (
                    <p className="text-xs text-text-muted">Could not compile PDF</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-base">
                  <div className="max-w-3xl mx-auto">
                    {selected.tex.split("\n").map((line, i) => (
                      <div key={i} className="flex text-[11px] font-mono leading-[1.6] hover:bg-surface-mid/20 transition-colors">
                        <span className="w-8 text-right pr-3 text-text-muted/30 select-none shrink-0 text-[10px]">{i + 1}</span>
                        <span className={
                          line.trimStart().startsWith("%") ? "text-success/50 italic"
                            : line.match(/\\(documentclass|usepackage|begin|end|section|newcommand|renewcommand|input)\b/) ? "text-accent"
                              : "text-text-secondary"
                        }>{line || " "}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-xs">
            {bank.resumes.length > 0 ? "Select a resume" : "Upload a .tex file to get started"}
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
