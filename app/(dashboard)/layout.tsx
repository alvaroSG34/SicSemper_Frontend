import type { ReactNode } from "react";
import {
  DashboardAuthGuard,
  DashboardLayout as DashboardShell,
} from "@/presentation/components/layout";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      <DashboardAuthGuard />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
