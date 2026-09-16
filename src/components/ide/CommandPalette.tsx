"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, FileStack, Database, Download } from "lucide-react";
import { useIDE, useIDEDispatch } from "./ide-context";

const commands = [
  { id: "agent", label: "Agent Workspace", icon: Sparkles, href: "/dashboard" },
  { id: "resumes", label: "Resumes", icon: FileStack, href: "/dashboard/resumes" },
  { id: "bank", label: "Content Bank", icon: Database, href: "/dashboard/bank" },
  { id: "export", label: "Export .tex", icon: Download, href: null },
];

export function CommandPalette() {
  const state = useIDE();
  const dispatch = useIDEDispatch();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (state.commandPaletteOpen) {
      setQuery("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [state.commandPaletteOpen]);

  if (!state.commandPaletteOpen) return null;

  function run(cmd: (typeof commands)[number]) {
    dispatch({ type: "TOGGLE_COMMAND_PALETTE" });
    if (cmd.href) router.push(cmd.href);
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[18vh]"
      onClick={() => dispatch({ type: "TOGGLE_COMMAND_PALETTE" })}
    >
      <div
        className="w-full max-w-sm bg-surface-mid border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-muted">
          <Search size={14} className="text-text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSel(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, filtered.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
              else if (e.key === "Enter" && filtered[sel]) run(filtered[sel]);
              else if (e.key === "Escape") dispatch({ type: "TOGGLE_COMMAND_PALETTE" });
            }}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <div className="max-h-48 overflow-y-auto py-1">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => run(cmd)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                i === sel ? "bg-accent/10 text-accent" : "text-text-secondary hover:bg-surface-high"
              }`}
            >
              <cmd.icon size={14} strokeWidth={1.5} />
              {cmd.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-xs text-text-muted text-center">No results</p>
          )}
        </div>
      </div>
    </div>
  );
}
