"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/domain/user/user.types";
import { useAuthStore } from "@/presentation/stores";

type DashboardRoleGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

const defaultRouteByRole: Record<UserRole, string> = {
  PARTICIPANTE: "/participante/inicio",
  JUEZ: "/juez/inicio",
  ADMIN: "/admin/inicio",
  SUPERADMIN: "/admin/inicio",
};

export function DashboardRoleGuard({ allowedRoles, children }: DashboardRoleGuardProps) {
  const router = useRouter();
  const initialized = useAuthStore((state) => state.initialized);
  const initializing = useAuthStore((state) => state.initializing);
  const user = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.currentRole);

  useEffect(() => {
    if (!initialized || initializing) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    const resolvedRole = currentRole ?? user.roles[0] ?? null;
    if (!resolvedRole) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(resolvedRole)) {
      router.replace(defaultRouteByRole[resolvedRole]);
    }
  }, [allowedRoles, currentRole, initialized, initializing, router, user]);

  return <>{children}</>;
}
