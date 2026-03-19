import type { JudgeQueueItem, JudgeSummary } from "@/domain/judge/judge.types";
import { useJudgeStore } from "./judge.store";

export type JudgeQueueSlice = {
  loading: boolean;
  pendingQueue: JudgeQueueItem[];
  summary: JudgeSummary | null;
  startReview: (modelId: string) => Promise<void>;
  completeReview: (modelId: string) => Promise<void>;
};

export const useJudgeQueueSlice = (): JudgeQueueSlice => {
  const loading = useJudgeStore((state) => state.loading);
  const dashboard = useJudgeStore((state) => state.dashboard);
  const startReview = useJudgeStore((state) => state.startReview);
  const completeReview = useJudgeStore((state) => state.completeReview);

  return {
    loading,
    pendingQueue: dashboard?.pendingQueue ?? [],
    summary: dashboard?.summary ?? null,
    startReview,
    completeReview,
  };
};
