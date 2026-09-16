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
} from "lucide-react";
import { useBank, type ResumeFile } from "@/lib/bank-store";

export default function ResumesPage() {
  const bank = useBank();
  const [selectedId, setSelectedId] = useState<string | null>(
    bank.masterResume?.id ?? null
  );
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (bank.masterResume && !selectedId) {
      setSelectedId(bank.masterResume.id);
    }
  }, [bank.masterResume, selectedId]);

  const selected = bank.resumes.find((r) => r.id === selectedId);

  return (
    <div className="flex w-full h-full">
      {/* List */}
      <div className="w-[240px] shrink-0 flex flex-col border-r border-border-muted bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted">
          <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">
            Resumes
          </span>
          <button
            onClick={() => { setShowUpload(true); setSelectedId(null); }}
            className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-all"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {bank.resumes.length === 0 && !showUpload ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center gap-3">
              <Upload size={20} className="text-text-muted opacity-30" />
              <p className="text-[11px] text-text-muted">No resumes yet</p>
              <button
                onClick={() => setShowUpload(true)}
                className="px-3 py-1.5 rounded-md bg-accent text-white text-[11px] font-medium hover:bg-accent-bold transition-all"
              >
                Upload .tex
              </button>
            </div>
          ) : (
            <div className="py-0.5">
              {bank.resumes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelectedId(r.id); setShowUpload(false); }}
                  className={`group w-full text-left px-3 py-2 flex items-center gap-2 transition-all ${
                    selectedId === r.id
                      ? "bg-accent/8"
                      : "hover:bg-surface-mid/50"
                  }`}
                >
                  {r.isMaster ? (
                    <Crown size={12} className="text-warning shrink-0" />
                  ) : (
                    <FileText size={12} className="text-text-muted shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs truncate ${selectedId === r.id ? "text-accent font-medium" : "text-text-primary"}`}>
                      {r.name}
                    </p>
                    {r.isMaster && (
                      <span className="text-[9px] font-mono text-warning">Master</span>
                    )}
                  </div>
                  <div className="hidden group-hover:flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    {!r.isMaster && (
                      <button onClick={() => bank.setMasterResume(r.id)} className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-warning transition-colors">
                        <Star size={10} />
                      </button>
                    )}
                    <button onClick={() => { bank.deleteResume(r.id); if (selectedId === r.id) setSelectedId(null); }} className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-danger transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showUpload ? (
          <UploadPanel
            onUpload={(name, tex) => {
              const id = bank.addResume(name, tex);
              setShowUpload(false);
              setSelectedId(id);
            }}
            onCancel={() => setShowUpload(false)}
          />
        ) : selected ? (
          <Viewer
            resume={selected}
            onUpdate={(tex) => bank.updateResume(selected.id, { tex })}
            onSetMaster={() => bank.setMasterResume(selected.id)}
            onRename={(name) => bank.updateResume(selected.id, { name })}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3">
            <FileText size={24} className="opacity-20" />
            <p className="text-xs">
              {bank.resumes.length > 0 ? "Select a resume" : "Upload your first .tex file"}
            </p>
          </div>
        )}
      </div>
    </div>
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
    <form
      onSubmit={(e) => { e.preventDefault(); if (name.trim() && tex.trim()) onUpload(name.trim(), tex); }}
      className="flex-1 flex flex-col p-6 overflow-y-auto"
    >
      <div className="max-w-2xl w-full mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">Upload Resume</span>
          <button type="button" onClick={onCancel} className="text-text-muted hover:text-text-primary transition-colors"><X size={14} /></button>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name this resume (e.g. Master, GDMS Tailored...)"
          className="rounded-md bg-surface-mid border border-border-muted px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
        />

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => fileRef.current?.click()}
          className={`rounded-lg border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
            dragOver ? "border-accent bg-accent/5" : "border-border-muted hover:border-border hover:bg-surface-mid/30"
          }`}
        >
          <Upload size={20} className="mx-auto mb-2 text-text-muted opacity-40" />
          <p className="text-xs text-text-secondary">Drop a .tex file or click to browse</p>
          <input ref={fileRef} type="file" accept=".tex,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        <textarea
          value={tex}
          onChange={(e) => setTex(e.target.value)}
          rows={16}
          placeholder="\documentclass[letterpaper,11pt]{article}&#10;\usepackage{...}&#10;&#10;\begin{document}&#10;...&#10;\end{document}"
          className="rounded-md bg-surface-mid border border-border-muted px-3 py-2 text-[11px] font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none leading-relaxed"
        />

        <button
          type="submit"
          disabled={!name.trim() || !tex.trim()}
          className="self-start flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-bold transition-all disabled:opacity-30"
        >
          <Save size={12} />
          Save Resume
        </button>
      </div>
    </form>
  );
}

