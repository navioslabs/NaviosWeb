import type { ReactNode } from "react";
import { AppProvider } from "./AppProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { BottomNav } from "@/components/layout/BottomNav";

export function PageWrapper({ pathname, children }: { pathname: string; children: ReactNode }) {
  return (
    <AppProvider>
      <div className="min-h-screen bg-bg">
        <Sidebar pathname={pathname} />
        <MobileHeader />
        <main className="pt-14 pb-20 lg:pl-[220px] lg:pt-0 lg:pb-0">
          <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
        </main>
        <BottomNav pathname={pathname} />
      </div>
    </AppProvider>
  );
}
