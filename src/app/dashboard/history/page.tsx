"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json() as Promise<{ sessions?: Session[] }>)
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Assembly History
      </h1>
      {loading ? (
        <p className="text-foreground/40">Loading...</p>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-foreground/20 p-12 text-center">
          <p className="text-foreground/50 mb-2">No assemblies yet</p>
          <p className="text-sm text-foreground/30">
            Assemble a resume from a job description to see it here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => {
            const coverage = JSON.parse(session.coverage || "{}");
            const jdPreview = session.jobDescription.slice(0, 120);
            return (
              <div
                key={session.id}
                className="rounded-xl border border-foreground/10 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm mb-1">{jdPreview}...</p>
                    <div className="flex items-center gap-3 text-xs text-foreground/40">
                      <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                      {coverage.score !== undefined && (
                        <span>ATS: {coverage.score}%</span>
                      )}
                      <span>
                        {JSON.parse(session.selectedItemIds || "[]").length}{" "}
                        items selected
                      </span>
                    </div>
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
                      className="text-xs text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Download .tex
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
