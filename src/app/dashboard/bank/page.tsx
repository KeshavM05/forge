"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Briefcase,
  FolderOpen,
  GraduationCap,
  Wrench,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Circle,
} from "lucide-react";
import { useBank, type BankEntry } from "@/lib/bank-store";
import { type SeedEntry } from "@/lib/seed-bank";

const KIND_META = {
  experience: { icon: Briefcase, label: "Experiences", color: "text-accent" },
  project: { icon: FolderOpen, label: "Projects", color: "text-warning" },
} as const;

export default function BankPage() {
  const bank = useBank();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedKinds, setExpandedKinds] = useState(new Set(["experience", "project"]));
  const [showAdd, setShowAdd] = useState(false);
  const [editingSection, setEditingSection] = useState<"education" | "skills" | null>(null);

  const selected = bank.entries.find((e) => e.id === selectedId);

  return (
    <div className="flex w-full h-full">
      {/* Tree */}
      <div className="w-[240px] shrink-0 flex flex-col border-r border-border-muted bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted">
          <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">Bank</span>
          <div className="flex items-center gap-0.5">
            <button onClick={() => { setShowAdd(true); setSelectedId(null); setEditingSection(null); }} className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-all"><Plus size={13} /></button>
            <button onClick={bank.resetToDefaults} title="Reset" className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all"><RotateCcw size={11} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-0.5">
          {(["experience", "project"] as const).map((kind) => {
            const items = bank.entries.filter((e) => e.kind === kind);
            const meta = KIND_META[kind];
            const Icon = meta.icon;
            const open = expandedKinds.has(kind);
            return (
              <div key={kind}>
                <button
                  onClick={() => setExpandedKinds((prev) => { const n = new Set(prev); n.has(kind) ? n.delete(kind) : n.add(kind); return n; })}
                  className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-mid/40 transition-colors"
                >
                  {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                  <Icon size={12} className="text-text-muted" />
                  <span className="font-medium">{meta.label}</span>
                  <span className="text-[10px] text-text-muted ml-auto">{items.length}</span>
                </button>
                {open && items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedId(item.id); setShowAdd(false); setEditingSection(null); }}
                    className={`w-full text-left pl-7 pr-2 py-1.5 text-[11px] transition-colors ${selectedId === item.id ? "bg-accent/8 text-accent" : "text-text-secondary hover:text-text-primary hover:bg-surface-mid/40"}`}
                  >
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-[10px] text-text-muted truncate">{item.subtitle}</p>
                  </button>
                ))}
              </div>
            );
          })}

          <div className="mt-1 border-t border-border-muted/50 pt-1">
            {([
              { key: "education" as const, icon: GraduationCap, label: "Education" },
              { key: "skills" as const, icon: Wrench, label: "Skills" },
            ]).map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => { setEditingSection(key); setSelectedId(null); setShowAdd(false); }}
                className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs transition-colors ${editingSection === key ? "bg-accent/8 text-accent" : "text-text-secondary hover:text-text-primary hover:bg-surface-mid/40"}`}
              >
                <Icon size={12} className="text-text-muted" />
                <span className="font-medium">{label}</span>
                <span className="text-[10px] text-text-muted ml-auto">const</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {showAdd ? (
          <AddForm onSubmit={(e) => { bank.addEntry(e); setShowAdd(false); }} onCancel={() => setShowAdd(false)} />
        ) : editingSection ? (
          <TexEditor
            label={editingSection === "education" ? "Education" : "Technical Skills"}
            value={editingSection === "education" ? bank.educationTex : bank.skillsTex}
            onSave={editingSection === "education" ? bank.updateEducation : bank.updateSkills}
          />
        ) : selected ? (
          <EntryEditor
            key={selected.id}
            entry={selected}
            onUpdate={(p) => bank.updateEntry(selected.id, p)}
            onDelete={() => { bank.deleteEntry(selected.id); setSelectedId(null); }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-text-muted gap-2">
            <p className="text-xs">{bank.entries.length} entries in your bank</p>
            <p className="text-[10px]">Select one to edit or add a new entry</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EntryEditor({ entry, onUpdate, onDelete }: { entry: BankEntry; onUpdate: (p: Partial<SeedEntry>) => void; onDelete: () => void }) {
  const [title, setTitle] = useState(entry.title);
  const [subtitle, setSubtitle] = useState(entry.subtitle || "");
  const [dateRange, setDateRange] = useState(entry.dateRange || "");
  const [location, setLocation] = useState(entry.location || "");
  const [bullets, setBullets] = useState([...entry.bullets]);
  const [tags, setTags] = useState(entry.tags.join(", "));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setTitle(entry.title); setSubtitle(entry.subtitle || ""); setDateRange(entry.dateRange || "");
    setLocation(entry.location || ""); setBullets([...entry.bullets]); setTags(entry.tags.join(", "));
    setDirty(false);
  }, [entry.id, entry.title, entry.subtitle, entry.dateRange, entry.location, entry.bullets, entry.tags]);

  function save() {
    onUpdate({ title, subtitle: subtitle || undefined, dateRange: dateRange || undefined, location: location || undefined, bullets, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) });
    setDirty(false);
  }

  function set<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setDirty(true); };
  }

  const meta = KIND_META[entry.kind as keyof typeof KIND_META];

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {meta && <meta.icon size={14} className={meta.color} />}
          <span className={`text-[10px] font-mono font-semibold uppercase tracking-widest ${meta?.color ?? "text-text-muted"}`}>{entry.kind}</span>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-[10px] text-warning font-mono">unsaved</span>}
          <button onClick={save} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-white text-[11px] font-medium hover:bg-accent-bold transition-all"><Save size={11} /> Save</button>
          <button onClick={onDelete} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-danger hover:bg-danger/10 transition-all"><Trash2 size={11} /></button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Title" value={title} onChange={set(setTitle)} />
        <Input label="Role / Tech" value={subtitle} onChange={set(setSubtitle)} />
        <Input label="Date Range" value={dateRange} onChange={set(setDateRange)} />
        <Input label="Location" value={location} onChange={set(setLocation)} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">Bullets ({bullets.length})</span>
          <button onClick={() => { setBullets([...bullets, ""]); setDirty(true); }} className="text-[10px] text-accent hover:text-accent-bold transition-colors flex items-center gap-0.5"><Plus size={10} /> Add</button>
        </div>
        <div className="space-y-1.5">
          {bullets.map((b, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Circle size={4} className="shrink-0 mt-2.5 text-text-muted" />
              <textarea value={b} onChange={(e) => { const n = [...bullets]; n[i] = e.target.value; setBullets(n); setDirty(true); }} rows={2}
                className="flex-1 rounded-md bg-surface-mid border border-border-muted px-2.5 py-1.5 text-[11px] font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none leading-relaxed" />
              <button onClick={() => { setBullets(bullets.filter((_, j) => j !== i)); setDirty(true); }} className="text-text-muted hover:text-danger transition-colors mt-1.5"><Trash2 size={11} /></button>
            </div>
          ))}
        </div>
      </div>

      <Input label="Tags (comma-separated)" value={tags} onChange={set(setTags)} mono />
    </div>
  );
}

function Input({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] font-mono font-medium text-text-muted mb-1 uppercase tracking-wider">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-md bg-surface-mid border border-border-muted px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50 ${mono ? "font-mono" : ""}`} />
    </div>
  );
}

