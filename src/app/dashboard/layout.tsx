"use client";

import { IDEProvider } from "@/components/ide/ide-context";
import { HeaderBar } from "@/components/ide/HeaderBar";
import { ActivityBar } from "@/components/ide/ActivityBar";
import { StatusBar } from "@/components/ide/StatusBar";
import { CommandPalette } from "@/components/ide/CommandPalette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IDEProvider>
      <div className="h-screen overflow-hidden bg-base text-text-primary select-none">
        <HeaderBar />
        <ActivityBar />
        <div className="pl-12 pt-11 pb-6 h-full">
          <main className="h-full overflow-hidden bg-base">{children}</main>
        </div>
        <StatusBar />
        <CommandPalette />
      </div>
    </IDEProvider>
  );
}
