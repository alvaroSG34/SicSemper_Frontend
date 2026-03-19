import { useMemo } from "react";
import { useJudgeQueueSlice } from "@/presentation/stores/judge-queue.slice";

export const useJudgeQueue = () => {
  const { loading, pendingQueue, summary, startReview, completeReview } = useJudgeQueueSlice();

  const queueHeadline = useMemo(
    () => (loading ? "Cargando asignaciones..." : `${pendingQueue.length} maquetas por revisar`),
    [loading, pendingQueue.length],
  );

  return {
    loading,
    pendingQueue,
    summary,
    startReview,
    completeReview,
    queueHeadline,
  };
};
