export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Content Bank"
          value="0 items"
          description="Bullets, projects, and skills"
          href="/dashboard/bank"
        />
        <DashboardCard
          title="Assemblies"
          value="0 sessions"
          description="Resumes you've assembled"
          href="/dashboard/history"
        />
        <DashboardCard
          title="Quick Assemble"
          value="Paste a JD"
          description="Select content and download .tex"
          href="/dashboard/assemble"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-xl border border-foreground/10 p-6 transition-colors hover:border-foreground/20 hover:bg-foreground/[0.02]"
    >
      <p className="text-sm text-foreground/50 mb-1">{title}</p>
      <p className="text-xl font-semibold mb-1">{value}</p>
      <p className="text-sm text-foreground/40">{description}</p>
    </a>
  );
}
