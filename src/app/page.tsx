import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-full flex flex-col bg-base">
      <header className="flex items-center justify-between px-8 py-5">
        <span className="text-lg font-semibold tracking-tight text-text-primary">
          Forge
        </span>
        <Link
          href="/dashboard"
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-accent-bold hover:shadow-lg hover:shadow-accent/20"
        >
          Open App
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-mid border border-border-muted text-xs text-text-secondary mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Built for engineers who write LaTeX
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            The right resume
            <br />
            <span className="bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
              for every job
            </span>
          </h1>

          <p className="text-lg text-text-secondary leading-relaxed max-w-md mx-auto mb-10">
            Paste a job description. Forge selects the best content from your
            bank, checks ATS coverage, and assembles your LaTeX template.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-accent px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-bold hover:shadow-lg hover:shadow-accent/25"
            >
              Start Building
            </Link>
            <a
              href="https://github.com/KeshavM05/forge"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-8 py-3 text-sm font-medium text-text-secondary transition-all hover:bg-surface-mid hover:text-text-primary hover:border-border/80"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl w-full mt-20">
          {[
            {
              title: "Content Bank",
              desc: "Curate your best bullets. Every experience and project, tagged and ready.",
            },
            {
              title: "ATS Intelligence",
              desc: "Extract JD keywords, score coverage in real-time, close gaps before applying.",
            },
            {
              title: "LaTeX Assembly",
              desc: "Your exact template, your macros. Download a .tex that compiles clean.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-border-muted bg-surface/80 p-5"
            >
              <h3 className="text-sm font-semibold text-text-primary mb-1.5">
                {card.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-text-muted">
        Built by Keshav Mehndiratta
      </footer>
    </div>
  );
}
