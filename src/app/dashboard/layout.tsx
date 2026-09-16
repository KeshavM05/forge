"use client";

import { IDEProvider } from "@/components/ide/ide-context";
import { HeaderBar } from "@/components/ide/HeaderBar";
import { ActivityBar } from "@/components/ide/ActivityBar";
import { StatusBar } from "@/components/ide/StatusBar";
import { CommandPalette } from "@/components/ide/CommandPalette";
import { BankProvider } from "@/lib/bank-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IDEProvider>
      <BankProvider>
        <div className="h-screen overflow-hidden bg-base text-text-primary">
          <HeaderBar />
          <ActivityBar />
          <div className="pl-11 pt-10 pb-5 h-full">
            <main className="h-full overflow-hidden">{children}</main>
          </div>
          <StatusBar />
          <CommandPalette />
        </div>
      </BankProvider>
    </IDEProvider>
  );
}
