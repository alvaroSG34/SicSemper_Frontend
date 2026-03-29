import { useEffect, useMemo } from "react";
import { useJudgeQueueSlice } from "@/presentation/stores/judge-queue.slice";

type UseJudgeQueueOptions = {
  eventId?: string;
};

export const useJudgeQueue = (options?: UseJudgeQueueOptions) => {
  const {
    loading,
    summary,
    modelFilters,
    models,
    modelsLoading,
    modelsError,
    selectedModelId,
    modelDetail,
    detailLoading,
    detailError,
    loadModels,
    selectModel,
    startReview,
    saveDraft,
    submitReview,
  } = useJudgeQueueSlice();

  useEffect(() => {
    if (!models && !modelsLoading && !modelsError) {
      void loadModels({
        page: 1,
        eventId: options?.eventId,
      });
    }
  }, [models, modelsLoading, modelsError, loadModels, options?.eventId]);

  const queueHeadline = useMemo(() => {
    if (modelsLoading) {
      return "Cargando asignaciones...";
    }

    return `${models?.total ?? 0} maquetas asignadas`;
  }, [models?.total, modelsLoading]);

  return {
    loading,
    summary,
    modelFilters,
    models,
    modelsLoading,
    modelsError,
    selectedModelId,
    modelDetail,
    detailLoading,
    detailError,
    queueHeadline,
    loadModels,
    selectModel,
    startReview,
    saveDraft,
    submitReview,
  };
};
