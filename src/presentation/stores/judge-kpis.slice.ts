import type { JudgeKpis } from "@/domain/judge/judge.types";
import { useJudgeStore } from "./judge.store";

export type JudgeKpisSlice = {
  kpis: JudgeKpis | null;
};

export const useJudgeKpisSlice = (): JudgeKpisSlice => {
  const dashboard = useJudgeStore((state) => state.dashboard);

  return {
    kpis: dashboard?.kpis ?? null,
  };
};
