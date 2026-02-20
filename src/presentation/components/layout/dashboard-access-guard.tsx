"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@/domain/user/user.types";
import { useAuthStore } from "@/presentation/stores";

const dashboardRouteByRole: Record<UserRole, string> = {
  PARTICIPANTE: "/participante",
  JUEZ: "/juez",
  ADMIN: "/admin",
};

const getRouteRole = (pathname: string): UserRole | null => {
  if (pathname.startsWith("/admin")) {
    return "ADMIN";
  }

  if (pathname.startsWith("/juez")) {
    return "JUEZ";
  }

  if (pathname.startsWith("/participante")) {
    return "PARTICIPANTE";
  }

  return null;
};

type DashboardAccessGuardProps = Readonly<{
  children: ReactNode;
}>;

export function DashboardAccessGuard({ children }: DashboardAccessGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.currentRole);
  const routeRole = getRouteRole(pathname);

  useEffect(() => {
    if (!user || !currentRole) {
      router.replace("/login");
      return;
    }

    if (routeRole && routeRole !== currentRole) {
      router.replace(dashboardRouteByRole[currentRole]);
    }
  }, [currentRole, routeRole, router, user]);

  if (!user || !currentRole || (routeRole && routeRole !== currentRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Verificando acceso...
      </div>
    );
  }

  return <>{children}</>;
}
