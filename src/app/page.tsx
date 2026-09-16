import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-full flex flex-col bg-base">
      <header className="flex items-center justify-between px-8 py-5">
        <span className="text-base font-semibold tracking-tight text-text-primary">Forge</span>
        <Link href="/dashboard"
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-accent-bold glow-accent">
          Open App
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="text-center max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] text-text-secondary mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            LaTeX-native resume intelligence
          </div>

          <h1 className="text-[3.2rem] font-bold tracking-tight leading-[1.08] mb-5 text-white">
            The right resume,<br />every time
          </h1>

          <p className="text-base text-text-secondary leading-relaxed max-w-sm mx-auto mb-10">
            Paste a job description. AI selects your best content, scores ATS keywords, and compiles a real PDF.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard"
              className="rounded-lg bg-accent px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-bold glow-accent">
              Start Building
            </Link>
            <a href="https://github.com/KeshavM05/forge" target="_blank" rel="noopener noreferrer"
              className="rounded-lg glass px-7 py-3 text-sm font-medium text-text-secondary transition-all hover:text-text-primary">
              GitHub
            </a>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 max-w-2xl w-full mt-20">
          {[
            { title: "Content Bank", desc: "Curate your best bullets, tagged and organized. Your source of truth." },
            { title: "ATS Intelligence", desc: "Real keyword extraction via Claude. Score coverage, close gaps." },
            { title: "PDF Assembly", desc: "Your LaTeX template, compiled to PDF. Download .tex or .pdf." },
          ].map((card, i) => (
            <div key={card.title} className="glass rounded-xl p-5 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{card.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-[11px] text-text-muted">
        Built by Keshav Mehndiratta
      </footer>
    </div>
  );
}
