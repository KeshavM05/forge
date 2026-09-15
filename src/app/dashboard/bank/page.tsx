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
} from "lucide-react";
import { MASTER_BANK, type SeedEntry, EDUCATION_TEX, SKILLS_TEX } from "@/lib/seed-bank";

const KIND_ICONS: Record<string, typeof Briefcase> = {
  experience: Briefcase,
  project: FolderOpen,
  education: GraduationCap,
  skill: Wrench,
};

const KINDS = ["experience", "project"] as const;

export default function BankPage() {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [expandedKinds, setExpandedKinds] = useState<Set<string>>(
    new Set(KINDS)
  );

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
      acc[kind] = MASTER_BANK.filter((e) => e.kind === kind);
      return acc;
    },
    {} as Record<string, SeedEntry[]>
  );

  const selectedEntry = MASTER_BANK.find((e) => e.title === selectedTitle);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full">
      {/* Left: Tree View */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col bg-surface-low border-r border-border-muted/30 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted/30">
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
            Master Resume Bank
          </span>
          <span className="text-[10px] font-mono text-text-muted">
            {MASTER_BANK.length} entries
          </span>
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
                      key={item.title + item.kind}
                      onClick={() => setSelectedTitle(item.title)}
                      className={`w-full text-left pl-7 pr-2 py-1.5 text-xs transition-colors ${
                        selectedTitle === item.title
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

          {/* Static sections */}
          <button
            onClick={() => setSelectedTitle("__education__")}
            className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs transition-colors ${
              selectedTitle === "__education__"
                ? "bg-accent-subtle text-accent"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-mid/50"
            }`}
          >
            <GraduationCap size={13} className="text-text-muted" />
            <span className="font-medium">Education</span>
            <span className="text-text-muted ml-auto text-[10px]">fixed</span>
          </button>
          <button
            onClick={() => setSelectedTitle("__skills__")}
            className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs transition-colors ${
              selectedTitle === "__skills__"
                ? "bg-accent-subtle text-accent"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-mid/50"
            }`}
          >
            <Wrench size={13} className="text-text-muted" />
            <span className="font-medium">Technical Skills</span>
            <span className="text-text-muted ml-auto text-[10px]">fixed</span>
          </button>
        </div>
      </div>

      {/* Right: Detail */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col p-6 overflow-y-auto">
        {selectedTitle === "__education__" ? (
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider block mb-3">
              Education (constant across all resumes)
            </span>
            <pre className="bg-surface-mid rounded-lg p-4 text-[11px] font-mono text-text-secondary leading-5 overflow-x-auto">
              {EDUCATION_TEX}
            </pre>
          </div>
        ) : selectedTitle === "__skills__" ? (
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider block mb-3">
              Technical Skills (constant across all resumes)
            </span>
            <pre className="bg-surface-mid rounded-lg p-4 text-[11px] font-mono text-text-secondary leading-5 overflow-x-auto">
              {SKILLS_TEX}
            </pre>
          </div>
        ) : selectedEntry ? (
          <EntryDetail entry={selectedEntry} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <p className="text-sm">Select an entry to view details</p>
            <p className="text-xs mt-1">
              Your bank has {MASTER_BANK.filter((e) => e.kind === "experience").length} experiences and{" "}
              {MASTER_BANK.filter((e) => e.kind === "project").length} projects
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EntryDetail({ entry }: { entry: SeedEntry }) {
  const Icon = KIND_ICONS[entry.kind] || Briefcase;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="text-accent" />
        <span className="text-[11px] font-mono font-medium text-accent uppercase">
          {entry.kind}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-text-primary mb-0.5">
        {entry.title}
      </h2>
      <p className="text-sm text-text-secondary mb-1">{entry.subtitle}</p>
      <p className="text-xs text-text-muted mb-4">
        {entry.dateRange}
        {entry.location && ` · ${entry.location}`}
      </p>

      <div className="space-y-2 mb-4">
        {entry.bullets.map((bullet, i) => (
          <div key={i} className="flex gap-2">
            <Circle size={4} className="shrink-0 mt-2 text-text-muted" />
            <p className="text-sm font-mono leading-relaxed text-text-primary bg-surface-mid rounded px-3 py-2 flex-1">
              {bullet
                .replace(/\\textbf\{/g, "")
                .replace(/\}/g, "")
                .replace(/\\\\/g, "")
                .replace(/\\&/g, "&")
                .replace(/\\%/g, "%")
                .replace(/\\\$/g, "$")}
            </p>
          </div>
        ))}
      </div>

      {entry.tags.length > 0 && (
        <div>
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider block mb-1.5">
            Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-surface-high text-[11px] font-mono text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
