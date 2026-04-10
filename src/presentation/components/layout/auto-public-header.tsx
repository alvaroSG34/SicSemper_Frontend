"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@/domain/user/user.types";
import { useAuthStore } from "@/presentation/stores";
import { PublicHeader } from "./public-header";

const LANDING_SECTION_IDS = ["inicio", "acerca", "agenda", "equipo", "ubicacion"] as const;

const dashboardRouteByRole: Record<UserRole, string> = {
  PARTICIPANTE: "/participante/inicio",
  JUEZ: "/juez/inicio",
  ADMIN: "/admin/inicio",
  SUPERADMIN: "/admin/inicio",
};

export function AutoPublicHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const variant = pathname === "/login" ? "login" : "landing";
  const [activeLinkId, setActiveLinkId] = useState<string | null>("inicio");

  const user = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.currentRole);
  const initialized = useAuthStore((state) => state.initialized);
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const switchRole = useAuthStore((state) => state.switchRole);
  const logout = useAuthStore((state) => state.logout);

  const availableRoles = user?.roles ?? [];
  const activeRole = currentRole ?? availableRoles[0] ?? null;

  const dashboardHref = useMemo(() => {
    if (!activeRole) {
      return "/login";
    }

    return dashboardRouteByRole[activeRole];
  }, [activeRole]);

  useEffect(() => {
    if (initialized) {
      return;
    }

    void initializeSession();
  }, [initializeSession, initialized]);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const updateFromHash = () => {
      const hashId = window.location.hash.replace("#", "");
      if (LANDING_SECTION_IDS.includes(hashId as (typeof LANDING_SECTION_IDS)[number])) {
        setActiveLinkId(hashId);
      }
    };

    const hashFrame = window.requestAnimationFrame(updateFromHash);

    const sections = LANDING_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    );

    if (sections.length === 0) {
      return () => window.cancelAnimationFrame(hashFrame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length === 0) {
          return;
        }

        visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActiveLinkId(visibleEntries[0].target.id);
      },
      {
        root: null,
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.15, 0.35, 0.55, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));
    window.addEventListener("hashchange", updateFromHash);

    return () => {
      window.cancelAnimationFrame(hashFrame);
      observer.disconnect();
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, [pathname]);

  const handleRoleChange = async (role: UserRole) => {
    await switchRole(role);
    router.push(dashboardRouteByRole[role]);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <PublicHeader
      variant={variant}
      isLandingPage={pathname === "/"}
      activeLinkId={pathname === "/" ? activeLinkId : null}
      activeAuthAction={pathname === "/login" ? "login" : pathname === "/register" ? "register" : null}
      currentUserName={user?.name ?? null}
      availableRoles={availableRoles}
      currentRole={activeRole}
      dashboardHref={dashboardHref}
      onRoleChange={handleRoleChange}
      onLogout={handleLogout}
    />
  );
}
