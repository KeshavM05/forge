"use client";

import { useState, useRef } from "react";
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
  const [editingName, setEditingName] = useState<string | null>(null);

  const selected = bank.resumes.find((r) => r.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full">
      {/* Left: Resume List */}
      <div className="lg:col-span-3 flex flex-col bg-surface-low border-r border-border-muted/30">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted/30">
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
            Resumes
          </span>
          <button
            onClick={() => {
              setShowUpload(true);
              setSelectedId(null);
            }}
            title="Upload resume"
            className="w-6 h-6 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-high transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {bank.resumes.length === 0 && !showUpload ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <FileText size={24} className="text-text-muted mb-2 opacity-40" />
              <p className="text-xs text-text-muted mb-3">
                No resumes yet. Upload your master resume to get started.
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="px-3 py-1.5 rounded bg-accent text-base text-xs font-medium hover:bg-accent-bold transition-colors flex items-center gap-1.5"
              >
                <Upload size={12} />
                Upload .tex
              </button>
            </div>
          ) : (
            bank.resumes.map((resume) => (
              <ResumeListItem
                key={resume.id}
                resume={resume}
                isSelected={selectedId === resume.id}
                isEditingName={editingName === resume.id}
                onSelect={() => {
                  setSelectedId(resume.id);
                  setShowUpload(false);
                }}
                onSetMaster={() => bank.setMasterResume(resume.id)}
                onDelete={() => {
                  bank.deleteResume(resume.id);
                  if (selectedId === resume.id) setSelectedId(null);
                }}
                onStartRename={() => setEditingName(resume.id)}
                onFinishRename={(name) => {
                  bank.updateResume(resume.id, { name });
                  setEditingName(null);
                }}
                onCancelRename={() => setEditingName(null)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Viewer / Upload */}
      <div className="lg:col-span-9 flex flex-col overflow-hidden">
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
          <ResumeViewer
            resume={selected}
            onUpdate={(tex) => bank.updateResume(selected.id, { tex })}
            onSetMaster={() => bank.setMasterResume(selected.id)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3">
            <FileText size={32} className="opacity-30" />
            <p className="text-sm">
              {bank.resumes.length > 0
                ? "Select a resume to view"
                : "Upload your first resume to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumeListItem({
  resume,
  isSelected,
  isEditingName,
  onSelect,
  onSetMaster,
  onDelete,
  onStartRename,
  onFinishRename,
  onCancelRename,
}: {
  resume: ResumeFile;
  isSelected: boolean;
  isEditingName: boolean;
  onSelect: () => void;
  onSetMaster: () => void;
  onDelete: () => void;
  onStartRename: () => void;
  onFinishRename: (name: string) => void;
  onCancelRename: () => void;
}) {
  const [draftName, setDraftName] = useState(resume.name);

  return (
    <div
      className={`group relative px-3 py-2 transition-colors cursor-pointer border-b border-border-muted/20 ${
        isSelected
          ? "bg-accent-subtle"
          : "hover:bg-surface-mid/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        {resume.isMaster ? (
          <Crown size={13} className="text-warning shrink-0" />
        ) : (
          <FileText size={13} className="text-text-muted shrink-0" />
        )}

        {isEditingName ? (
          <form
            className="flex-1 flex items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              onFinishRename(draftName);
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="flex-1 bg-surface-mid border border-border-muted rounded px-1.5 py-0.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/60"
              onKeyDown={(e) => {
                if (e.key === "Escape") onCancelRename();
              }}
            />
            <button type="submit" className="text-success">
              <Check size={12} />
            </button>
          </form>
        ) : (
          <div className="flex-1 min-w-0">
            <p
              className={`text-xs font-medium truncate ${
                isSelected ? "text-accent" : "text-text-primary"
              }`}
            >
              {resume.name}
            </p>
            <p className="text-[10px] text-text-muted">
              {new Date(resume.createdAt).toLocaleDateString()}
              {resume.isMaster && (
                <span className="ml-1.5 text-warning font-medium">
                  MASTER
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Hover actions */}
      {!isEditingName && (
        <div
          className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {!resume.isMaster && (
            <button
              onClick={onSetMaster}
              title="Set as master"
              className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-warning hover:bg-surface-high transition-colors"
            >
              <Star size={11} />
            </button>
          )}
          <button
            onClick={onStartRename}
            title="Rename"
            className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-high transition-colors"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-danger hover:bg-surface-high transition-colors"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

function UploadPanel({
  onUpload,
  onCancel,
}: {
  onUpload: (name: string, tex: string) => void;
  onCancel: () => void;
}) {
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

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !tex.trim()) return;
    onUpload(name.trim(), tex);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 flex flex-col p-6 overflow-y-auto"
    >
      <div className="max-w-3xl w-full mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
            Upload Resume
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-mono font-medium text-text-secondary mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Master Resume, GDMS Tailored, Meta SWE..."
            className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/60"
          />
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-accent bg-accent-subtle"
              : "border-border-muted/40 hover:border-border/60 hover:bg-surface-mid/30"
          }`}
        >
          <Upload
            size={24}
            className="mx-auto mb-2 text-text-muted opacity-50"
          />
          <p className="text-sm text-text-secondary mb-1">
            Drop a .tex file here or click to browse
          </p>
          <p className="text-xs text-text-muted">
            Or paste LaTeX directly below
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".tex,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono font-medium text-text-secondary mb-1">
            LaTeX Content
          </label>
          <textarea
            value={tex}
            onChange={(e) => setTex(e.target.value)}
            rows={20}
            placeholder={"\\documentclass[letterpaper,11pt]{article}\n\\usepackage{...}\n\n\\begin{document}\n...\n\\end{document}"}
            className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-[11px] font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/60 resize-none leading-5"
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim() || !tex.trim()}
          className="self-start px-4 py-2 rounded bg-accent text-base text-sm font-medium hover:bg-accent-bold transition-colors disabled:opacity-40 flex items-center gap-1.5"
        >
          <Save size={14} />
          Save Resume
        </button>
      </div>
    </form>
  );
}

function ResumeViewer({
  resume,
  onUpdate,
  onSetMaster,
}: {
  resume: ResumeFile;
  onUpdate: (tex: string) => void;
  onSetMaster: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [draft, setDraft] = useState(resume.tex);
  const [copied, setCopied] = useState(false);

  function handleSave() {
    onUpdate(draft);
    setMode("view");
  }

  function handleCopy() {
    navigator.clipboard.writeText(resume.tex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-muted/30 bg-surface-low/50 shrink-0">
        <div className="flex items-center gap-2">
          {resume.isMaster ? (
            <Crown size={14} className="text-warning" />
          ) : (
            <FileText size={14} className="text-text-muted" />
          )}
          <span className="text-sm font-medium text-text-primary">
            {resume.name}
          </span>
          {resume.isMaster && (
            <span className="px-1.5 py-0.5 rounded bg-warning/15 text-[10px] font-mono font-medium text-warning">
              MASTER
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {!resume.isMaster && (
            <button
              onClick={onSetMaster}
              className="px-2 py-1 rounded text-[11px] font-medium text-text-secondary hover:text-warning hover:bg-surface-high transition-colors flex items-center gap-1"
            >
              <Star size={11} />
              Set as Master
            </button>
          )}
          <button
            onClick={handleCopy}
            className="px-2 py-1 rounded text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-high transition-colors flex items-center gap-1"
          >
            {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <div className="flex items-center p-0.5 rounded bg-surface-mid">
            <button
              onClick={() => setMode("view")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                mode === "view"
                  ? "bg-surface-high text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              View
            </button>
            <button
              onClick={() => {
                setDraft(resume.tex);
                setMode("edit");
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                mode === "edit"
                  ? "bg-surface-high text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Edit
            </button>
          </div>
          {mode === "edit" && (
            <button
              onClick={handleSave}
              className="px-2.5 py-1 rounded bg-accent text-base text-[11px] font-medium hover:bg-accent-bold transition-colors flex items-center gap-1"
            >
              <Save size={11} />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {mode === "view" ? (
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-[11px] font-mono leading-[1.6] text-text-secondary whitespace-pre-wrap">
            {highlightLatex(resume.tex)}
          </pre>
        </div>
      ) : (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 bg-base border-0 px-4 py-4 text-[11px] font-mono text-text-primary focus:outline-none resize-none leading-[1.6]"
          spellCheck={false}
        />
      )}
    </div>
  );
}

function highlightLatex(tex: string): React.ReactNode {
  const lines = tex.split("\n");
  return lines.map((line, i) => {
    let content: React.ReactNode = line;

    if (line.trimStart().startsWith("%")) {
      content = (
        <span key={i} className="text-success/60 italic">
          {line}
        </span>
      );
    } else if (
      line.includes("\\documentclass") ||
      line.includes("\\usepackage") ||
      line.includes("\\begin{") ||
      line.includes("\\end{") ||
      line.includes("\\section") ||
      line.includes("\\newcommand") ||
      line.includes("\\renewcommand") ||
      line.includes("\\input{")
    ) {
      const parts = line.split(/(\\[a-zA-Z]+)/g);
      content = parts.map((part, j) =>
        part.startsWith("\\") ? (
          <span key={j} className="text-accent">
            {part}
          </span>
        ) : (
          part
        )
      );
    } else if (line.includes("\\textbf{")) {
      const parts = line.split(/(\\textbf\{[^}]*\})/g);
      content = parts.map((part, j) =>
        part.startsWith("\\textbf{") ? (
          <span key={j} className="text-text-primary font-semibold">
            {part}
          </span>
        ) : (
          part
        )
      );
    }

    return (
      <span key={i} className="block">
        <span className="inline-block w-8 text-right mr-3 text-text-muted/40 select-none text-[10px]">
          {i + 1}
        </span>
        {content}
        {"\n"}
      </span>
    );
  });
}
