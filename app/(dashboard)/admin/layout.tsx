import type { ReactNode } from "react";
import { DashboardRoleGuard } from "@/presentation/components/layout";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <DashboardRoleGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>{children}</DashboardRoleGuard>;
}

