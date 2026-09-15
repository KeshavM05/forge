"use client";

import { useState, useEffect } from "react";

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

export default function BankPage() {
  const [items, setItems] = useState<BankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/bank")
      .then((r) => r.json() as Promise<{ items?: BankItem[] }>)
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/bank/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
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
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Content Bank</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Item"}
        </button>
      </div>

      {showForm && (
        <AddItemForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {loading ? (
        <p className="text-foreground/40">Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-foreground/20 p-12 text-center">
          <p className="text-foreground/50 mb-2">No items yet</p>
          <p className="text-sm text-foreground/30">
            Add your experience bullets, projects, skills, and more to build
            your content bank.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <BankItemCard
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BankItemCard({
  item,
  onDelete,
}: {
  item: BankItem;
  onDelete: () => void;
}) {
  const tags: string[] = JSON.parse(item.tags || "[]");
  return (
    <div className="rounded-xl border border-foreground/10 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-md bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              {item.kind}
            </span>
            {item.roleOrCompany && (
              <span className="text-sm text-foreground/50">
                {item.roleOrCompany}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed">{item.text}</p>
          {tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-foreground/5 px-1.5 py-0.5 text-xs text-foreground/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="text-xs text-red-500 hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      </div>
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
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-foreground/10 p-6 mb-6 flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Role / Company
          </label>
          <input
            type="text"
            value={roleOrCompany}
            onChange={(e) => setRoleOrCompany(e.target.value)}
            placeholder="e.g. Software Engineer at Acme"
            className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Your bullet point, project description, or skill..."
          className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. python, machine-learning, leadership"
          className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-foreground/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Add to Bank
        </button>
      </div>
    </form>
  );
}
