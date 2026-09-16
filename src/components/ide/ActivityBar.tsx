"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, FileStack, Database, Settings } from "lucide-react";

const items = [
  { href: "/dashboard", icon: Sparkles, label: "Agent" },
  { href: "/dashboard/resumes", icon: FileStack, label: "Resumes" },
  { href: "/dashboard/bank", icon: Database, label: "Bank" },
];

export function ActivityBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-10 bottom-0 w-11 bg-surface-low border-r border-border-muted z-40 flex flex-col items-center justify-between py-2">
      <nav className="flex flex-col items-center gap-0.5 w-full">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`relative w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                active
                  ? "text-accent bg-accent/10"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-mid"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-r bg-accent" />
              )}
              <item.icon size={16} strokeWidth={active ? 2 : 1.5} />
            </Link>
          );
        })}
      </nav>
      <button
        title="Settings"
        className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-mid transition-all"
      >
        <Settings size={16} strokeWidth={1.5} />
      </button>
    </aside>
  );
}
