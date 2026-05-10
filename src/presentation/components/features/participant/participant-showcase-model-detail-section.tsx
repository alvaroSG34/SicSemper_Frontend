"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, FileText } from "lucide-react";
import type { ParticipantShowcaseDetailMediaItem } from "@/domain/participant/participant.types";
import { ImageWithSkeleton } from "@/presentation/components/ui";
import { useParticipantShowcaseModelDetail } from "./use-participant-showcase-model-detail";

type ParticipantShowcaseModelDetailSectionProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  modelId: string;
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

const scoreFormatter = (score: number | null) => {
  if (typeof score !== "number") {
    return "--";
  }

  return Number.isInteger(score) ? String(score) : score.toFixed(1);
};

const modelStatusLabel: Record<string, string> = {
  ENVIADA: "Enviada",
  EN_REVISION: "En revision",
  CALIFICADA: "Calificada",
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "Sin fecha";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Sin fecha";
  }

  return dateFormatter.format(parsed).replace(".", "");
};

const getOwnerInitial = (name: string) => {
  const value = name.trim();
  return value ? value.charAt(0).toUpperCase() : "?";
};

export function ParticipantShowcaseModelDetailSection({
  eventId,
  level1Id,
  finalCategoryId,
  modelId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
}: ParticipantShowcaseModelDetailSectionProps) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const { detail, loading, error } = useParticipantShowcaseModelDetail({
    eventId,
    finalCategoryId,
    modelId,
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

    return `/participante/participantes/${eventId}/maquetas/${level1Id}/${finalCategoryId}?${query.toString()}`;
  }, [
    eventId,
    finalCategoryId,
    finalCategoryName,
    level1Id,
    level1Name,
    level2Id,
    level2Name,
  ]);

  const selectedImage: ParticipantShowcaseDetailMediaItem | null = useMemo(() => {
    if (!detail || detail.media.images.length === 0) {
      return null;
    }

    if (!selectedImageId) {
      return detail.media.images[0];
    }

    return (
      detail.media.images.find((image) => image.id === selectedImageId) ??
      detail.media.images[0]
    );
  }, [detail, selectedImageId]);

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

  return (
    <section className="rounded-3xl border border-[#1E1E1E] bg-[#101010] p-5 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#8E8E8E]">
          Explorar Maquetas
          <span className="mx-2 text-[#5A5A5A]">{">"}</span>
          <span className="text-[#E4E4E4]">{detail.model.nombreModelo}</span>
        </p>
        <Link
          href={backHref}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[#2F2F2F] px-4 text-sm font-semibold text-[#D8D8D8]"
        >
          Volver
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <header>
            <h2 className="text-4xl font-bold text-white">{detail.model.nombreModelo}</h2>
            <div className="mt-3 flex items-center gap-3 text-[#CFCFCF]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#4A57E2] text-lg font-semibold text-white">
                {getOwnerInitial(detail.owner.name)}
              </span>
              <div className="space-y-0.5">
                <p className="text-2xl font-medium text-[#E8E8E8]">{detail.owner.name}</p>
                <p className="text-sm text-[#9C9C9C]">{detail.owner.clubName ?? "Sin club"}</p>
              </div>
            </div>
          </header>

          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl border border-[#272727] bg-[#151515]">
              {selectedImage?.publicUrl ? (
                <ImageWithSkeleton
                  src={selectedImage.publicUrl}
                  alt={selectedImage.fileName}
                  width={1280}
                  height={720}
                  sizes="(min-width: 1280px) 60vw, 100vw"
                  className="h-[240px] w-full object-cover sm:h-[360px] lg:h-[520px]"
                  unoptimized
                />
              ) : (
                <div className="flex h-[240px] w-full items-center justify-center bg-gradient-to-br from-[#202B53] via-[#1B1B2A] to-[#2A1A2E] sm:h-[360px] lg:h-[520px]">
                  <span className="text-xs uppercase tracking-[1.2px] text-[#A9AEDB]">
                    Sin imagen
                  </span>
                </div>
              )}
            </div>

            {detail.media.images.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {detail.media.images.map((image) => {
                  const isActive = image.id === selectedImage?.id;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageId(image.id)}
                      className={`overflow-hidden rounded-xl border ${
                        isActive
                          ? "border-[#5B68F1]"
                          : "border-[#2E2E2E] hover:border-[#4D4D4D]"
                      }`}
                    >
                      {image.publicUrl ? (
                        <ImageWithSkeleton
                          src={image.publicUrl}
                          alt={image.fileName}
                          width={160}
                          height={96}
                          sizes="160px"
                          className="h-20 w-32 object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-20 w-32 items-center justify-center bg-[#1A1A1A] text-xs text-[#8B8B8B]">
                          Sin imagen
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[2px] text-[#5C6CFF]">DESCRIPCION</p>
            <p className="rounded-2xl border border-[#252525] bg-[#151515] p-4 text-sm leading-6 text-[#D1D1D1]">
              {detail.model.descripcion?.trim() || "Sin descripcion registrada."}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[2px] text-[#5C6CFF]">
              DOCUMENTOS ADJUNTOS
            </p>
            {detail.media.documents.length === 0 ? (
              <p className="rounded-2xl border border-[#252525] bg-[#151515] p-4 text-sm text-[#A0A0A0]">
                Esta maqueta no tiene documentos adjuntos.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {detail.media.documents.map((document) => (
                  document.publicUrl ? (
                    <a
                      key={document.id}
                      href={document.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#2F2F2F] bg-[#171717] px-4 py-2.5 text-sm text-[#D9D9D9] hover:border-[#4A4A4A]"
                    >
                      <FileText className="h-4 w-4 text-[#D05353]" />
                      {document.fileName}
                    </a>
                  ) : (
                    <span
                      key={document.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#2F2F2F] bg-[#171717] px-4 py-2.5 text-sm text-[#777777]"
                    >
                      <FileText className="h-4 w-4 text-[#555555]" />
                      {document.fileName}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-3xl border border-[#252525] bg-[#151515] p-6">
          <section className="space-y-3">
            <p className="text-xs font-semibold tracking-[2px] text-[#5C6CFF]">
              INFORMACION GENERAL
            </p>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <span className="text-[#8E8E8E]">Categoria</span>
              <span className="text-right text-[#E7E7E7]">{detail.context.categoryLabel}</span>
              <span className="text-[#8E8E8E]">Codigo</span>
              <span className="text-right text-[#E7E7E7]">{detail.model.codigo}</span>
              <span className="text-[#8E8E8E]">Marca</span>
              <span className="text-right text-[#E7E7E7]">
                {detail.model.marca || "Sin marca"}
              </span>
              <span className="text-[#8E8E8E]">Evento</span>
              <span className="text-right text-[#E7E7E7]">{detail.context.eventName}</span>
              <span className="text-[#8E8E8E]">Escala</span>
              <span className="text-right text-[#E7E7E7]">{detail.context.scaleValue}</span>
              <span className="text-[#8E8E8E]">Estado</span>
              <span className="text-right text-[#E7E7E7]">
                {modelStatusLabel[detail.model.status] ?? detail.model.status}
              </span>
              <span className="text-[#8E8E8E]">Fecha</span>
              <span className="inline-flex items-center justify-end gap-1 text-right text-[#E7E7E7]">
                <CalendarDays className="h-3.5 w-3.5 text-[#9CA8D7]" />
                {formatDate(detail.model.createdAt)}
              </span>
            </div>
          </section>

          <hr className="my-6 border-[#262626]" />

          <section>
            <p className="text-xs font-semibold tracking-[2px] text-[#5C6CFF]">PROMEDIO FINAL</p>
            <div className="mt-3 rounded-2xl border border-[#2D2D2D] bg-[#171717] px-4 py-6 text-center">
              <p className="text-6xl font-bold text-white">
                {scoreFormatter(detail.scoring.finalScore)}
              </p>
              <p className="mt-1 text-sm text-[#9C9C9C]">de 100 puntos</p>
            </div>
          </section>

          <hr className="my-6 border-[#262626]" />

          <section className="space-y-3">
            <p className="text-xs font-semibold tracking-[2px] text-[#5C6CFF]">
              DESGLOSE POR JUEZ
            </p>
            {detail.scoring.judgeBreakdown.length === 0 ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#171717] px-3 py-2 text-sm text-[#A0A0A0]">
                No hay evaluaciones enviadas.
              </p>
            ) : (
              detail.scoring.judgeBreakdown.map((entry, index) => (
                <article
                  key={`${entry.judgeName}-${index}`}
                  className="space-y-2 rounded-xl border border-[#2A2A2A] bg-[#171717] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[#F2F2F2]">{entry.judgeName}</p>
                      {entry.criteria ? (
                        <p className="mt-1 text-sm text-[#A8A8A8]">
                          Armado: {entry.criteria.armado ?? 0} | Pintura:{" "}
                          {entry.criteria.pintura ?? 0} | Agregados:{" "}
                          {entry.criteria.detallesAgregados ?? 0}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-[#8D8D8D]">Sin criterios cargados</p>
                      )}
                    </div>
                    <p className="whitespace-nowrap text-xl font-semibold text-[#E8E8E8]">
                      {typeof entry.totalScore === "number"
                        ? `${scoreFormatter(entry.totalScore)} pts`
                        : "Sin puntaje"}
                    </p>
                  </div>
                  {entry.generalComment ? (
                    <p className="text-sm leading-6 text-[#C9C9C9]">{entry.generalComment}</p>
                  ) : null}
                </article>
              ))
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
