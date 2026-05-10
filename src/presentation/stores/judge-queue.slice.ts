import type { JudgeReviewCriteria } from "@/domain/judge/judge.types";
import { useJudgeStore } from "./judge.store";

export const useJudgeQueueSlice = () => {
  const loading = useJudgeStore((state) => state.loading);
  const dashboard = useJudgeStore((state) => state.dashboard);
  const modelFilters = useJudgeStore((state) => state.modelFilters);
  const models = useJudgeStore((state) => state.models);
  const modelsLoading = useJudgeStore((state) => state.modelsLoading);
  const modelsError = useJudgeStore((state) => state.modelsError);
  const selectedModelId = useJudgeStore((state) => state.selectedModelId);
  const modelDetail = useJudgeStore((state) => state.modelDetail);
  const detailLoading = useJudgeStore((state) => state.detailLoading);
  const detailError = useJudgeStore((state) => state.detailError);
  const loadModels = useJudgeStore((state) => state.loadModels);
  const selectModel = useJudgeStore((state) => state.selectModel);
  const startReview = useJudgeStore((state) => state.startReview);
  const saveDraft = useJudgeStore((state) => state.saveDraft);
  const submitReview = useJudgeStore((state) => state.submitReview);

  return {
    loading,
    summary: dashboard?.summary ?? null,
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
    saveDraft: (modelId: string, payload: { criteria?: JudgeReviewCriteria; generalComment?: string }) =>
      saveDraft(modelId, payload),
    submitReview: (
      modelId: string,
      payload: {
        criteria: Record<"armado" | "pintura" | "detallesAgregados", number>;
        generalComment?: string;
      },
    ) => submitReview(modelId, payload),
  };
};
