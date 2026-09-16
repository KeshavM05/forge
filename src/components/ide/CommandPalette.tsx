"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Bot, Code, FileText, ClipboardCheck, Download } from "lucide-react";
import { useIDE, useIDEDispatch } from "./ide-context";

const commands = [
  { id: "agent", label: "Go to Agent Workspace", icon: Bot, href: "/dashboard" },
  { id: "bank", label: "Go to Content Bank", icon: Code, href: "/dashboard/bank" },
  { id: "resumes", label: "Go to Resumes", icon: FileText, href: "/dashboard/resumes" },
  { id: "history", label: "Go to History", icon: ClipboardCheck, href: "/dashboard/history" },
  { id: "export", label: "Export .tex", icon: Download, href: null },
];

export function CommandPalette() {
  const state = useIDE();
  const dispatch = useIDEDispatch();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (state.commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [state.commandPaletteOpen]);

  if (!state.commandPaletteOpen) return null;

  function execute(cmd: (typeof commands)[number]) {
    dispatch({ type: "TOGGLE_COMMAND_PALETTE" });
    if (cmd.href) {
      dispatch({
        type: "OPEN_TAB",
        tab: {
          id: cmd.id,
          label: cmd.label.replace("Go to ", ""),
          href: cmd.href,
          closable: cmd.id !== "agent",
        },
      });
      router.push(cmd.href);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      execute(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      dispatch({ type: "TOGGLE_COMMAND_PALETTE" });
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-[20vh]"
      onClick={() => dispatch({ type: "TOGGLE_COMMAND_PALETTE" })}
    >
      <div
        className="w-full max-w-md bg-surface-mid border border-border-muted rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-muted">
          <Search size={16} className="text-text-secondary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => execute(cmd)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                i === selectedIndex
                  ? "bg-surface-high text-text-primary"
                  : "text-text-secondary hover:bg-surface-high hover:text-text-primary"
              }`}
            >
              <cmd.icon size={16} strokeWidth={1.5} />
              <span>{cmd.label}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-sm text-text-muted text-center">
              No commands found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
