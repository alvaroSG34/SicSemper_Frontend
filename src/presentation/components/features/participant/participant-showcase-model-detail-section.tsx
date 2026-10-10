"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ModelDetailView } from "./model-detail-view";
import { useParticipantShowcaseModelDetail } from "./use-participant-showcase-model-detail";

type ParticipantShowcaseModelDetailSectionProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  scaleId: string;
  modelId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
  scaleLabel: string;
};

export function ParticipantShowcaseModelDetailSection({
  eventId,
  level1Id,
  finalCategoryId,
  scaleId,
  modelId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
  scaleLabel,
}: ParticipantShowcaseModelDetailSectionProps) {
  const searchParams = useSearchParams();
  const segmentType = searchParams.get("type");

  const { detail, loading, error } = useParticipantShowcaseModelDetail({
    eventId,
    finalCategoryId,
    modelId,
    scaleId: segmentType === "group" ? undefined : scaleId,
    groupId: segmentType === "group" ? scaleId : undefined,
  });

  const backHref = useMemo(() => {
    const query = new URLSearchParams({
      l1: level1Name,
      final: finalCategoryName,
    });

    if (level2Name) {
      query.set("l2", level2Name);
    }

    if (level2Id) {
      query.set("l2id", level2Id);
    }
    query.set("scale", scaleLabel);

    return `/participante/participantes/${eventId}/maquetas/${level1Id}/${finalCategoryId}/escala/${scaleId}?${query.toString()}`;
  }, [
    eventId,
    finalCategoryId,
    finalCategoryName,
    level1Id,
    level1Name,
    level2Id,
    level2Name,
    scaleId,
    scaleLabel,
  ]);

  if (loading) {
    return (
      <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-6 text-sm text-[#BBBBBB]">
        Cargando detalle de la maqueta...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-[#8B1D1D] bg-[#451414] p-6 text-sm text-[#FFB4B4]">
        {error}
      </section>
    );
  }

  if (!detail) {
    return (
      <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6 text-sm text-[#9C9C9C]">
        No se encontro la maqueta solicitada.
      </section>
    );
  }

  return <ModelDetailView detail={detail} backHref={backHref} />;
}
