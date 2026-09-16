"use client";

import { useIDE } from "./ide-context";
import { useBank } from "@/lib/bank-store";

export function StatusBar() {
  const state = useIDE();
  const bank = useBank();

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-5 bg-surface-low border-t border-border-muted z-40 flex items-center justify-between px-3 text-[10px] font-mono text-text-muted">
      <div className="flex items-center gap-3">
        <span className="text-text-secondary">Forge</span>
        <span>{bank.experiences.length} exp</span>
        <span>{bank.projects.length} proj</span>
        <span>{bank.resumes.length} resumes</span>
      </div>
      <div className="flex items-center gap-3">
        {state.coverageScore !== null && (
          <span
            className={
              state.coverageScore >= 70 ? "text-success" : "text-warning"
            }
          >
            ATS {state.coverageScore}%
          </span>
        )}
        <span
          className={
            state.agentStatus === "done" ? "text-success" : "text-text-muted"
          }
        >
          {state.agentStatus === "running" ? "Working..." : "Ready"}
        </span>
      </div>
    </footer>
  );
}
