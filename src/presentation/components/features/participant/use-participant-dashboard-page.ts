import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ParticipantSectionId } from "@/domain/participant/participant.types";
import { useAuthStore, useParticipantStore } from "@/presentation/stores";
import { participantSectionRouteById } from "./participant-routes";

type UseParticipantDashboardPageParams = {
  activeSection: ParticipantSectionId;
};

export const useParticipantDashboardPage = ({
  activeSection,
}: UseParticipantDashboardPageParams) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const dashboard = useParticipantStore((state) => state.dashboard);
  const loading = useParticipantStore((state) => state.loading);
  const error = useParticipantStore((state) => state.error);
  const exploreEvents = useParticipantStore((state) => state.exploreEvents);
  const loadDashboard = useParticipantStore((state) => state.loadDashboard);
  const loadExploreEvents = useParticipantStore((state) => state.loadExploreEvents);
  const clearError = useParticipantStore((state) => state.clearError);
  const clearFlowState = useParticipantStore((state) => state.clearFlowState);

  const effectiveUserId = user?.id ?? dashboard?.profile.userId ?? "";

  useEffect(() => {
    void loadDashboard(user?.id);
  }, [loadDashboard, user?.id]);

  useEffect(() => {
    const sectionNeedsEvents = activeSection === "eventos" || activeSection === "resultados";
    if (!sectionNeedsEvents || exploreEvents.length > 0) {
      return;
    }

    void loadExploreEvents();
  }, [activeSection, exploreEvents.length, loadExploreEvents]);

  const sidebarItems = useMemo(
    () =>
      (dashboard?.sidebarItems ?? []).map((item) => ({
        ...item,
        active: item.id === activeSection,
      })),
    [activeSection, dashboard?.sidebarItems],
  );

  const handleSelectSection = useCallback(
    (sectionId: ParticipantSectionId) => {
      clearFlowState();
      router.push(participantSectionRouteById[sectionId]);
    },
    [clearFlowState, router],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  return {
    userId: user?.id,
    dashboard,
    loading,
    error,
    clearError,
    clearFlowState,
    activeSection,
    effectiveUserId,
    sidebarItems,
    loadDashboard,
    handleSelectSection,
    handleLogout,
  };
};
