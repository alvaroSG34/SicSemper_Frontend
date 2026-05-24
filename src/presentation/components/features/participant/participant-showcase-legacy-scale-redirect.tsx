"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParticipantShowcaseScales } from "./use-participant-showcase-scales";

type ParticipantShowcaseLegacyScaleRedirectProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
};

export function ParticipantShowcaseLegacyScaleRedirect({
  eventId,
  level1Id,
  finalCategoryId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
}: ParticipantShowcaseLegacyScaleRedirectProps) {
  const router = useRouter();
  const { scales, loading, error } = useParticipantShowcaseScales({
    eventId,
    finalCategoryId,
  });

  useEffect(() => {
    if (loading || error) {
      return;
    }

    if (scales.length === 0) {
      router.replace(
        `/participante/participantes/${eventId}/maquetas/${level1Id}/${finalCategoryId}/escalas?l1=${encodeURIComponent(level1Name)}&final=${encodeURIComponent(finalCategoryName)}${level2Name ? `&l2=${encodeURIComponent(level2Name)}` : ""}${level2Id ? `&l2id=${encodeURIComponent(level2Id)}` : ""}`,
      );
      return;
    }

    const preferredScale = scales[0];
    const query = new URLSearchParams({
      l1: level1Name,
      final: finalCategoryName,
      scale: preferredScale.value,
    });

    if (level2Name) {
      query.set("l2", level2Name);
    }
    if (level2Id) {
      query.set("l2id", level2Id);
    }

    router.replace(
      `/participante/participantes/${eventId}/maquetas/${level1Id}/${finalCategoryId}/escala/${preferredScale.id}?${query.toString()}`,
    );
  }, [
    eventId,
    finalCategoryId,
    finalCategoryName,
    level1Id,
    level1Name,
    level2Id,
    level2Name,
    loading,
    scales,
    error,
    router,
  ]);

  return (
    <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-6 text-sm text-[#BBBBBB]">
      {error ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">
            {error}
          </p>
          <Link
            href={`/participante/participantes/${eventId}/maquetas/${level1Id}/${finalCategoryId}/escalas?l1=${encodeURIComponent(level1Name)}&final=${encodeURIComponent(finalCategoryName)}${level2Name ? `&l2=${encodeURIComponent(level2Name)}` : ""}${level2Id ? `&l2id=${encodeURIComponent(level2Id)}` : ""}`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#2F2F2F] px-4 text-sm font-semibold text-[#D8D8D8]"
          >
            Ir a seleccionar escala
          </Link>
        </div>
      ) : loading ? (
        "Redirigiendo al ranking por escala..."
      ) : null}
    </section>
  );
}
