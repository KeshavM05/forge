"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, User } from "lucide-react";
import { useIDE, useIDEDispatch } from "./ide-context";
import { useBank } from "@/lib/bank-store";

const viewTabs = [
  { id: "agent", label: "Agent", href: "/dashboard" },
  { id: "resumes", label: "Resumes", href: "/dashboard/resumes" },
  { id: "bank", label: "Bank", href: "/dashboard/bank" },
];

export function HeaderBar() {
  const pathname = usePathname();
  const state = useIDE();
  const dispatch = useIDEDispatch();
  const bank = useBank();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-11 bg-surface-low border-b border-border-muted/30 flex items-center justify-between px-3">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-semibold text-text-primary tracking-tight">
            Forge
          </span>
        </Link>
        <span className="text-border">/</span>
        <span className="font-mono text-xs text-text-secondary">
          {bank.masterResume?.name || "no master set"}
        </span>
        <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded bg-surface-mid border border-border-muted/40">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              state.agentStatus === "running"
                ? "bg-success animate-pulse"
                : state.agentStatus === "done"
                  ? "bg-success"
                  : "bg-text-secondary"
            }`}
          />
          <span className="text-[11px] font-medium text-text-secondary capitalize">
            Agent {state.agentStatus}
          </span>
        </div>
      </div>

      <nav className="flex items-center p-0.5 bg-base rounded border border-border-muted/30">
        {viewTabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() =>
                dispatch({
                  type: "OPEN_TAB",
                  tab: {
                    id: tab.id,
                    label: tab.label,
                    href: tab.href,
                    closable: tab.id !== "agent",
                  },
                })
              }
              className={`px-2.5 py-0.5 rounded text-xs transition-colors ${
                active
                  ? "bg-surface-high text-text-primary font-medium"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        {state.coverageScore !== null && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-mid border border-success-dim/40">
            <span
              className={`text-[11px] font-mono font-medium ${
                state.coverageScore >= 70
                  ? "text-success"
                  : state.coverageScore >= 40
                    ? "text-warning"
                    : "text-danger"
              }`}
            >
              ATS {state.coverageScore}%
            </span>
          </div>
        )}
        <div className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded bg-surface-mid border border-border-muted/30 text-text-secondary">
          <kbd className="text-[11px] font-mono">⌘</kbd>
          <kbd className="text-[11px] font-mono">K</kbd>
        </div>
        <button className="px-2.5 py-1 rounded bg-accent text-base text-sm font-medium hover:bg-accent-bold transition-colors flex items-center gap-1.5">
          <Terminal size={14} />
          <span>Export</span>
        </button>
        <div className="w-7 h-7 rounded-full bg-accent-bold flex items-center justify-center">
          <User size={14} className="text-base" />
        </div>
      </div>
    </header>
  );
}
