"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Briefcase,
  FolderOpen,
  GraduationCap,
  Wrench,
  Award,
} from "lucide-react";
import { useIDEDispatch } from "@/components/ide/ide-context";

type BankItem = {
  id: string;
  kind: string;
  roleOrCompany: string | null;
  text: string;
  tags: string;
  atsKeywords: string;
  active: boolean;
};

const KINDS = [
  "experience",
  "project",
  "education",
  "skill",
  "certification",
] as const;

const KIND_ICONS: Record<string, typeof Briefcase> = {
  experience: Briefcase,
  project: FolderOpen,
  education: GraduationCap,
  skill: Wrench,
  certification: Award,
};

export default function BankPage() {
  const [items, setItems] = useState<BankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedKinds, setExpandedKinds] = useState<Set<string>>(
    new Set(KINDS)
  );
  const dispatch = useIDEDispatch();

  useEffect(() => {
    fetch("/api/bank")
      .then((r) => r.json() as Promise<{ items?: BankItem[] }>)
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    dispatch({ type: "SET_COUNTS", selected: 0, bank: items.length });
  }, [items.length, dispatch]);

  async function handleDelete(id: string) {
    await fetch(`/api/bank/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  async function handleAdd(item: Omit<BankItem, "id" | "active">) {
    const res = await fetch("/api/bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const data = (await res.json()) as { item?: BankItem };
    if (data.item) {
      const newItem = data.item;
      setItems((prev) => [...prev, newItem]);
      setShowForm(false);
      setSelectedId(newItem.id);
    }
  }

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
      acc[kind] = items.filter((i) => i.kind === kind);
      return acc;
    },
    {} as Record<string, BankItem[]>
  );

  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full">
      {/* Left: Tree View */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col bg-surface-low border-r border-border-muted/30 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted/30">
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
            Content Bank
          </span>
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedId(null);
            }}
            className="w-6 h-6 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-high transition-colors"
            title="Add item"
          >
            <Plus size={14} />
          </button>
        </div>

        {loading ? (
          <div className="p-3 text-xs text-text-muted">Loading...</div>
        ) : (
          <div className="flex-1 py-1">
            {KINDS.map((kind) => {
              const kindItems = grouped[kind];
              if (kindItems.length === 0 && !expandedKinds.has(kind))
                return null;
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
                    <span className="capitalize font-medium">{kind}</span>
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
                          setShowForm(false);
                        }}
                        className={`w-full text-left pl-7 pr-2 py-1 text-xs truncate transition-colors ${
                          selectedId === item.id
                            ? "bg-accent-subtle text-accent"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-mid/50"
                        }`}
                      >
                        {item.roleOrCompany || item.text.slice(0, 50)}
                      </button>
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Detail / Add Form */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col p-6 overflow-y-auto">
        {showForm ? (
          <AddItemForm
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        ) : selectedItem ? (
          <ItemDetail item={selectedItem} onDelete={handleDelete} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <p className="text-sm mb-2">Select an item or add a new one</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1.5 rounded bg-accent text-base text-sm font-medium hover:bg-accent-bold transition-colors"
            >
              Add Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemDetail({
  item,
  onDelete,
}: {
  item: BankItem;
  onDelete: (id: string) => void;
}) {
  const tags: string[] = JSON.parse(item.tags || "[]");
  const Icon = KIND_ICONS[item.kind] || Briefcase;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-accent" />
          <span className="text-[11px] font-mono font-medium text-accent uppercase">
            {item.kind}
          </span>
          {item.roleOrCompany && (
            <>
              <span className="text-border-muted">·</span>
              <span className="text-sm text-text-secondary">
                {item.roleOrCompany}
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-danger hover:bg-danger-dim/20 transition-colors"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>

      <div className="bg-surface-mid rounded-lg p-4 font-mono text-sm leading-relaxed text-text-primary mb-4">
        {item.text}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-surface-high text-[11px] font-mono text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AddItemForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (item: Omit<BankItem, "id" | "active">) => void;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<string>("experience");
  const [roleOrCompany, setRoleOrCompany] = useState("");
  const [text, setText] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({
      kind,
      roleOrCompany: roleOrCompany || null,
      text: text.trim(),
      tags: JSON.stringify(
        tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      ),
      atsKeywords: "[]",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
          Add New Item
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-mono font-medium text-text-secondary mb-1">
            Type
          </label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/60"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-mono font-medium text-text-secondary mb-1">
            Role / Company
          </label>
          <input
            type="text"
            value={roleOrCompany}
            onChange={(e) => setRoleOrCompany(e.target.value)}
            placeholder="e.g. Software Engineer at Acme"
            className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/60"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-mono font-medium text-text-secondary mb-1">
          Content
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Your bullet point, project description, or skill..."
          className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/60 resize-none"
        />
      </div>

      <div>
        <label className="block text-[11px] font-mono font-medium text-text-secondary mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="python, distributed-systems, leadership"
          className="w-full rounded bg-surface-mid border border-border-muted px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/60"
        />
      </div>

      <button
        type="submit"
        className="self-start px-4 py-2 rounded bg-accent text-base text-sm font-medium hover:bg-accent-bold transition-colors"
      >
        Add to Bank
      </button>
    </form>
  );
}