function AddForm({ onSubmit, onCancel }: { onSubmit: (e: SeedEntry) => void; onCancel: () => void }) {
  const [kind, setKind] = useState<"experience" | "project">("experience");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [location, setLocation] = useState("");
  const [bulletsRaw, setBulletsRaw] = useState("");
  const [tags, setTags] = useState("");

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; onSubmit({ kind, title, subtitle: subtitle || undefined, dateRange: dateRange || undefined, location: location || undefined, bullets: bulletsRaw.split("\n").map((b) => b.trim()).filter(Boolean), tags: tags.split(",").map((t) => t.trim()).filter(Boolean) }); }} className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">New Entry</span>
        <button type="button" onClick={onCancel} className="text-[11px] text-text-muted hover:text-text-primary transition-colors">Cancel</button>
      </div>
      <select value={kind} onChange={(e) => setKind(e.target.value as "experience" | "project")} className="rounded-md bg-surface-mid border border-border-muted px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50 w-full">
        <option value="experience">Experience</option>
        <option value="project">Project</option>
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Title" value={title} onChange={setTitle} />
        <Input label="Role / Tech" value={subtitle} onChange={setSubtitle} />
        <Input label="Date Range" value={dateRange} onChange={setDateRange} />
        <Input label="Location" value={location} onChange={setLocation} />
      </div>
      <div>
        <label className="block text-[10px] font-mono font-medium text-text-muted mb-1 uppercase tracking-wider">Bullets (one per line)</label>
        <textarea value={bulletsRaw} onChange={(e) => setBulletsRaw(e.target.value)} rows={6} placeholder="One bullet per line. LaTeX commands OK." className="w-full rounded-md bg-surface-mid border border-border-muted px-2.5 py-1.5 text-[11px] font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none leading-relaxed" />
      </div>
      <Input label="Tags (comma-separated)" value={tags} onChange={setTags} mono />
      <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-bold transition-all"><Plus size={12} /> Add to Bank</button>
    </form>
  );
}

function TexEditor({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setDraft(value); setSaved(false); }, [value]);

  return (
    <div className="max-w-3xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">{label} (LaTeX)</span>
        <button onClick={() => { onSave(draft); setSaved(true); setTimeout(() => setSaved(false), 1500); }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-white text-[11px] font-medium hover:bg-accent-bold transition-all">
          {saved ? <><Check size={11} /> Saved</> : <><Save size={11} /> Save</>}
        </button>
      </div>
      <textarea value={draft} onChange={(e) => { setDraft(e.target.value); setSaved(false); }} rows={14}
        className="w-full rounded-md bg-surface-mid border border-border-muted px-3 py-2 text-[11px] font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none leading-relaxed" />
    </div>
  );
}

function Check(props: { size: number }) {
  return <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
}