function Viewer({ resume, onUpdate, onSetMaster, onRename }: { resume: ResumeFile; onUpdate: (tex: string) => void; onSetMaster: () => void; onRename: (name: string) => void }) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [draft, setDraft] = useState(resume.tex);
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(resume.name);

  useEffect(() => {
    setDraft(resume.tex);
    setNameVal(resume.name);
    setMode("view");
  }, [resume.id, resume.tex, resume.name]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border-muted shrink-0 bg-surface-low/50">
        <div className="flex items-center gap-2">
          {resume.isMaster && <Crown size={12} className="text-warning" />}
          {editingName ? (
            <form onSubmit={(e) => { e.preventDefault(); onRename(nameVal); setEditingName(false); }} className="flex items-center gap-1">
              <input autoFocus value={nameVal} onChange={(e) => setNameVal(e.target.value)} className="bg-surface-mid border border-border-muted rounded px-1.5 py-0.5 text-xs text-text-primary focus:outline-none w-40" onKeyDown={(e) => { if (e.key === "Escape") setEditingName(false); }} />
              <button type="submit"><Check size={11} className="text-success" /></button>
            </form>
          ) : (
            <button onClick={() => setEditingName(true)} className="text-xs font-medium text-text-primary hover:text-accent transition-colors flex items-center gap-1">
              {resume.name} <Pencil size={9} className="text-text-muted" />
            </button>
          )}
          {resume.isMaster && <span className="px-1.5 py-px rounded bg-warning/10 text-[9px] font-mono font-semibold text-warning">MASTER</span>}
        </div>
        <div className="flex items-center gap-1.5">
          {!resume.isMaster && (
            <button onClick={onSetMaster} className="px-2 py-0.5 rounded text-[10px] font-medium text-text-muted hover:text-warning hover:bg-warning/10 transition-all flex items-center gap-1">
              <Star size={10} /> Set Master
            </button>
          )}
          <button onClick={() => { navigator.clipboard.writeText(resume.tex); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="px-2 py-0.5 rounded text-[10px] font-medium text-text-muted hover:text-text-secondary hover:bg-surface-mid transition-all flex items-center gap-1">
            {copied ? <Check size={10} className="text-success" /> : <Copy size={10} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <div className="flex p-0.5 rounded-md bg-surface-mid">
            <button onClick={() => setMode("view")} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${mode === "view" ? "bg-surface-high text-text-primary shadow-sm" : "text-text-muted"}`}>View</button>
            <button onClick={() => { setDraft(resume.tex); setMode("edit"); }} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${mode === "edit" ? "bg-surface-high text-text-primary shadow-sm" : "text-text-muted"}`}>Edit</button>
          </div>
          {mode === "edit" && (
            <button onClick={() => { onUpdate(draft); setMode("view"); }} className="px-2.5 py-0.5 rounded-md bg-accent text-white text-[10px] font-medium hover:bg-accent-bold transition-all flex items-center gap-1">
              <Save size={10} /> Save
            </button>
          )}
        </div>
      </div>

      {mode === "view" ? (
        <div className="flex-1 overflow-auto p-4 bg-base">
          <div className="max-w-3xl mx-auto">
            {resume.tex.split("\n").map((line, i) => (
              <div key={i} className="flex text-[11px] font-mono leading-[1.7] hover:bg-surface-mid/30 transition-colors">
                <span className="w-10 text-right pr-3 text-text-muted/30 select-none shrink-0 text-[10px]">{i + 1}</span>
                <span className={
                  line.trimStart().startsWith("%")
                    ? "text-success/50 italic"
                    : line.match(/\\(documentclass|usepackage|begin|end|section|newcommand|renewcommand|input)\b/)
                      ? "text-accent"
                      : line.includes("\\textbf{")
                        ? "text-text-primary"
                        : "text-text-secondary"
                }>{line || " "}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 bg-base px-4 py-4 text-[11px] font-mono text-text-primary focus:outline-none resize-none leading-[1.7]"
          spellCheck={false}
        />
      )}
    </div>
  );
}
