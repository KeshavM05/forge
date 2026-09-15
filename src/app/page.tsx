export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-foreground/10">
        <span className="text-xl font-semibold tracking-tight">Forge</span>
        <a
          href="/dashboard"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Sign in
        </a>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 text-center">
        <div className="flex flex-col gap-4 max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Assemble the right resume
            <br />
            <span className="text-blue-600 dark:text-blue-400">
              for every job
            </span>
          </h1>
          <p className="text-lg text-foreground/60 max-w-lg mx-auto">
            Maintain a bank of your best bullets. Paste a job description.
            Forge selects the right content, checks ATS coverage, and fills your
            LaTeX template.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Get started
          </a>
          <a
            href="https://github.com/KeshavM05/forge"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-foreground/15 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
          >
            View on GitHub
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 max-w-3xl w-full mt-8">
          <div className="rounded-xl border border-foreground/10 p-6 text-left">
            <h3 className="font-semibold mb-2">Content Bank</h3>
            <p className="text-sm text-foreground/60">
              Curate experience bullets, projects, and skills. Your approved
              content, always ready.
            </p>
          </div>
          <div className="rounded-xl border border-foreground/10 p-6 text-left">
            <h3 className="font-semibold mb-2">ATS Coverage</h3>
            <p className="text-sm text-foreground/60">
              See which keywords are covered and which are missing. Fill gaps
              before you apply.
            </p>
          </div>
          <div className="rounded-xl border border-foreground/10 p-6 text-left">
            <h3 className="font-semibold mb-2">LaTeX Output</h3>
            <p className="text-sm text-foreground/60">
              Download a .tex file using your exact template. No formatting
              surprises.
            </p>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center py-6 text-sm text-foreground/40">
        Forge &mdash; built by Keshav
      </footer>
    </div>
  );
}
