import { create } from "zustand";
import { judgeService } from "@/application/judge/judge.service";
import type {
  JudgeCategoryNavigationItem,
  JudgeDashboardData,
  JudgeModelDetail,
  JudgeModelListResponse,
  JudgeReviewMutationResult,
  JudgeSaveDraftPayload,
  JudgeSubmitReviewPayload,
} from "@/domain/judge/judge.types";

type JudgeModelFilters = {
  status?: "ENVIADA" | "EN_REVISION" | "CALIFICADA";
  eventId?: string;
  categoryId?: string;
  priority?: "Alta" | "Media" | "Baja";
  search?: string;
  page: number;
  pageSize: number;
};

type JudgeStoreState = {
  dashboard: JudgeDashboardData | null;
  loading: boolean;
  error: string | null;
  modelFilters: JudgeModelFilters;
  models: JudgeModelListResponse | null;
  modelsLoading: boolean;
  modelsError: string | null;
  selectedModelId: string | null;
  modelDetail: JudgeModelDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  loadDashboard: () => Promise<void>;
  loadModels: (filters?: Partial<JudgeModelFilters>) => Promise<void>;
  selectModel: (modelId: string | null) => Promise<void>;
  startReview: (modelId: string) => Promise<void>;
  saveDraft: (modelId: string, payload: JudgeSaveDraftPayload) => Promise<JudgeReviewMutationResult | null>;
  submitReview: (
    modelId: string,
    payload: JudgeSubmitReviewPayload,
  ) => Promise<JudgeReviewMutationResult | null>;
  listEventRootCategories: (eventId: string) => Promise<JudgeCategoryNavigationItem[]>;
  listEventCategoryChildren: (
    eventId: string,
    categoryId: string,
  ) => Promise<JudgeCategoryNavigationItem[]>;
  clearError: () => void;
  clearModelsError: () => void;
  clearDetailError: () => void;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado en el panel de juez.";
};

const defaultModelFilters: JudgeModelFilters = {
  page: 1,
  pageSize: 12,
};

const refreshRelatedData = async (
  get: () => JudgeStoreState,
  set: (partial: Partial<JudgeStoreState>) => void,
  options?: { reloadDashboard?: boolean; reloadModels?: boolean; reloadDetail?: boolean },
) => {
  const shouldReloadDashboard = options?.reloadDashboard ?? true;
  const shouldReloadModels = options?.reloadModels ?? true;
  const shouldReloadDetail = options?.reloadDetail ?? true;

  if (shouldReloadDashboard) {
    const dashboard = await judgeService.getDashboardData();
    set({ dashboard, loading: false, error: null });
  }

  if (shouldReloadModels) {
    const filters = get().modelFilters;
    const models = await judgeService.listModels(filters);
    set({ models, modelsLoading: false, modelsError: null });
  }

  if (shouldReloadDetail) {
    const selectedModelId = get().selectedModelId;
    if (selectedModelId) {
      const modelDetail = await judgeService.getModelDetail(selectedModelId);
      set({ modelDetail, detailLoading: false, detailError: null });
    }
  }
};

export const useJudgeStore = create<JudgeStoreState>((set, get) => ({
  dashboard: null,
  loading: false,
  error: null,
  modelFilters: defaultModelFilters,
  models: null,
  modelsLoading: false,
  modelsError: null,
  selectedModelId: null,
  modelDetail: null,
  detailLoading: false,
  detailError: null,
  loadDashboard: async () => {
    set({ loading: true, error: null });

    try {
      const dashboard = await judgeService.getDashboardData();
      set({
        dashboard,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error: getErrorMessage(error),
      });
    }
  },
  loadModels: async (filters) => {
    const nextFilters = {
      ...get().modelFilters,
      ...(filters ?? {}),
    };

    set({
      modelsLoading: true,
      modelsError: null,
      modelFilters: nextFilters,
    });

    try {
      const models = await judgeService.listModels(nextFilters);
      const selectedModelId = get().selectedModelId;
      const firstModelId = models.items[0]?.id ?? null;
      const nextSelectedModelId = selectedModelId ?? firstModelId;

      set({
        models,
        modelsLoading: false,
        modelsError: null,
        selectedModelId: nextSelectedModelId,
      });

      if (nextSelectedModelId) {
        set({ detailLoading: true, detailError: null });
        try {
          const modelDetail = await judgeService.getModelDetail(nextSelectedModelId);
          set({
            modelDetail,
            detailLoading: false,
            detailError: null,
          });
        } catch (error) {
          set({
            detailLoading: false,
            detailError: getErrorMessage(error),
          });
        }
      } else {
        set({
          modelDetail: null,
          detailLoading: false,
          detailError: null,
        });
      }
    } catch (error) {
      set({
        modelsLoading: false,
        modelsError: getErrorMessage(error),
      });
    }
  },
  selectModel: async (modelId) => {
    set({
      selectedModelId: modelId,
      modelDetail: null,
      detailLoading: Boolean(modelId),
      detailError: null,
    });

    if (!modelId) {
      return;
    }

    try {
      const modelDetail = await judgeService.getModelDetail(modelId);
      set({
        modelDetail,
        detailLoading: false,
        detailError: null,
      });
    } catch (error) {
      set({
        detailLoading: false,
        detailError: getErrorMessage(error),
      });
    }
  },
  startReview: async (modelId) => {
    set({ detailLoading: true, detailError: null, modelsLoading: true, loading: true, error: null });

    try {
      await judgeService.startReview(modelId);
      await refreshRelatedData(get, set);
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        loading: false,
        error: message,
        modelsLoading: false,
        modelsError: message,
        detailLoading: false,
        detailError: message,
      });
    }
  },
  saveDraft: async (modelId, payload) => {
    set({ detailLoading: true, detailError: null, error: null });

    try {
      const result = await judgeService.saveDraft(modelId, payload);
      await refreshRelatedData(get, set, { reloadDashboard: true, reloadModels: true, reloadDetail: true });
      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        detailLoading: false,
        detailError: message,
        error: message,
      });
      return null;
    }
  },
  submitReview: async (modelId, payload) => {
    set({ detailLoading: true, detailError: null, modelsLoading: true, loading: true, error: null });

    try {
      const result = await judgeService.submitReview(modelId, payload);
      await refreshRelatedData(get, set);
      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        loading: false,
        error: message,
        modelsLoading: false,
        modelsError: message,
        detailLoading: false,
        detailError: message,
      });
      return null;
    }
  },
  listEventRootCategories: async (eventId) => judgeService.listEventRootCategories(eventId),
  listEventCategoryChildren: async (eventId, categoryId) =>
    judgeService.listEventCategoryChildren(eventId, categoryId),
  clearError: () => set({ error: null }),
  clearModelsError: () => set({ modelsError: null }),
  clearDetailError: () => set({ detailError: null }),
}));

