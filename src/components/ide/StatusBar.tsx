"use client";

import { RefreshCw } from "lucide-react";
import { useIDE } from "./ide-context";

export function StatusBar() {
  const state = useIDE();

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-6 bg-surface-low border-t border-border-muted/30 z-40 flex items-center justify-between px-2 text-[11px] font-medium text-text-secondary">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-text-primary">
          <RefreshCw size={12} className="text-success" />
          Forge Engine
        </span>
        <span className="text-border-muted">|</span>
        <span>UTF-8</span>
        {state.bankCount > 0 && (
          <>
            <span className="text-border-muted">|</span>
            <span>
              {state.selectedCount}/{state.bankCount} items
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {state.coverageScore !== null && (
          <>
            <span
              className={
                state.coverageScore >= 70 ? "text-success" : "text-warning"
              }
            >
              ATS: {state.coverageScore}%
            </span>
            <span className="text-border-muted">|</span>
          </>
        )}
        <span className="text-success">Ready</span>
      </div>
    </footer>
  );
}
