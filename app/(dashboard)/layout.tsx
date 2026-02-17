import type { ReactNode } from "react";
import { DashboardLayout as DashboardShell } from "@/presentation/components/layout";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
