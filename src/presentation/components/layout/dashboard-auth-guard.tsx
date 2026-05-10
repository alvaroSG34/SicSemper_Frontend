"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/presentation/stores";

export function DashboardAuthGuard() {
  const router = useRouter();
  const initialized = useAuthStore((state) => state.initialized);
  const initializing = useAuthStore((state) => state.initializing);
  const user = useAuthStore((state) => state.user);
  const initializeSession = useAuthStore((state) => state.initializeSession);

  useEffect(() => {
    if (!initialized && !initializing) {
      void initializeSession();
    }
  }, [initializeSession, initialized, initializing]);

  useEffect(() => {
    if (!initialized || initializing) {
      return;
    }

    if (!user) {
      router.replace("/login");
    }
  }, [initialized, initializing, router, user]);

  return null;
}
