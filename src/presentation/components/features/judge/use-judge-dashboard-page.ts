import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useJudgeStore } from "@/presentation/stores";

export const useJudgeDashboardPage = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const dashboard = useJudgeStore((state) => state.dashboard);
  const loading = useJudgeStore((state) => state.loading);
  const error = useJudgeStore((state) => state.error);
  const loadDashboard = useJudgeStore((state) => state.loadDashboard);
  const startReview = useJudgeStore((state) => state.startReview);
  const clearError = useJudgeStore((state) => state.clearError);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const profile = dashboard?.profile;
  const summary = dashboard?.summary;
  const kpis = dashboard?.kpis;
  const pendingQueue = useMemo(() => dashboard?.pendingQueue ?? [], [dashboard?.pendingQueue]);
  const recentReviews = useMemo(() => dashboard?.recentReviews ?? [], [dashboard?.recentReviews]);
  const assignedEvents = useMemo(() => dashboard?.assignedEvents ?? [], [dashboard?.assignedEvents]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  return {
    dashboard,
    loading,
    error,
    profile,
    summary,
    kpis,
    pendingQueue,
    recentReviews,
    assignedEvents,
    loadDashboard,
    startReview,
    clearError,
    handleLogout,
  };
};
