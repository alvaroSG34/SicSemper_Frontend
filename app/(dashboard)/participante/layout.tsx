import type { ReactNode } from "react";
import { DashboardRoleGuard } from "@/presentation/components/layout";

type ParticipantLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function ParticipantLayout({ children }: ParticipantLayoutProps) {
  return <DashboardRoleGuard allowedRoles={["PARTICIPANTE"]}>{children}</DashboardRoleGuard>;
}

