import { create } from "zustand";
import { judgeService } from "@/application/judge/judge.service";
import type { JudgeDashboardData } from "@/domain/judge/judge.types";

type JudgeStoreState = {
  dashboard: JudgeDashboardData | null;
  loading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
  startReview: (modelId: string) => Promise<void>;
  completeReview: (modelId: string) => Promise<void>;
  clearError: () => void;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado en el panel de juez.";
};

const reloadDashboard = async (set: (partial: Partial<JudgeStoreState>) => void) => {
  const dashboard = await judgeService.getDashboardData();
  set({
    dashboard,
    loading: false,
    error: null,
  });
};

const executeMutation = async (
  set: (partial: Partial<JudgeStoreState>) => void,
  mutation: () => Promise<void>,
) => {
  set({ loading: true, error: null });

  try {
    await mutation();
    await reloadDashboard(set);
  } catch (error) {
    set({
      loading: false,
      error: getErrorMessage(error),
    });
  }
};

export const useJudgeStore = create<JudgeStoreState>((set) => ({
  dashboard: null,
  loading: false,
  error: null,
  loadDashboard: async () => {
    set({ loading: true, error: null });

    try {
      await reloadDashboard(set);
    } catch (error) {
      set({
        loading: false,
        error: getErrorMessage(error),
      });
    }
  },
  startReview: async (modelId) => {
    await executeMutation(set, async () => {
      await judgeService.startReview(modelId);
    });
  },
  completeReview: async (modelId) => {
    await executeMutation(set, async () => {
      await judgeService.completeReview(modelId);
    });
  },
  clearError: () => set({ error: null }),
}));
