"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Circle,
  Briefcase,
  FolderOpen,
  GraduationCap,
  Wrench,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  FileText,
} from "lucide-react";
import { useBank, type BankEntry } from "@/lib/bank-store";
import { type SeedEntry } from "@/lib/seed-bank";

const KIND_ICONS: Record<string, typeof Briefcase> = {
  experience: Briefcase,
  project: FolderOpen,
  education: GraduationCap,
  skill: Wrench,
};

const KINDS = ["experience", "project"] as const;

export default function BankPage() {
  const bank = useBank();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedKinds, setExpandedKinds] = useState<Set<string>>(
    new Set(KINDS)
  );
  const [showAdd, setShowAdd] = useState(false);
  const [showMasterTex, setShowMasterTex] = useState(false);
  const [editingSection, setEditingSection] = useState<
    "education" | "skills" | null
  >(null);

  function toggleKind(kind: string) {
    setExpandedKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  const grouped = KINDS.reduce(
    (acc, kind) => {
      acc[kind] = bank.entries.filter((e) => e.kind === kind);
      return acc;
    },
    {} as Record<string, BankEntry[]>
  );

  const selectedEntry = bank.entries.find((e) => e.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full">
      {/* Left: Tree View */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col bg-surface-low border-r border-border-muted/30 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted/30">
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
            Live Resume Bank
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setShowMasterTex(!showMasterTex);
                setShowAdd(false);
                setSelectedId(null);
                setEditingSection(null);
              }}
              title="View master .tex"
              className="w-6 h-6 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-high transition-colors"
            >
              <FileText size={13} />
            </button>
            <button
              onClick={() => {
                setShowAdd(true);
                setSelectedId(null);
                setShowMasterTex(false);
                setEditingSection(null);
              }}
              title="Add entry"
              className="w-6 h-6 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-high transition-colors"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={bank.resetToDefaults}
              title="Reset bank to defaults"
              className="w-6 h-6 rounded flex items-center justify-center text-text-secondary hover:text-danger hover:bg-surface-high transition-colors"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        <div className="flex-1 py-1">
          {KINDS.map((kind) => {
            const kindItems = grouped[kind];
            const Icon = KIND_ICONS[kind] || Briefcase;
            const expanded = expandedKinds.has(kind);

            return (
              <div key={kind}>
                <button
                  onClick={() => toggleKind(kind)}
                  className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-mid/50 transition-colors"
                >
                  {expanded ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                  <Icon size={13} className="text-text-muted" />
                  <span className="capitalize font-medium">
                    {kind === "experience" ? "Experiences" : "Projects"}
                  </span>
                  <span className="text-text-muted ml-auto text-[10px]">
                    {kindItems.length}
                  </span>
                </button>
                {expanded &&
                  kindItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedId(item.id);
                        setShowAdd(false);
                        setShowMasterTex(false);
                        setEditingSection(null);
                      }}
                      className={`w-full text-left pl-7 pr-2 py-1.5 text-xs transition-colors ${
                        selectedId === item.id
                          ? "bg-accent-subtle text-accent"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-mid/50"
                      }`}
                    >
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-[10px] text-text-muted truncate">
                        {item.subtitle}
                      </p>
                    </button>
                  ))}
              </div>
            );
          })}

          {/* Fixed sections */}
          <button
            onClick={() => {
              setEditingSection("education");
              setSelectedId(null);
              setShowAdd(false);
              setShowMasterTex(false);
            }}
            className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs transition-colors ${
              editingSection === "education"
                ? "bg-accent-subtle text-accent"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-mid/50"
            }`}
          >
            <GraduationCap size={13} className="text-text-muted" />
            <span className="font-medium">Education</span>
            <span className="text-text-muted ml-auto text-[10px]">
              editable
            </span>
          </button>
          <button
            onClick={() => {
              setEditingSection("skills");
              setSelectedId(null);
              setShowAdd(false);
              setShowMasterTex(false);
            }}
            className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs transition-colors ${
              editingSection === "skills"
                ? "bg-accent-subtle text-accent"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-mid/50"
            }`}
          >
            <Wrench size={13} className="text-text-muted" />
            <span className="font-medium">Technical Skills</span>
            <span className="text-text-muted ml-auto text-[10px]">
              editable
            </span>
          </button>
        </div>
      </div>

      {/* Right: Detail / Editor */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col p-6 overflow-y-auto">
        {showMasterTex ? (
          <MasterTexEditor
            value={bank.masterTex}
            onSave={bank.updateMasterTex}
          />
        ) : showAdd ? (
          <AddEntryForm
            onSubmit={(entry) => {
              bank.addEntry(entry);
              setShowAdd(false);
            }}
            onCancel={() => setShowAdd(false)}
          />
        ) : editingSection === "education" ? (
          <TexSectionEditor
            label="Education"
            value={bank.educationTex}
            onSave={bank.updateEducation}
          />
        ) : editingSection === "skills" ? (
          <TexSectionEditor
            label="Technical Skills"
            value={bank.skillsTex}
            onSave={bank.updateSkills}
          />
        ) : selectedEntry ? (
          <EntryEditor
            entry={selectedEntry}
            onUpdate={(patch) => bank.updateEntry(selectedEntry.id, patch)}
            onDelete={() => {
              bank.deleteEntry(selectedEntry.id);
              setSelectedId(null);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <p className="text-sm">Select an entry to view or edit</p>
            <p className="text-xs mt-1">
              {bank.experiences.length} experiences · {bank.projects.length}{" "}
              projects
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EntryEditor({
  entry,
  onUpdate,
  onDelete,
}: {
  entry: BankEntry;
  onUpdate: (patch: Partial<SeedEntry>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(entry.title);
  const [subtitle, setSubtitle] = useState(entry.subtitle || "");
  const [dateRange, setDateRange] = useState(entry.dateRange || "");
  const [location, setLocation] = useState(entry.location || "");
  const [bullets, setBullets] = useState<string[]>([...entry.bullets]);
  const [tagsInput, setTagsInput] = useState(entry.tags.join(", "));
  const Icon = KIND_ICONS[entry.kind] || Briefcase;

  function save() {
    onUpdate({
      title,
      subtitle: subtitle || undefined,
      dateRange: dateRange || undefined,
      location: location || undefined,
      bullets,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  function updateBullet(index: number, value: string) {
    const next = [...bullets];
    next[index] = value;
    setBullets(next);
  }

  function addBullet() {
    setBullets([...bullets, ""]);
  }

  function removeBullet(index: number) {
    setBullets(bullets.filter((_, i) => i !== index));
  }

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-accent" />
          <span className="text-[11px] font-mono font-medium text-accent uppercase">
            {entry.kind}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={save}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-accent text-base text-xs font-medium hover:bg-accent-bold transition-colors"
          >
            <Save size={12} />
            Save
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-danger hover:bg-danger-dim/20 transition-colors"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" value={title} onChange={setTitle} />
        <Field
          label="Subtitle (role / tech stack)"
          value={subtitle}
          onChange={setSubtitle}
        />
        <Field label="Date Range" value={dateRange} onChange={setDateRange} />
        <Field label="Location" value={location} onChange={setLocation} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
            Bullets ({bullets.length})
          </span>
          <button
            onClick={addBullet}
            className="text-[10px] font-mono text-accent hover:text-accent-bold transition-colors flex items-center gap-1"
          >
            <Plus size={10} /> Add bullet
          </button>
        </div>
        <div className="space-y-2">
          {bullets.map((bullet, i) => (
            <div key={i} className="flex gap-2">
              <Circle
                size={4}
                className="shrink-0 mt-3 text-text-muted"
              />
              <textarea
                value={bullet}
                onChange={(e) => updateBullet(i, e.target.value)}
                rows={2}
                className="flex-1 rounded bg-surface-mid border border-border-muted px-3 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/60 resize-none"
              />
              <button
                onClick={() => removeBullet(i)}
                className="text-text-muted hover:text-danger transition-colors shrink-0 mt-2"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Field label="Tags (comma-separated)" value={tagsInput} onChange={setTagsInput} />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-mono font-medium text-text-secondary mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/60"
      />
    </div>
  );
}

function AddEntryForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (entry: SeedEntry) => void;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<"experience" | "project">("experience");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [location, setLocation] = useState("");
  const [bulletsRaw, setBulletsRaw] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      kind,
      title,
      subtitle: subtitle || undefined,
      dateRange: dateRange || undefined,
      location: location || undefined,
      bullets: bulletsRaw
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
          Add New Entry
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-mono font-medium text-text-secondary mb-1">
          Type
        </label>
        <select
          value={kind}
          onChange={(e) =>
            setKind(e.target.value as "experience" | "project")
          }
          className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/60"
        >
          <option value="experience">Experience</option>
          <option value="project">Project</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title (company / project name)" value={title} onChange={setTitle} />
        <Field label="Subtitle (role / tech stack)" value={subtitle} onChange={setSubtitle} />
        <Field label="Date Range" value={dateRange} onChange={setDateRange} />
        <Field label="Location" value={location} onChange={setLocation} />
      </div>

      <div>
        <label className="block text-[11px] font-mono font-medium text-text-secondary mb-1">
          Bullets (one per line, LaTeX OK)
        </label>
        <textarea
          value={bulletsRaw}
          onChange={(e) => setBulletsRaw(e.target.value)}
          rows={6}
          placeholder={"Reduced testing time from two hours to two minutes...\nArchitected a zero-touch pipeline..."}
          className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/60 resize-none"
        />
      </div>

      <Field label="Tags (comma-separated)" value={tagsInput} onChange={setTagsInput} />

      <button
        type="submit"
        className="self-start px-4 py-2 rounded bg-accent text-base text-sm font-medium hover:bg-accent-bold transition-colors"
      >
        Add to Bank
      </button>
    </form>
  );
}

function TexSectionEditor({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <div className="max-w-3xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
          {label} (LaTeX)
        </span>
        <button
          onClick={() => onSave(draft)}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-accent text-base text-xs font-medium hover:bg-accent-bold transition-colors"
        >
          <Save size={12} />
          Save
        </button>
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={12}
        className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-[11px] font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/60 resize-none leading-5"
      />
    </div>
  );
}

function MasterTexEditor({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <div className="max-w-3xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
          Master Resume (.tex)
        </span>
        <button
          onClick={() => onSave(draft)}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-accent text-base text-xs font-medium hover:bg-accent-bold transition-colors"
        >
          <Save size={12} />
          Save
        </button>
      </div>
      <p className="text-xs text-text-muted">
        Paste your full master resume LaTeX here for reference. This is the
        source of truth — the bank entries above are parsed from it.
      </p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={30}
        placeholder="Paste your full master resume .tex here..."
        className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-[11px] font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/60 resize-none leading-5"
      />
    </div>
  );
}
