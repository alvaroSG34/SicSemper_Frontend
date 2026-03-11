"use client";

import { CalendarDays, MapPin, Sparkles, X } from "lucide-react";
import { Outfit } from "next/font/google";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type {
  ParticipantEventAllowedCategoryGroup,
  ParticipantEventDetail,
} from "@/domain/participant/participant.types";
import { Skeleton } from "@/presentation/components/ui";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
});

const formatDate = (value: string): string => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Por definir";
  }

  return dateFormatter.format(parsedDate);
};

const formatDateRange = (startDate: string, endDate: string): string => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return start === end ? start : `${start} - ${end}`;
};

type ParticipantEventsExplorerProps = {
  events: ParticipantEventDetail[];
  selectedEventId: string | null;
  loading?: boolean;
  categoriesByEventId: Record<string, ParticipantEventAllowedCategoryGroup[]>;
  categoriesLoadingByEventId: Record<string, boolean>;
  categoriesErrorByEventId: Record<string, string | null>;
  onLoadEventCategories: (eventId: string) => Promise<void>;
  onStartUpload: (eventId: string) => Promise<boolean>;
};

export function ParticipantEventsExplorer({
  events,
  selectedEventId,
  loading = false,
  categoriesByEventId,
  categoriesLoadingByEventId,
  categoriesErrorByEventId,
  onLoadEventCategories,
  onStartUpload,
}: ParticipantEventsExplorerProps) {
  const [detailEventId, setDetailEventId] = useState<string | null>(null);
  const [uploadingEventId, setUploadingEventId] = useState<string | null>(null);

  const detailEvent = useMemo(
    () => events.find((event) => event.id === detailEventId) ?? null,
    [detailEventId, events],
  );


  useEffect(() => {
    if (!detailEventId) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetailEventId(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [detailEventId]);

  useEffect(() => {
    if (!detailEventId || categoriesByEventId[detailEventId] || categoriesLoadingByEventId[detailEventId]) {
      return;
    }

    void onLoadEventCategories(detailEventId);
  }, [categoriesByEventId, categoriesLoadingByEventId, detailEventId, onLoadEventCategories]);

  const showSkeleton = loading && events.length === 0;

  const handleStartUpload = async (eventId: string) => {
    if (uploadingEventId) {
      return;
    }

    setUploadingEventId(eventId);
    const wasSelected = await onStartUpload(eventId);
    setUploadingEventId(null);

    if (wasSelected) {
      setDetailEventId(null);
    }
  };

  return (
    <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className={`${outfit.className} text-[22px] font-semibold text-white`}>Eventos proximos</h3>
        <span className="text-xs uppercase tracking-[1.5px] text-[#8D8D8D]">Explorar eventos</span>
      </div>

      {showSkeleton ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`event-card-skeleton-${index}`}
              className="overflow-hidden rounded-2xl border border-[#2D2D2D] bg-[#1A1A1A]"
            >
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-3/4" />
                <div className="pt-1">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!showSkeleton && events.length === 0 ? (
        <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
          No hay eventos proximos disponibles.
        </p>
      ) : null}

      {!showSkeleton ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const isSelected = selectedEventId === event.id;
            const isUploading = uploadingEventId === event.id;
            const imageUrl = event.imageUrl?.trim();

            return (
              <article
                key={event.id}
                role="button"
                tabIndex={0}
                onClick={() => setDetailEventId(event.id)}
                onKeyDown={(keyboardEvent) => {
                  if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                    keyboardEvent.preventDefault();
                    setDetailEventId(event.id);
                  }
                }}
                className={`overflow-hidden rounded-2xl border bg-[#1A1A1A] text-left transition focus:outline-none focus:ring-2 focus:ring-[#5B68F1] ${
                  isSelected
                    ? "border-[#5B68F1] shadow-[0_0_0_1px_rgba(91,104,241,0.35)]"
                    : "border-[#2D2D2D] hover:border-[#3A3A3A]"
                }`}
                aria-label={`Ver detalles del evento ${event.name}`}
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`Imagen de ${event.name}`}
                    width={640}
                    height={360}
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="h-40 w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-[#202B53] via-[#1B1B2A] to-[#2A1A2E]">
                    <span className="text-xs uppercase tracking-[1.8px] text-[#A9AEDB]">Sin imagen</span>
                  </div>
                )}

                <div className="p-4">
                  <h4 className="line-clamp-2 text-base font-semibold text-white">{event.name}</h4>

                  <div className="mt-3 space-y-2 text-xs text-[#B9B9B9]">
                    <p className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.place}
                    </p>
                    <p className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDateRange(event.startDate, event.endDate)}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        void handleStartUpload(event.id);
                      }}
                      disabled={Boolean(uploadingEventId)}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-[#5B68F1] px-3 text-sm font-semibold text-white transition hover:bg-[#6975f3] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isUploading ? "Cargando..." : "Subir maqueta"}
                    </button>

                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        setDetailEventId(event.id);
                      }}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-[#3A3A3A] px-3 text-sm font-semibold text-[#D9D9D9] transition hover:border-[#4A4A4A] hover:text-white"
                    >
                      Mas detalles
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {detailEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDetailEventId(null)}>
          <article
            className="max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-2xl border border-[#2D2D2D] bg-[#121212]"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2D2D2D] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[1.6px] text-[#AFAFAF]">Detalle del evento</p>
              <button
                type="button"
                onClick={() => setDetailEventId(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#303030] text-[#C7C7C7] transition hover:border-[#444444] hover:text-white"
                aria-label="Cerrar detalle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {detailEvent.imageUrl?.trim() ? (
                <Image
                  src={detailEvent.imageUrl}
                  alt={`Imagen de ${detailEvent.name}`}
                  width={1200}
                  height={560}
                  sizes="(min-width: 1024px) 760px, 100vw"
                  className="h-56 w-full rounded-xl object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#202B53] via-[#1B1B2A] to-[#2A1A2E]">
                  <span className="text-xs uppercase tracking-[1.8px] text-[#A9AEDB]">Sin imagen disponible</span>
                </div>
              )}

              <div>
                <h4 className={`${outfit.className} text-2xl font-bold text-white`}>{detailEvent.name}</h4>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#CFCFCF]">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#2D2D2D] px-3 py-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {detailEvent.place}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#2D2D2D] px-3 py-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDateRange(detailEvent.startDate, detailEvent.endDate)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#2D2D2D] px-3 py-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Estado: {detailEvent.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-[#B8B8B8]">
                <p className="leading-relaxed">{detailEvent.description}</p>
                {detailEvent.organizerClub?.name ? (
                  <p>
                    Organiza: <span className="text-[#E3E3E3]">{detailEvent.organizerClub.name}</span>
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 rounded-xl border border-[#2D2D2D] bg-[#0F0F0F] p-4">
                <h5 className="text-sm font-semibold text-white">Categorias permitidas</h5>
                {categoriesLoadingByEventId[detailEvent.id] ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-5/6" />
                  </div>
                ) : null}

                {!categoriesLoadingByEventId[detailEvent.id] && categoriesErrorByEventId[detailEvent.id] ? (
                  <p className="text-xs text-[#fca5a5]">{categoriesErrorByEventId[detailEvent.id]}</p>
                ) : null}

                {!categoriesLoadingByEventId[detailEvent.id] &&
                !categoriesErrorByEventId[detailEvent.id] &&
                (categoriesByEventId[detailEvent.id]?.length ?? 0) === 0 ? (
                  <p className="text-xs text-[#9C9C9C]">Este evento no tiene categorias habilitadas.</p>
                ) : null}

                {!categoriesLoadingByEventId[detailEvent.id] &&
                !categoriesErrorByEventId[detailEvent.id] &&
                (categoriesByEventId[detailEvent.id]?.length ?? 0) > 0
                  ? categoriesByEventId[detailEvent.id].map((group) => (
                      <div key={group.category.id} className="space-y-2 rounded-lg border border-[#252525] bg-[#151515] p-3">
                        <p className="text-sm font-semibold text-[#E7E7E7]">{group.category.name}</p>
                        {group.subcategories.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {group.subcategories.map((subcategory) => (
                              <span
                                key={subcategory.id}
                                className="inline-flex rounded-full border border-[#2E2E2E] bg-[#101010] px-2.5 py-1 text-[11px] text-[#C6C6C6]"
                              >
                                {subcategory.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full border border-[#2E2E2E] bg-[#101010] px-2.5 py-1 text-[11px] text-[#9C9C9C]">
                            Sin subcategorias
                          </span>
                        )}
                      </div>
                    ))
                  : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void handleStartUpload(detailEvent.id)}
                  disabled={Boolean(uploadingEventId)}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#5B68F1] px-4 text-sm font-semibold text-white transition hover:bg-[#6975f3] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploadingEventId === detailEvent.id ? "Cargando..." : "Subir maqueta"}
                </button>
                <button
                  type="button"
                  onClick={() => setDetailEventId(null)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#3A3A3A] px-4 text-sm font-semibold text-[#D9D9D9] transition hover:border-[#4A4A4A] hover:text-white"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </article>
  );
}

