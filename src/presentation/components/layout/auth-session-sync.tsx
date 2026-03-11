"use client";

import { useEffect } from "react";
import type { User, UserRole } from "@/domain/user/user.types";
import { useAuthStore } from "@/presentation/stores";

type AuthSessionSyncProps = {
  user: User;
  activeRole: UserRole;
};

export function AuthSessionSync({ user, activeRole }: AuthSessionSyncProps) {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession({
      user,
      currentRole: activeRole,
    });
  }, [activeRole, hydrateSession, user]);

  return null;
}

