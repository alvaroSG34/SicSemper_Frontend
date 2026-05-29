"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminService } from "@/application/admin/admin.service";
import type {
  AdminEventControlSummary,
  AdminEventModelDetail,
  AdminEventModelRow,
  AdminPodiumTieBreakState,
  AdminEventParticipantDetail,
  AdminEventParticipantRow,
  EventControlModelSortOption,
} from "@/domain/admin/admin.types";
import { useAdminStore } from "@/presentation/stores";

const DEFAULT_PAGE_SIZE = 20;

type ParticipantsFilterState = {
  search: string;
  userStatus: "" | "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
  registrationStatus: "" | "ACTIVA" | "PENDIENTE" | "CANCELADA";
  verified: "" | "true" | "false";
};

type ModelsFilterState = {
  search: string;
  status: "" | "ENVIADA" | "EN_REVISION" | "CALIFICADA";
  sort: EventControlModelSortOption;
};

export const useAdminEventControl = ({
  eventId,
  canManageUsers,
  canManagePodiumTieBreak,
}: {
  eventId: string;
  canManageUsers: boolean;
  canManagePodiumTieBreak: boolean;
}) => {
  const banParticipant = useAdminStore((state) => state.banParticipant);
  const unbanParticipant = useAdminStore((state) => state.unbanParticipant);
  const setParticipantVerified = useAdminStore((state) => state.setParticipantVerified);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const [summary, setSummary] = useState<AdminEventControlSummary | null>(null);

  const [participants, setParticipants] = useState<AdminEventParticipantRow[]>([]);
  const [participantsPage, setParticipantsPage] = useState(1);
  const [participantsPageSize, setParticipantsPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [participantsTotal, setParticipantsTotal] = useState(0);
  const [participantsTotalPages, setParticipantsTotalPages] = useState(1);
  const [participantsFilters, setParticipantsFilters] = useState<ParticipantsFilterState>({
    search: "",
    userStatus: "",
    registrationStatus: "",
    verified: "",
  });
  const [selectedParticipantDetail, setSelectedParticipantDetail] =
    useState<AdminEventParticipantDetail | null>(null);

  const [models, setModels] = useState<AdminEventModelRow[]>([]);
  const [modelsPage, setModelsPage] = useState(1);
  const [modelsPageSize, setModelsPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [modelsTotal, setModelsTotal] = useState(0);
  const [modelsTotalPages, setModelsTotalPages] = useState(1);
  const [modelsFilters, setModelsFilters] = useState<ModelsFilterState>({
    search: "",
    status: "",
    sort: "SCORE_DESC",
  });
  const [selectedModelDetail, setSelectedModelDetail] = useState<AdminEventModelDetail | null>(
    null,
  );
  const [selectedTieBreakContext, setSelectedTieBreakContext] = useState<{
    finalCategoryId: string;
    scaleId: string;
  } | null>(null);
  const [podiumTieBreakState, setPodiumTieBreakState] = useState<AdminPodiumTieBreakState | null>(
    null,
  );
  const [podiumTieBreakOrder, setPodiumTieBreakOrder] = useState<string[]>([]);
  const [loadingTieBreak, setLoadingTieBreak] = useState(false);

  const loadSummary = useCallback(async () => {
    const nextSummary = await adminService.getEventControlSummary(eventId);
    setSummary(nextSummary);
  }, [eventId]);

  const loadParticipants = useCallback(async () => {
    const response = await adminService.listEventControlParticipants({
      eventId,
      page: participantsPage,
      pageSize: participantsPageSize,
      search: participantsFilters.search.trim() || undefined,
      userStatus: participantsFilters.userStatus || undefined,
      registrationStatus: participantsFilters.registrationStatus || undefined,
      verified:
        participantsFilters.verified === ""
          ? undefined
          : participantsFilters.verified === "true",
    });
    setParticipants(response.items);
    setParticipantsTotal(response.total);
    setParticipantsTotalPages(response.totalPages);
  }, [eventId, participantsFilters, participantsPage, participantsPageSize]);

  const loadModels = useCallback(async () => {
    const response = await adminService.listEventControlModels({
      eventId,
      page: modelsPage,
      pageSize: modelsPageSize,
      search: modelsFilters.search.trim() || undefined,
      status: modelsFilters.status || undefined,
      sort: modelsFilters.sort,
    });
    setModels(response.items);
    setModelsTotal(response.total);
    setModelsTotalPages(response.totalPages);
  }, [eventId, modelsFilters, modelsPage, modelsPageSize]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadSummary(), loadParticipants(), loadModels()]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudo cargar el centro de control.");
    } finally {
      setLoading(false);
    }
  }, [loadModels, loadParticipants, loadSummary]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (loading) {
      return;
    }
    void loadParticipants().catch((nextError) => {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "No se pudo cargar la lista de participantes del evento.",
      );
    });
  }, [loadParticipants, loading]);

  useEffect(() => {
    if (loading) {
      return;
    }
    void loadModels().catch((nextError) => {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "No se pudo cargar la lista de maquetas del evento.",
      );
    });
  }, [loadModels, loading]);

  const refreshParticipantsAndSummary = useCallback(async () => {
    await Promise.all([loadParticipants(), loadSummary()]);
  }, [loadParticipants, loadSummary]);

  const openParticipantDetail = useCallback(
    async (userId: string) => {
      setPendingAction(`participant:detail:${userId}`);
      setError(null);
      try {
        const detail = await adminService.getEventControlParticipantDetail(eventId, userId);
        setSelectedParticipantDetail(detail);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "No se pudo cargar el detalle del participante.");
      } finally {
        setPendingAction(null);
      }
    },
    [eventId],
  );

  const openModelDetail = useCallback(
    async (modelId: string) => {
      setPendingAction(`model:detail:${modelId}`);
      setError(null);
      try {
        const detail = await adminService.getEventControlModelDetail(eventId, modelId);
        setSelectedModelDetail(detail);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "No se pudo cargar el detalle de la maqueta.");
      } finally {
        setPendingAction(null);
      }
    },
    [eventId],
  );

  const loadPodiumTieBreakState = useCallback(
    async (context: { finalCategoryId: string; scaleId: string }) => {
      setLoadingTieBreak(true);
      setError(null);
      try {
        const state = await adminService.getEventPodiumTieBreakCandidates({
          eventId,
          finalCategoryId: context.finalCategoryId,
          scaleId: context.scaleId,
        });
        setPodiumTieBreakState(state);
        const defaultOrder =
          state.manualDecision?.orderedModelIds.length
            ? state.manualDecision.orderedModelIds
            : state.candidates.map((entry) => entry.modelId);
        setPodiumTieBreakOrder(defaultOrder);
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "No se pudo cargar el desempate de podio.",
        );
      } finally {
        setLoadingTieBreak(false);
      }
    },
    [eventId],
  );

  const selectTieBreakContext = useCallback(
    async (context: { finalCategoryId: string; scaleId: string } | null) => {
      setSelectedTieBreakContext(context);
      if (!context) {
        setPodiumTieBreakState(null);
        setPodiumTieBreakOrder([]);
        return;
      }
      await loadPodiumTieBreakState(context);
    },
    [loadPodiumTieBreakState],
  );

  const moveTieBreakCandidate = useCallback((modelId: string, direction: "up" | "down") => {
    setPodiumTieBreakOrder((current) => {
      const index = current.findIndex((entry) => entry === modelId);
      if (index < 0) {
        return current;
      }
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }
      const next = [...current];
      const [entry] = next.splice(index, 1);
      next.splice(targetIndex, 0, entry);
      return next;
    });
  }, []);

  const savePodiumTieBreak = useCallback(async () => {
    if (!canManagePodiumTieBreak || !selectedTieBreakContext) {
      return;
    }

    setPendingAction("podium-tiebreak:save");
    setError(null);
    try {
      const nextState = await adminService.setEventPodiumTieBreak({
        eventId,
        finalCategoryId: selectedTieBreakContext.finalCategoryId,
        scaleId: selectedTieBreakContext.scaleId,
        orderedModelIds: podiumTieBreakOrder,
      });
      setPodiumTieBreakState(nextState);
      setPodiumTieBreakOrder(
        nextState.manualDecision?.orderedModelIds ?? podiumTieBreakOrder,
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "No se pudo guardar el desempate manual.",
      );
    } finally {
      setPendingAction(null);
    }
  }, [
    canManagePodiumTieBreak,
    eventId,
    podiumTieBreakOrder,
    selectedTieBreakContext,
  ]);

  const clearPodiumTieBreak = useCallback(async () => {
    if (!canManagePodiumTieBreak || !selectedTieBreakContext) {
      return;
    }

    setPendingAction("podium-tiebreak:clear");
    setError(null);
    try {
      const nextState = await adminService.clearEventPodiumTieBreak({
        eventId,
        finalCategoryId: selectedTieBreakContext.finalCategoryId,
        scaleId: selectedTieBreakContext.scaleId,
      });
      setPodiumTieBreakState(nextState);
      setPodiumTieBreakOrder(nextState.candidates.map((entry) => entry.modelId));
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "No se pudo restaurar el ranking automatico.",
      );
    } finally {
      setPendingAction(null);
    }
  }, [canManagePodiumTieBreak, eventId, selectedTieBreakContext]);

  const runUserMutation = useCallback(
    async (actionKey: string, action: () => Promise<void>) => {
      if (!canManageUsers) {
        return;
      }
      setPendingAction(actionKey);
      setError(null);
      try {
        await action();
        await refreshParticipantsAndSummary();
        if (selectedParticipantDetail) {
          const detail = await adminService.getEventControlParticipantDetail(
            eventId,
            selectedParticipantDetail.user.id,
          );
          setSelectedParticipantDetail(detail);
        }
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "No se pudo completar la acción.");
      } finally {
        setPendingAction(null);
      }
    },
    [canManageUsers, eventId, refreshParticipantsAndSummary, selectedParticipantDetail],
  );

  const setParticipantVerifiedFromList = useCallback(
    async (userId: string, verified: boolean) =>
      runUserMutation(`participant:verified:${userId}`, async () => {
        await setParticipantVerified(userId, verified);
      }),
    [runUserMutation, setParticipantVerified],
  );

  const toggleParticipantBanFromList = useCallback(
    async (userId: string, isCurrentlySuspended: boolean) =>
      runUserMutation(`participant:ban:${userId}`, async () => {
        if (isCurrentlySuspended) {
          await unbanParticipant(userId);
          return;
        }
        await banParticipant(userId);
      }),
    [banParticipant, runUserMutation, unbanParticipant],
  );

  const participantSummary = useMemo(
    () => ({
      total: participantsTotal,
      page: participantsPage,
      pageSize: participantsPageSize,
      totalPages: participantsTotalPages,
    }),
    [participantsPage, participantsPageSize, participantsTotal, participantsTotalPages],
  );

  const modelsSummary = useMemo(
    () => ({
      total: modelsTotal,
      page: modelsPage,
      pageSize: modelsPageSize,
      totalPages: modelsTotalPages,
    }),
    [modelsPage, modelsPageSize, modelsTotal, modelsTotalPages],
  );

  return {
    loading,
    error,
    pendingAction,
    summary,
    participants,
    participantsFilters,
    setParticipantsFilters,
    participantsPage,
    setParticipantsPage,
    participantsPageSize,
    setParticipantsPageSize,
    participantSummary,
    selectedParticipantDetail,
    setSelectedParticipantDetail,
    openParticipantDetail,
    setParticipantVerifiedFromList,
    toggleParticipantBanFromList,
    models,
    modelsFilters,
    setModelsFilters,
    modelsPage,
    setModelsPage,
    modelsPageSize,
    setModelsPageSize,
    modelsSummary,
    selectedModelDetail,
    setSelectedModelDetail,
    openModelDetail,
    selectedTieBreakContext,
    selectTieBreakContext,
    podiumTieBreakState,
    podiumTieBreakOrder,
    loadingTieBreak,
    moveTieBreakCandidate,
    savePodiumTieBreak,
    clearPodiumTieBreak,
    refreshAll,
  };
};
