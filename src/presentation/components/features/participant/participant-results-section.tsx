"use client";

import { CalendarDays, MapPin, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import type {
  ParticipantEventAllowedCategoryGroup,
  ParticipantEventDetail,
} from "@/domain/participant/participant.types";
import { formatEventDateRangeInLaPaz } from "@/core/utils/event-datetime";
import { ImageWithSkeleton, Skeleton } from "@/presentation/components/ui";
import { ParticipantUploadModelWizard } from "./participant-upload-model-wizard";
import { useParticipantResults } from "./use-participant-results";

type SelectedEventDetailsModalProps = {
  open: boolean;
  event: ParticipantEventDetail | null;
  categories: ParticipantEventAllowedCategoryGroup[];
  hasLoadedCategories: boolean;
  categoriesLoading: boolean;
  categoriesError: string | null;
  onLoadCategories: (eventId: string) => Promise<void>;
  onClose: () => void;
};

function SelectedEventDetailsModal({
  open,
  event,
  categories,
  hasLoadedCategories,
  categoriesLoading,
  categoriesError,
  onLoadCategories,
  onClose,
}: SelectedEventDetailsModalProps) {
  useEffect(() => {
    if (!open || !event) {
      return;
    }

    const handleEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [event, onClose, open]);

  useEffect(() => {
    if (!open || !event || hasLoadedCategories || categoriesLoading) {
      return;
    }

    void onLoadCategories(event.id);
  }, [categoriesLoading, event, hasLoadedCategories, onLoadCategories, open]);

  if (!open || !event) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <article
        className="max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-2xl border border-[#2D2D2D] bg-[#121212]"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#2D2D2D] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[1.6px] text-[#AFAFAF]">Detalle del evento</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#303030] text-[#C7C7C7] transition hover:border-[#444444] hover:text-white"
            aria-label="Cerrar detalle del evento"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {event.imageUrl?.trim() ? (
            <ImageWithSkeleton
              src={event.imageUrl}
              alt={`Imagen de ${event.name}`}
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
            <h4 className="text-2xl font-bold text-white">{event.name}</h4>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#CFCFCF]">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#2D2D2D] px-3 py-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.place}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#2D2D2D] px-3 py-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatEventDateRangeInLaPaz(event.startDate, event.endDate, "Por definir")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#2D2D2D] px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                Estado: {event.status}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm text-[#B8B8B8]">
            <p className="leading-relaxed">{event.description}</p>
            {event.organizerClub?.name ? (
              <p>
                Organiza: <span className="text-[#E3E3E3]">{event.organizerClub.name}</span>
              </p>
            ) : null}
          </div>

          <div className="space-y-2 rounded-xl border border-[#2D2D2D] bg-[#0F0F0F] p-4">
            <h5 className="text-sm font-semibold text-white">Categorias permitidas</h5>

            {categoriesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-5/6" />
              </div>
            ) : null}

            {!categoriesLoading && categoriesError ? <p className="text-xs text-[#fca5a5]">{categoriesError}</p> : null}

            {!categoriesLoading && !categoriesError && hasLoadedCategories && categories.length === 0 ? (
              <p className="text-xs text-[#9C9C9C]">Este evento no tiene categorias habilitadas.</p>
            ) : null}

            {!categoriesLoading && !categoriesError && categories.length > 0
              ? categories.map((group) => (
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#3A3A3A] px-4 text-sm font-semibold text-[#D9D9D9] transition hover:border-[#4A4A4A] hover:text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

type ParticipantResultsSectionProps = {
  effectiveUserId: string;
  onGoToMyModels: () => void;
};

export function ParticipantResultsSection({
  effectiveUserId,
  onGoToMyModels,
}: ParticipantResultsSectionProps) {
  const {
    exploreEvents,
    selectedEvent,
    eventCategories,
    subcategoriesByCategory,
    scales,
    flowLoading,
    flowError,
    flowSuccessMessage,
    loadEventCategoriesForDetail,
    submitModel,
    handleSelectEvent,
    isSelectedEventModalOpen,
    setIsSelectedEventModalOpen,
    selectedEventCategoryGroups,
    selectedEventHasLoadedCategories,
    selectedEventCategoriesLoading,
    selectedEventCategoriesError,
  } = useParticipantResults();

  return (
    <section className="space-y-5">
      <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
        <h3 className="text-xl font-semibold text-white">Subir Maqueta</h3>
        <p className="mt-2 text-sm text-[#9C9C9C]">
          Selecciona un evento para cargar tu maqueta. La exploracion de eventos se mantiene en su seccion.
        </p>

        <div className="mt-4 max-w-[460px]">
          <label className="flex flex-col gap-2 text-sm text-[#D0D0D0]">
            Evento
            <select
              value={selectedEvent?.id ?? ""}
              onChange={(event) => {
                handleSelectEvent(event.target.value);
              }}
              className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            >
              <option value="">Selecciona un evento</option>
              {exploreEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedEvent ? (
          <article className="mt-5 overflow-hidden rounded-2xl border border-[#2D2D2D] bg-[#121212]">
            <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
              {selectedEvent.imageUrl?.trim() ? (
                <ImageWithSkeleton
                  src={selectedEvent.imageUrl}
                  alt={`Imagen de ${selectedEvent.name}`}
                  width={440}
                  height={360}
                  sizes="(min-width: 768px) 220px, 100vw"
                  className="h-[180px] w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-[180px] w-full items-center justify-center bg-gradient-to-br from-[#202B53] via-[#1B1B2A] to-[#2A1A2E]">
                  <span className="text-xs uppercase tracking-[1.6px] text-[#A9AEDB]">Sin imagen</span>
                </div>
              )}

              <div className="space-y-3 p-4 md:p-5">
                <h4 className="text-lg font-semibold text-white">{selectedEvent.name}</h4>
                <p className="inline-flex items-center gap-1.5 text-xs text-[#CFCFCF]">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedEvent.place}
                </p>
                <p className="inline-flex items-center gap-1.5 text-xs text-[#CFCFCF]">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatEventDateRangeInLaPaz(
                    selectedEvent.startDate,
                    selectedEvent.endDate,
                    "Por definir",
                  )}
                </p>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#2D2D2D] px-2.5 py-1 text-[11px] text-[#CFCFCF]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Estado: {selectedEvent.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsSelectedEventModalOpen(true)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-[#3A3A3A] px-3 text-xs font-semibold text-[#D9D9D9] transition hover:border-[#4A4A4A] hover:text-white"
                  >
                    Ver mas detalles
                  </button>
                </div>
              </div>
            </div>
          </article>
        ) : null}
      </article>

      {selectedEvent && effectiveUserId ? (
        <ParticipantUploadModelWizard
          key={selectedEvent.id}
          eventId={selectedEvent.id}
          userId={effectiveUserId}
          categories={eventCategories}
          subcategoriesByCategory={subcategoriesByCategory}
          scales={scales}
          loading={flowLoading}
          error={flowError}
          successMessage={flowSuccessMessage}
          onSubmitModel={submitModel}
          onGoToMyModels={onGoToMyModels}
        />
      ) : (
        <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
          <p className="text-sm text-[#9C9C9C]">Selecciona un evento para continuar con la carga de maqueta.</p>
        </article>
      )}

      <SelectedEventDetailsModal
        open={isSelectedEventModalOpen}
        event={selectedEvent}
        categories={selectedEventCategoryGroups}
        hasLoadedCategories={selectedEventHasLoadedCategories}
        categoriesLoading={selectedEventCategoriesLoading}
        categoriesError={selectedEventCategoriesError}
        onLoadCategories={loadEventCategoriesForDetail}
        onClose={() => setIsSelectedEventModalOpen(false)}
      />
    </section>
  );
}

