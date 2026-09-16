"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  FileText,
  Code,
  ClipboardCheck,
  Settings,
} from "lucide-react";
import { useIDEDispatch } from "./ide-context";

const topItems = [
  { href: "/dashboard", icon: Bot, label: "Agent Workspace", id: "agent" },
  {
    href: "/dashboard/resumes",
    icon: FileText,
    label: "Resumes",
    id: "resumes",
  },
  { href: "/dashboard/bank", icon: Code, label: "Content Bank", id: "bank" },
  {
    href: "/dashboard/history",
    icon: ClipboardCheck,
    label: "History",
    id: "history",
  },
];

export function ActivityBar() {
  const pathname = usePathname();
  const dispatch = useIDEDispatch();

  return (
    <aside className="fixed left-0 top-11 bottom-6 w-12 bg-surface-low border-r border-border-muted/30 z-40 flex flex-col items-center justify-between py-2">
      <nav className="flex flex-col items-center gap-1 w-full">
        {topItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              onClick={() =>
                dispatch({
                  type: "OPEN_TAB",
                  tab: {
                    id: item.id,
                    label: item.label,
                    href: item.href,
                    closable: item.id !== "agent",
                  },
                })
              }
              className={`w-9 h-9 rounded flex items-center justify-center transition-colors ${
                active
                  ? "text-accent bg-surface-high"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-mid"
              }`}
            >
              <item.icon size={20} strokeWidth={1.5} />
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col items-center gap-1">
        <button
          title="Settings"
          className="w-9 h-9 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-mid transition-colors"
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
