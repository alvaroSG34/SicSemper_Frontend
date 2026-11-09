import type { Metadata } from "next";
import { privatePageRobots } from "@/core/seo";
import type { ReactNode } from "react";
import {
  DashboardAuthGuard,
  DashboardLayout as DashboardShell,
  RealtimeSync,
} from "@/presentation/components/layout";

export const metadata: Metadata = { robots: privatePageRobots };

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      <DashboardAuthGuard />
      <RealtimeSync />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
