import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  AuthSessionSync,
  DashboardLayout as DashboardShell,
} from "@/presentation/components/layout";
import { getServerSession } from "@/infrastructure/auth/server-session";

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <AuthSessionSync user={session.user} activeRole={session.activeRole} />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
