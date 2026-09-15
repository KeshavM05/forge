"use client";

import { useState, useEffect } from "react";
import { Clock, Download, FileText } from "lucide-react";

type Session = {
  id: string;
  jobDescription: string;
  extractedKeywords: string;
  selectedItemIds: string;
  coverage: string;
  outputTex: string | null;
  createdAt: string;
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json() as Promise<{ sessions?: Session[] }>)
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      });
  }, []);

  const selected = sessions.find((s) => s.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full">
      {/* Left: Session List */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col bg-surface-low border-r border-border-muted/30 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-muted/30">
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
            Assembly History
          </span>
          <span className="text-[10px] font-mono text-text-muted">
            {sessions.length}
          </span>
        </div>

        {loading ? (
          <div className="p-3 text-xs text-text-muted">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-6 text-center">
            <Clock size={20} className="mb-2 opacity-40" />
            <p className="text-xs">No assemblies yet</p>
          </div>
        ) : (
          <div className="flex-1 py-1">
            {sessions.map((session) => {
              const coverage = JSON.parse(session.coverage || "{}") as {
                score?: number;
              };
              const jdPreview = session.jobDescription.slice(0, 80);
              const active = selectedId === session.id;

              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedId(session.id)}
                  className={`w-full text-left px-3 py-2 transition-colors border-b border-border-muted/20 ${
                    active
                      ? "bg-accent-subtle text-accent"
                      : "text-text-secondary hover:bg-surface-mid/50 hover:text-text-primary"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-mono text-text-muted">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                    {coverage.score !== undefined && (
                      <span
                        className={`text-[10px] font-mono font-medium ${
                          coverage.score >= 70
                            ? "text-success"
                            : coverage.score >= 40
                              ? "text-warning"
                              : "text-danger"
                        }`}
                      >
                        {coverage.score}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate">{jdPreview}...</p>
                  <span className="text-[10px] font-mono text-text-muted">
                    {JSON.parse(session.selectedItemIds || "[]").length} items
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Session Detail */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col p-6 overflow-y-auto">
        {selected ? (
          <SessionDetail session={selected} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <FileText size={24} className="mb-2 opacity-40" />
            <p className="text-sm">Select a session to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SessionDetail({ session }: { session: Session }) {
  const coverage = JSON.parse(session.coverage || "{}") as {
    score?: number;
    covered?: string[];
    missing?: string[];
  };
  const keywords = JSON.parse(session.extractedKeywords || "[]") as string[];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono text-text-muted block">
            {new Date(session.createdAt).toLocaleString()}
          </span>
          {coverage.score !== undefined && (
            <span
              className={`text-2xl font-bold font-mono ${
                coverage.score >= 70
                  ? "text-success"
                  : coverage.score >= 40
                    ? "text-warning"
                    : "text-danger"
              }`}
            >
              ATS: {coverage.score}%
            </span>
          )}
        </div>
        {session.outputTex && (
          <button
            onClick={() => {
              const blob = new Blob([session.outputTex!], {
                type: "application/x-tex",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `resume-${session.id.slice(0, 8)}.tex`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1.5 rounded bg-accent text-base text-xs font-medium hover:bg-accent-bold transition-colors flex items-center gap-1.5"
          >
            <Download size={12} />
            Download .tex
          </button>
        )}
      </div>

      <div>
        <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider block mb-2">
          Job Description
        </span>
        <div className="bg-surface-mid rounded-lg p-3 text-xs font-mono text-text-primary whitespace-pre-wrap max-h-48 overflow-y-auto">
          {session.jobDescription}
        </div>
      </div>

      {keywords.length > 0 && (
        <div>
          <span className="text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider block mb-2">
            Keywords ({keywords.length})
          </span>
          <div className="flex flex-wrap gap-1">
            {keywords.map((kw) => {
              const isCovered = coverage.covered?.includes(kw);
              return (
                <span
                  key={kw}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isCovered
                      ? "bg-success-dim/20 text-success"
                      : "bg-danger-dim/20 text-danger"
                  }`}
                >
                  {kw}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
