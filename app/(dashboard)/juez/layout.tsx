import type { ReactNode } from "react";
import { DashboardRoleGuard } from "@/presentation/components/layout";
import { JudgeDashboardShell } from "@/presentation/components/features/judge/judge-dashboard-shell";

type JudgeLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function JudgeLayout({ children }: JudgeLayoutProps) {
  return (
    <DashboardRoleGuard allowedRoles={["JUEZ"]}>
      <JudgeDashboardShell>{children}</JudgeDashboardShell>
    </DashboardRoleGuard>
  );
}
