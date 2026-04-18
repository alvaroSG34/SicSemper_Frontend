import { useEffect, useMemo } from "react";
import { useJudgeQueueSlice } from "@/presentation/stores/judge-queue.slice";

type UseJudgeQueueOptions = {
  eventId?: string;
  categoryId?: string;
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
    const expectedEventId = options?.eventId;
    const expectedCategoryId = options?.categoryId;
    const scopeMismatch =
      modelFilters.eventId !== expectedEventId ||
      modelFilters.categoryId !== expectedCategoryId;

    if ((!models && !modelsLoading && !modelsError) || scopeMismatch) {
      void loadModels({
        page: 1,
        eventId: expectedEventId,
        categoryId: expectedCategoryId,
      });
    }
  }, [
    modelFilters.categoryId,
    modelFilters.eventId,
    models,
    modelsLoading,
    modelsError,
    loadModels,
    options?.eventId,
    options?.categoryId,
  ]);

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
