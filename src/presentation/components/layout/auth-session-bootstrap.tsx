"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/presentation/stores";

export function AuthSessionBootstrap() {
  const initializeSession = useAuthStore((state) => state.initializeSession);

  useEffect(() => {
    void initializeSession();
  }, [initializeSession]);

  return null;
}
