import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forge — LaTeX Resume Assembler",
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-base text-text-primary">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border-muted/30">
        <span className="text-lg font-semibold tracking-tight">Forge</span>
        <Link
          href="/dashboard"
          className="rounded bg-accent px-4 py-1.5 text-sm font-medium text-base transition-colors hover:bg-accent-bold"
        >
          Open App
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 text-center">
        <div className="flex flex-col gap-4 max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Assemble the right resume
            <br />
            <span className="text-accent">for every job</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-lg mx-auto">
            Maintain a bank of your best bullets. Paste a job description. Forge
            selects the right content, checks ATS coverage, and fills your LaTeX
            template.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded bg-accent px-6 py-3 text-sm font-medium text-base transition-colors hover:bg-accent-bold"
          >
            Get started
          </Link>
          <a
            href="https://github.com/KeshavM05/forge"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border/40 px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-mid hover:text-text-primary"
          >
            View on GitHub
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 max-w-3xl w-full mt-8">
          <div className="rounded-lg border border-border-muted/30 bg-surface-low p-6 text-left">
            <h3 className="font-semibold mb-2 text-text-primary">
              Content Bank
            </h3>
            <p className="text-sm text-text-secondary">
              Curate experience bullets, projects, and skills. Your approved
              content, always ready.
            </p>
          </div>
          <div className="rounded-lg border border-border-muted/30 bg-surface-low p-6 text-left">
            <h3 className="font-semibold mb-2 text-text-primary">
              ATS Coverage
            </h3>
            <p className="text-sm text-text-secondary">
              See which keywords are covered and which are missing. Fill gaps
              before you apply.
            </p>
          </div>
          <div className="rounded-lg border border-border-muted/30 bg-surface-low p-6 text-left">
            <h3 className="font-semibold mb-2 text-text-primary">
              LaTeX Output
            </h3>
            <p className="text-sm text-text-secondary">
              Download a .tex file using your exact template. No formatting
              surprises.
            </p>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center py-6 text-sm text-text-muted">
        Forge &mdash; built by Keshav
      </footer>
    </div>
  );
}
