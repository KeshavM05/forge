"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { useIDE } from "./ide-context";
import { useBank } from "@/lib/bank-store";

const navItems = [
  { href: "/dashboard", label: "Agent" },
  { href: "/dashboard/resumes", label: "Resumes" },
  { href: "/dashboard/bank", label: "Bank" },
];

export function HeaderBar() {
  const pathname = usePathname();
  const state = useIDE();
  const bank = useBank();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-10 bg-surface-low border-b border-border-muted flex items-center justify-between px-3">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm font-semibold text-text-primary tracking-tight hover:text-accent transition-colors"
        >
          Forge
        </Link>
        <span className="text-border-muted">/</span>
        <span className="text-xs font-mono text-text-secondary truncate max-w-[200px]">
          {bank.masterResume?.name ?? "no master"}
        </span>
        <span
          className={`ml-1 w-1.5 h-1.5 rounded-full ${
            state.agentStatus === "running"
              ? "bg-accent animate-pulse"
              : state.agentStatus === "done"
                ? "bg-success"
                : "bg-text-muted"
          }`}
        />
      </div>

      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-mid/60">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                active
                  ? "bg-surface-high text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        {state.coverageScore !== null && (
          <div
            className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold ${
              state.coverageScore >= 70
                ? "bg-success/10 text-success"
                : state.coverageScore >= 40
                  ? "bg-warning/10 text-warning"
                  : "bg-danger/10 text-danger"
            }`}
          >
            ATS {state.coverageScore}%
          </div>
        )}
        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-mid text-[10px] font-mono text-text-muted border border-border-muted">
          ⌘K
        </kbd>
        <button className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-bold transition-all">
          <Download size={12} />
          Export
        </button>
      </div>
    </header>
  );
}
