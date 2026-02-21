"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/presentation/components/layout/dashboard-header";
import { DashboardSidebar } from "@/presentation/components/layout/dashboard-sidebar";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
  title?: string;
  subtitle?: string;
}>;

export function DashboardLayout({
  children,
  title = "Panel de control",
  subtitle = "Arquitectura base lista para conectar features.",
}: DashboardLayoutProps) {
  const pathname = usePathname();

  if (
    pathname.startsWith("/participante") ||
    pathname.startsWith("/juez") ||
    pathname.startsWith("/admin")
  ) {
    return <div className="min-h-screen bg-[#000000] text-white">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <DashboardSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <DashboardHeader title={title} subtitle={subtitle} />
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
