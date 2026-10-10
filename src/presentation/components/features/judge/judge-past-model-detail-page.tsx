"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useJudgeStore } from "@/presentation/stores";
import { JudgeReviewPage } from "./judge-review-page";

export function JudgePastModelDetailPage({ eventId, modelId, podiumMode = false }: { eventId: string; modelId: string; podiumMode?: boolean }) {
  const detail = useJudgeStore((state) => state.modelDetail);
  const detailLoading = useJudgeStore((state) => state.detailLoading);
  const detailError = useJudgeStore((state) => state.detailError);
  const selectModel = useJudgeStore((state) => state.selectModel);

  useEffect(() => {
    void selectModel(modelId, true, podiumMode);
  }, [modelId, podiumMode, selectModel]);

  if (detailLoading && (!detail || detail.id !== modelId)) {
    return <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-5 text-sm text-[#999]">Cargando evaluación histórica...</p>;
  }

  if (detailError || !detail || detail.id !== modelId) {
    return (
      <section className="space-y-4">
        <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 p-5 text-sm text-[#fca5a5]">{detailError ?? "No se pudo cargar la maqueta."}</p>
        <Link href={`/juez/eventos/pasados/${encodeURIComponent(eventId)}`} className="text-sm text-[#AAB2FF]">Volver a eventos pasados</Link>
      </section>
    );
  }

  return (
    <JudgeReviewPage
      modelId={modelId}
      backHref={`/juez/eventos/pasados/${encodeURIComponent(eventId)}`}
      level1Name={detail.category.parentName ?? detail.category.name}
      level2Name={detail.category.parentName ? detail.category.name : null}
      finalCategoryName={detail.category.name}
      forceReadOnly
      historyMode
      podiumMode={podiumMode}
    />
  );
}
