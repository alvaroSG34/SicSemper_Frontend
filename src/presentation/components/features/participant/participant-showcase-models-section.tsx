"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Medal, Search } from "lucide-react";
import type { ParticipantShowcaseSortOption } from "@/domain/participant/participant.types";
import { ImageWithSkeleton } from "@/presentation/components/ui";
import { useParticipantShowcaseModels } from "./use-participant-showcase-models";

type ParticipantShowcaseModelsSectionProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
};

const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const sortOptions: Array<{ value: ParticipantShowcaseSortOption; label: string }> = [
  { value: "SCORE_DESC", label: "Calificacion (mayor a menor)" },
  { value: "SCORE_ASC", label: "Calificacion (menor a mayor)" },
  { value: "DATE_DESC", label: "Mas recientes" },
  { value: "DATE_ASC", label: "Mas antiguas" },
];

const formatScore = (score: number) =>
  Number.isInteger(score) ? String(score) : score.toFixed(1);

const getMedalStyleByRank = (rank: number | null) => {
  if (rank === 1) {
    return {
      label: "1er lugar",
      className:
        "border-[#B58400] bg-gradient-to-br from-[#FFE58A] to-[#F7BA00] text-[#2E2300]",
    };
  }
  if (rank === 2) {
    return {
      label: "2do lugar",
      className:
        "border-[#8E98A7] bg-gradient-to-br from-[#F0F4FA] to-[#BCC6D3] text-[#1F2A3A]",
    };
  }
  if (rank === 3) {
    return {
      label: "3er lugar",
      className:
        "border-[#9E5A33] bg-gradient-to-br from-[#F2C2A0] to-[#C17344] text-[#2F190D]",
    };
  }

  return null;
};

const formatCardDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Sin fecha";
  }

  return dateFormatter.format(parsed).replace(".", "");
};

const getInitial = (name: string) => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return "?";
  }

  return trimmedName[0]?.toUpperCase() ?? "?";
};

export function ParticipantShowcaseModelsSection({
  eventId,
  level1Id,
  finalCategoryId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
}: ParticipantShowcaseModelsSectionProps) {
  const {
    searchInput,
    setSearchInput,
    sort,
    setSort,
    items,
    page,
    total,
    totalPages,
    loadingInitial,
    loadingMore,
    error,
    loadMore,
  } = useParticipantShowcaseModels({
    eventId,
    finalCategoryId,
  });

  const backHref = useMemo(
    () =>
      level2Name && level2Id
        ? `/participante/participantes/${eventId}/nivel-3/${level1Id}/${level2Id}?l1=${encodeURIComponent(level1Name)}&l2=${encodeURIComponent(level2Name)}`
        : finalCategoryId === level1Id
          ? `/participante/participantes/${eventId}/nivel-1`
          : `/participante/participantes/${eventId}/nivel-2/${level1Id}?l1=${encodeURIComponent(level1Name)}`,
    [eventId, finalCategoryId, level1Id, level1Name, level2Id, level2Name],
  );
  const detailQuery = useMemo(() => {
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

    return query.toString();
  }, [finalCategoryName, level1Name, level2Id, level2Name]);

  const hasMore = page < totalPages;

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8">
        <p className="text-sm text-[#8E8E8E]">
          {level1Name}
          <span className="mx-2 text-[#5A5A5A]">{">"}</span>
          {level2Name ? (
            <>
              {level2Name}
              <span className="mx-2 text-[#5A5A5A]">{">"}</span>
            </>
          ) : null}
          <span className="font-semibold text-[#8BA3FF]">{finalCategoryName}</span>
        </p>
        <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Explorar Maquetas</h2>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <label className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#9B9B9B]" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar maqueta, dueno..."
              className="h-10 w-full rounded-xl border border-[#2F2F2F] bg-[#111111] pl-9 pr-3 text-sm text-white outline-none focus:border-[#5B68F1]"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[auto_auto]">
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as ParticipantShowcaseSortOption)
              }
              className="h-10 min-w-[240px] rounded-xl border border-[#2F2F2F] bg-[#111111] px-3 text-sm text-[#D8D8D8] outline-none focus:border-[#5B68F1]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Ordenar por: {option.label}
                </option>
              ))}
            </select>
            <Link
              href={backHref}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#2F2F2F] px-4 text-sm font-semibold text-[#D8D8D8]"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">
          {error}
        </p>
      ) : null}

      {loadingInitial && !error ? (
        <p className="rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          Cargando maquetas...
        </p>
      ) : null}

      {!loadingInitial && !error ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9C9C9C]">{total} resultado(s)</p>
          </div>

          {items.length === 0 ? (
            <p className="rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
              No hay maquetas para el filtro actual.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {items.map((item) => {
                const scoreValue = item.finalScore;
                const hasScore =
                  item.status === "CALIFICADA" && typeof scoreValue === "number";
                const scoreLabel = hasScore
                  ? `${formatScore(scoreValue)} pts`
                  : "Sin calificar";
                const medalStyle = getMedalStyleByRank(item.scoreRankGlobal);
                const detailHref = `/participante/participantes/${eventId}/maquetas/${level1Id}/${finalCategoryId}/detalle/${item.id}?${detailQuery}`;

                return (
                  <Link
                    key={item.id}
                    href={detailHref}
                    className="block overflow-hidden rounded-2xl border border-[#242424] bg-[#111215] transition hover:border-[#3A4FB2]"
                  >
                    <div className="relative h-[190px] overflow-hidden">
                      {item.previewImageUrl ? (
                        <ImageWithSkeleton
                          src={item.previewImageUrl}
                          alt={`Imagen de ${item.nombreModelo}`}
                          width={640}
                          height={360}
                          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#202B53] via-[#1B1B2A] to-[#2A1A2E]">
                          <span className="text-xs uppercase tracking-[1.2px] text-[#A9AEDB]">
                            Sin imagen
                          </span>
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                      {medalStyle ? (
                        <span
                          title={medalStyle.label}
                          aria-label={medalStyle.label}
                          className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-[0_6px_16px_rgba(0,0,0,0.42)] ${medalStyle.className}`}
                        >
                          <Medal className="h-5 w-5" />
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-3 p-4">
                      <h3 className="truncate text-2xl font-semibold text-white">
                        {item.nombreModelo}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[#CFCFCF]">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#4A57E2] font-semibold text-white">
                          {getInitial(item.participantName)}
                        </span>
                        <span className="truncate">{item.participantName}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-md bg-[#262626] px-2 py-1 text-xs text-[#BEBEBE]">
                          {level1Name}
                        </span>
                        <span className="rounded-md bg-[#262626] px-2 py-1 text-xs text-[#BEBEBE]">
                          {finalCategoryName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-sm text-[#7F90B4]">
                          {formatCardDate(item.createdAt)}
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${
                            hasScore
                              ? "border-[#1B4DDB] bg-[#112A7A]/40 text-[#88A9FF]"
                              : "border-[#3A3A3A] bg-[#1B1B1B] text-[#B3B3B3]"
                          }`}
                        >
                          {scoreLabel}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {hasMore ? (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => void loadMore()}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#5B68F1]/60 bg-[#252B4A] px-6 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loadingMore ? "Cargando..." : "Cargar mas"}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
