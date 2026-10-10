import type { ReactNode } from "react";
import {
  DashboardAuthGuard,
  DashboardLayout as DashboardShell,
  RealtimeSync,
} from "@/presentation/components/layout";

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
