import type { ReactNode } from "react";
import {
  DashboardAccessGuard,
  DashboardLayout as DashboardShell,
} from "@/presentation/components/layout";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardAccessGuard>
      <DashboardShell>{children}</DashboardShell>
    </DashboardAccessGuard>
  );
}
