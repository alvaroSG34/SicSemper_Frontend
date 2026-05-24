"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useParticipantShowcaseScales } from "./use-participant-showcase-scales";

type ParticipantShowcaseScaleSelectionSectionProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
};

export function ParticipantShowcaseScaleSelectionSection({
  eventId,
  level1Id,
  finalCategoryId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
}: ParticipantShowcaseScaleSelectionSectionProps) {
  const { scales, loading, error } = useParticipantShowcaseScales({
    eventId,
    finalCategoryId,
  });

  const backHref =
    level2Name && level2Id
      ? `/participante/participantes/${eventId}/nivel-3/${level1Id}/${level2Id}?l1=${encodeURIComponent(level1Name)}&l2=${encodeURIComponent(level2Name)}`
      : `/participante/participantes/${eventId}/nivel-2/${level1Id}?l1=${encodeURIComponent(level1Name)}`;

  return (
    <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
      <p className="text-sm text-[#A7A7A7]">
        {level1Name}
        {level2Name ? ` / ${level2Name}` : ""}
      </p>
      <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
        {finalCategoryName}
      </h2>
      <p className="mt-2 text-sm text-[#9B9B9B]">
        Selecciona una escala para ver el podio y ranking de esta subcategoria.
      </p>

      {loading ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          Cargando escalas...
        </p>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">
          {error}
        </p>
      ) : null}

      {!loading && !error && scales.length === 0 ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          No hay escalas disponibles para esta subcategoria final.
        </p>
      ) : null}

      {!loading && !error && scales.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {scales.map((scale) => {
            const query = new URLSearchParams({
              l1: level1Name,
              final: finalCategoryName,
              scale: scale.value,
            });
            if (level2Name) {
              query.set("l2", level2Name);
            }
            if (level2Id) {
              query.set("l2id", level2Id);
            }

            return (
              <Link
                key={scale.id}
                href={`/participante/participantes/${eventId}/maquetas/${level1Id}/${finalCategoryId}/escala/${scale.id}?${query.toString()}`}
                className="group rounded-2xl border border-[#2D2D2D] bg-[#151515] p-5 transition hover:border-[#5B68F1]/70"
              >
                <p className="text-xs font-semibold tracking-[1.6px] text-[#8BA3FF]">
                  ESCALA
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">{scale.value}</h3>
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8BA3FF]">
                  Ver maquetas
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            );
          })}
        </div>
      ) : null}

      <div className="mt-6">
        <Link
          href={backHref}
          className="inline-flex h-9 items-center justify-center rounded-[18px] border border-[#303030] px-4 text-xs font-semibold text-[#D7D7D7]"
        >
          Volver
        </Link>
      </div>
    </section>
  );
}
