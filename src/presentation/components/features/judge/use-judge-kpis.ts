import { useJudgeKpisSlice } from "@/presentation/stores/judge-kpis.slice";

export const useJudgeKpis = () => {
  const { kpis } = useJudgeKpisSlice();

  return {
    pendingCount: kpis?.pendingCount ?? 0,
    reviewedToday: kpis?.reviewedToday ?? 0,
    averageReviewMinutes: kpis?.averageReviewMinutes ?? 0,
  };
};
