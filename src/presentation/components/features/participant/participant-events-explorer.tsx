"use client";

import { CalendarDays, MapPin, Sparkles, Users, X } from "lucide-react";
import { Outfit } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import type {
  ParticipantEventAllowedCategoryGroup,
  ParticipantEventDetail,
} from "@/domain/participant/participant.types";
import { formatEventDateRangeInLaPaz } from "@/core/utils/event-datetime";
import { ImageWithSkeleton, Skeleton } from "@/presentation/components/ui";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantEventsExplorerProps = {
  events: ParticipantEventDetail[];
  pastEvents?: ParticipantEventDetail[];
  selectedEventId: string | null;
  loading?: boolean;
  categoriesByEventId: Record<string, ParticipantEventAllowedCategoryGroup[]>;
  categoriesLoadingByEventId: Record<string, boolean>;
  categoriesErrorByEventId: Record<string, string | null>;
  registeredEventIdSet: Set<string>;
  registeredEventIdsLoading: boolean;
  onLoadEventCategories: (eventId: string) => Promise<void>;
  onStartUpload: (eventId: string) => Promise<boolean>;
  onGoToMyModelsByEvent: (eventId: string) => void;
  onOpenParticipantsByEvent: (eventId: string) => void;
};

export function ParticipantEventsExplorer({
  events,
  pastEvents = [],
  selectedEventId,
  loading = false,
  categoriesByEventId,
  categoriesLoadingByEventId,
  categoriesErrorByEventId,
  registeredEventIdSet,
  registeredEventIdsLoading,
  onLoadEventCategories,
  onStartUpload,
  onGoToMyModelsByEvent,
  onOpenParticipantsByEvent,
}: ParticipantEventsExplorerProps) {
  const [detailEventId, setDetailEventId] = useState<string | null>(null);
  const [uploadingEventId, setUploadingEventId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"available" | "past">("available");
  const [renderedAt] = useState(() => Date.now());

  const visibleEvents = activeFilter === "past" ? pastEvents : events;

  const detailEvent = useMemo(
    () => visibleEvents.find((event) => event.id === detailEventId) ?? null,
    [detailEventId, visibleEvents],
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

  const showSkeleton = activeFilter === "available" && loading && events.length === 0;

  const isPastEvent = (endDate: string) => {
    const parsedDate = new Date(endDate);
    return Number.isFinite(parsedDate.getTime()) && parsedDate.getTime() < renderedAt;
  };

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className={`${outfit.className} text-[22px] font-semibold text-white`}>Eventos proximos</h3>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#2D2D2D] bg-[#121212] p-1">
          <button
            type="button"
            onClick={() => setActiveFilter("available")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              activeFilter === "available" ? "bg-[#5B68F1] text-white" : "text-[#BDBDBD]"
            }`}
          >
            Actuales
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("past")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              activeFilter === "past" ? "bg-[#5B68F1] text-white" : "text-[#BDBDBD]"
            }`}
          >
            Pasados
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-xs text-[#9E9E9E]">
        <span>{activeFilter === "past" ? "Eventos pasados" : "Disponibles"}</span>
        <span>{visibleEvents.length}</span>
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

      {!showSkeleton && visibleEvents.length === 0 ? (
        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-4 text-center">
          <p className="text-sm text-[#9C9C9C]">
            {activeFilter === "past"
              ? "No tienes eventos pasados registrados por ahora."
              : "No hay eventos proximos por ahora. Vuelve mas tarde para descubrir nuevas competencias."}
          </p>
          <button
            type="button"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-[#343434] px-3 text-xs font-semibold text-[#E5E5E5] transition hover:border-[#4A4A4A]"
            onClick={() => undefined}
          >
            Refrescar
          </button>
        </div>
      ) : null}

      {!showSkeleton ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event) => {
            const isSelected = selectedEventId === event.id;
            const isUploading = uploadingEventId === event.id;
            const imageUrl = event.imageUrl?.trim();
            const isRegistered = registeredEventIdSet.has(event.id);
            const eventUploadLocked = activeFilter === "past" || isPastEvent(event.endDate);
            const isUploadButtonDisabled = Boolean(uploadingEventId) || eventUploadLocked;
            const uploadButtonLabel = eventUploadLocked
              ? "Evento finalizado"
              : isUploading
                ? "Cargando..."
                : "Subir maqueta";

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
                  <ImageWithSkeleton
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
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-[#3B3B3B] px-2.5 py-1 text-[10px] font-semibold tracking-[0.4px] text-[#D7D7D7]">
                      {event.status}
                    </span>
                    {registeredEventIdsLoading ? (
                      <span className="text-[10px] text-[#9B9B9B]">Verificando registro...</span>
                    ) : isRegistered ? (
                      <span className="text-[10px] text-[#7EE787]">Inscrito</span>
                    ) : (
                      <span className="text-[10px] text-[#AFAFAF]">No inscrito</span>
                    )}
                  </div>

                  <h4 className="line-clamp-2 text-base font-semibold text-white">{event.name}</h4>

                  <div className="mt-3 space-y-2 text-xs text-[#B9B9B9]">
                    <p className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.place}
                    </p>
                    <p className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatEventDateRangeInLaPaz(event.startDate, event.endDate, "Por definir")}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      aria-label={uploadButtonLabel}
                      onClick={(clickEvent) => {
                        if (isUploadButtonDisabled) {
                          return;
                        }
                        clickEvent.stopPropagation();
                        void handleStartUpload(event.id);
                      }}
                      disabled={isUploadButtonDisabled}
                      className={`inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                        eventUploadLocked
                          ? "cursor-not-allowed border border-[#343434] bg-[#1D1D1D] text-[#7E7E7E]"
                          : "bg-[#5B68F1] text-white hover:bg-[#6975f3] disabled:cursor-not-allowed disabled:opacity-70"
                      }`}
                    >
                      {uploadButtonLabel}
                    </button>

                    <button
                      type="button"
                      aria-label="Ver maquetas"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        onGoToMyModelsByEvent(event.id);
                      }}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-[#3A3A3A] px-3 text-sm font-semibold text-[#D9D9D9] transition hover:border-[#4A4A4A] hover:text-white"
                    >
                      Ver maquetas
                    </button>

                    <button
                      type="button"
                      aria-label="Ver participantes"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        onOpenParticipantsByEvent(event.id);
                      }}
                      className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-[#3A3A3A] px-3 text-sm font-semibold text-[#D9D9D9] transition hover:border-[#4A4A4A] hover:text-white"
                    >
                      <Users className="h-3.5 w-3.5" />
                      Ver participantes
                    </button>

                    <button
                      type="button"
                      aria-label="Mas detalles"
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
                <ImageWithSkeleton
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
                    {formatEventDateRangeInLaPaz(
                      detailEvent.startDate,
                      detailEvent.endDate,
                      "Por definir",
                    )}
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
            </div>
          </article>
        </div>
      ) : null}
    </article>
  );
}
