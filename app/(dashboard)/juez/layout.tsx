import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/infrastructure/auth/server-session";
import { JudgeDashboardShell } from "@/presentation/components/features/judge/judge-dashboard-shell";

type JudgeLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function JudgeLayout({ children }: JudgeLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.activeRole !== "JUEZ") {
    redirect(
      session.activeRole === "ADMIN" || session.activeRole === "SUPERADMIN"
        ? "/admin/inicio"
        : "/participante/inicio",
    );
  }

  return <JudgeDashboardShell>{children}</JudgeDashboardShell>;
}
