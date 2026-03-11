"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Sparkles, X } from "lucide-react";

import {
  ParticipantHeader,
  ParticipantKpis,
  ParticipantNextChallenge,
  ParticipantSidebar,
} from "@/presentation/components/features/participant";
import type {
  ParticipantEventAllowedCategoryGroup,
  ParticipantEventDetail,
  ParticipantSectionId,
} from "@/domain/participant/participant.types";
import { useAuthStore, useParticipantStore } from "@/presentation/stores";
import { Skeleton } from "@/presentation/components/ui";

const ParticipantMobileSidebar = dynamic(() =>
  import("@/presentation/components/features/participant").then(
    (module) => module.ParticipantMobileSidebar,
  ),
);
const ParticipantEventsExplorer = dynamic(() =>
  import("@/presentation/components/features/participant").then(
    (module) => module.ParticipantEventsExplorer,
  ),
);
const ParticipantMyModels = dynamic(() =>
  import("@/presentation/components/features/participant").then(
    (module) => module.ParticipantMyModels,
  ),
);
const ParticipantProfilePanel = dynamic(() =>
  import("@/presentation/components/features/participant").then(
    (module) => module.ParticipantProfilePanel,
  ),
);
const ParticipantUploadModelWizard = dynamic(() =>
  import("@/presentation/components/features/participant").then(
    (module) => module.ParticipantUploadModelWizard,
  ),
);

const eventDateFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
});

const formatEventDate = (value: string) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Por definir";
  }

  return eventDateFormatter.format(parsedDate);
};

const formatEventDateRange = (startDate: string, endDate: string) => {
  const start = formatEventDate(startDate);
  const end = formatEventDate(endDate);
  return start === end ? start : `${start} - ${end}`;
};

const participantSectionIds: ParticipantSectionId[] = ["inicio", "eventos", "maquetas", "resultados", "perfil"];

const parseSectionParam = (value: string | null): ParticipantSectionId | null => {
  if (!value) {
    return null;
  }

  return participantSectionIds.includes(value as ParticipantSectionId) ? (value as ParticipantSectionId) : null;
};

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
            <Image
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
                {formatEventDateRange(event.startDate, event.endDate)}
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

            {!categoriesLoading && categoriesError ? (
              <p className="text-xs text-[#fca5a5]">{categoriesError}</p>
            ) : null}

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

function ParticipantDashboardLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 xl:px-[50px] xl:py-[50px]">
      <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col gap-6 md:gap-8 xl:gap-10">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-4 w-2/3" />
          <Skeleton className="mt-5 h-11 w-44" />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`participant-kpi-skeleton-${index}`}
              className="rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-9 w-16" />
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6">
          <Skeleton className="h-5 w-44" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`participant-event-skeleton-${index}`}
                className="rounded-2xl border border-[#2D2D2D] bg-[#121212] p-4"
              >
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

type ParticipantDashboardErrorProps = {
  error: string;
  onRetry: () => Promise<void>;
};

function ParticipantDashboardError({ error, onRetry }: ParticipantDashboardErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#000000] px-4 text-white">
      <div className="w-full max-w-[560px] rounded-2xl border border-[#ef4444]/40 bg-[#7f1d1d]/30 p-6 text-center">
        <p className="text-sm text-[#fca5a5]">{error}</p>
        <button
          type="button"
          onClick={() => void onRetry()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-[#fca5a5]/50 px-5 text-sm font-semibold text-[#fca5a5]"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}

export default function ParticipantePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [activeSection, setActiveSection] = useState<ParticipantSectionId>("inicio");
  const [isSelectedEventModalOpen, setIsSelectedEventModalOpen] = useState(false);
  const [isStartingUploadFromNextChallenge, setIsStartingUploadFromNextChallenge] = useState(false);

  const dashboard = useParticipantStore((state) => state.dashboard);
  const loading = useParticipantStore((state) => state.loading);
  const error = useParticipantStore((state) => state.error);
  const exploreEvents = useParticipantStore((state) => state.exploreEvents);
  const selectedEvent = useParticipantStore((state) => state.selectedEvent);
  const eventCategories = useParticipantStore((state) => state.eventCategories);
  const subcategoriesByCategory = useParticipantStore((state) => state.subcategoriesByCategory);
  const categoriesByEventId = useParticipantStore((state) => state.categoriesByEventId);
  const categoriesLoadingByEventId = useParticipantStore((state) => state.categoriesLoadingByEventId);
  const categoriesErrorByEventId = useParticipantStore((state) => state.categoriesErrorByEventId);
  const scales = useParticipantStore((state) => state.scales);
  const myModels = useParticipantStore((state) => state.myModels);
  const myModelsLoading = useParticipantStore((state) => state.myModelsLoading);
  const flowLoading = useParticipantStore((state) => state.flowLoading);
  const flowError = useParticipantStore((state) => state.flowError);
  const flowSuccessMessage = useParticipantStore((state) => state.flowSuccessMessage);
  const loadDashboard = useParticipantStore((state) => state.loadDashboard);
  const loadExploreEvents = useParticipantStore((state) => state.loadExploreEvents);
  const selectEvent = useParticipantStore((state) => state.selectEvent);
  const loadEventCategoriesForDetail = useParticipantStore((state) => state.loadEventCategoriesForDetail);
  const submitModel = useParticipantStore((state) => state.submitModel);
  const loadMyModels = useParticipantStore((state) => state.loadMyModels);
  const clearError = useParticipantStore((state) => state.clearError);
  const clearFlowState = useParticipantStore((state) => state.clearFlowState);
  const requestedSection = parseSectionParam(searchParams.get("section"));

  const effectiveUserId = user?.id ?? dashboard?.profile.userId ?? "";
  const selectedEventCategoryGroups = selectedEvent ? categoriesByEventId[selectedEvent.id] ?? [] : [];
  const selectedEventHasLoadedCategories = selectedEvent ? selectedEvent.id in categoriesByEventId : false;
  const selectedEventCategoriesLoading = selectedEvent
    ? categoriesLoadingByEventId[selectedEvent.id] ?? false
    : false;
  const selectedEventCategoriesError = selectedEvent ? categoriesErrorByEventId[selectedEvent.id] ?? null : null;

  useEffect(() => {
    void loadDashboard(user?.id);
  }, [loadDashboard, user?.id]);

  useEffect(() => {
    if (!requestedSection || requestedSection === activeSection) {
      return;
    }

    setActiveSection(requestedSection);
    setIsSelectedEventModalOpen(false);
    clearFlowState();
  }, [activeSection, clearFlowState, requestedSection]);

  useEffect(() => {
    const sectionNeedsEvents = activeSection === "eventos" || activeSection === "resultados";
    if (!sectionNeedsEvents || exploreEvents.length > 0) {
      return;
    }
    void loadExploreEvents();
  }, [activeSection, exploreEvents.length, loadExploreEvents]);

  useEffect(() => {
    if (activeSection !== "maquetas" || !effectiveUserId || myModels.length > 0) {
      return;
    }
    void loadMyModels(effectiveUserId);
  }, [activeSection, effectiveUserId, loadMyModels, myModels.length]);

  useEffect(() => {
    if (activeSection !== "resultados" || selectedEvent || exploreEvents.length === 0) {
      return;
    }

    void selectEvent(exploreEvents[0].id);
  }, [activeSection, exploreEvents, selectEvent, selectedEvent]);

  if (loading && !dashboard) {
    return <ParticipantDashboardLoading />;
  }

  if (error && !dashboard) {
    return <ParticipantDashboardError error={error} onRetry={() => loadDashboard(user?.id)} />;
  }

  if (!dashboard) {
    return <ParticipantDashboardLoading />;
  }

  const sidebarItems = dashboard.sidebarItems.map((item) => ({
    ...item,
    active: item.id === activeSection,
  }));

  const handleSelectSection = (sectionId: ParticipantSectionId) => {
    setActiveSection(sectionId);
    setIsSelectedEventModalOpen(false);
    clearFlowState();
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleStartUploadFromNextChallenge = () => {
    if (isStartingUploadFromNextChallenge) {
      return;
    }

    const eventId = dashboard.nextChallenge.eventId?.trim();
    if (!eventId) {
      return;
    }

    void (async () => {
      setIsStartingUploadFromNextChallenge(true);
      try {
        const wasSelected = await selectEvent(eventId);
        if (wasSelected) {
          handleSelectSection("resultados");
        }
      } finally {
        setIsStartingUploadFromNextChallenge(false);
      }
    })();
  };

  const renderSection = () => {
    if (activeSection === "inicio") {
      return (
        <section className="space-y-5">
          <ParticipantNextChallenge
            challenge={dashboard.nextChallenge}
            onStartUpload={handleStartUploadFromNextChallenge}
            isStartingUpload={isStartingUploadFromNextChallenge}
          />
          <ParticipantKpis kpis={dashboard.kpis} />
        </section>
      );
    }

    if (activeSection === "eventos") {
      return (
        <section className="grid w-full grid-cols-1 gap-5">
          <ParticipantEventsExplorer
            events={exploreEvents}
            selectedEventId={selectedEvent?.id ?? null}
            loading={flowLoading && exploreEvents.length === 0}
            categoriesByEventId={categoriesByEventId}
            categoriesLoadingByEventId={categoriesLoadingByEventId}
            categoriesErrorByEventId={categoriesErrorByEventId}
            onLoadEventCategories={async (eventId) => {
              await loadEventCategoriesForDetail(eventId);
            }}
            onStartUpload={async (eventId) => {
              const wasSelected = await selectEvent(eventId);
              if (wasSelected) {
                setActiveSection("resultados");
              }

              return wasSelected;
            }}
          />
        </section>
      );
    }

    if (activeSection === "resultados") {
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
                    const nextEventId = event.target.value;
                    if (!nextEventId) {
                      return;
                    }
                    setIsSelectedEventModalOpen(false);
                    void selectEvent(nextEventId);
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
                    <Image
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
                      {formatEventDateRange(selectedEvent.startDate, selectedEvent.endDate)}
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
              onGoToMyModels={() => {
                setActiveSection("maquetas");
              }}
            />
          ) : (
            <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
              <p className="text-sm text-[#9C9C9C]">Selecciona un evento para continuar con la carga de maqueta.</p>
            </article>
          )}
        </section>
      );
    }

    if (activeSection === "maquetas") {
      return <ParticipantMyModels models={myModels} loading={myModelsLoading && myModels.length === 0} />;
    }

    if (activeSection === "perfil") {
      return <ParticipantProfilePanel onProfileUpdated={() => void loadDashboard(user?.id)} />;
    }

    return (
      <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6">
        <p className="text-sm text-[#9C9C9C]">Esta seccion estara disponible pronto.</p>
      </section>
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="relative flex min-h-screen flex-col xl:flex-row">
        <ParticipantSidebar
          items={sidebarItems}
          onSelectSection={handleSelectSection}
          onLogout={() => void handleLogout()}
        />

        <section className="relative min-h-screen flex-1 px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:px-[50px] xl:py-[50px]">
          <div className="pointer-events-none absolute right-[120px] top-[380px] hidden h-[120px] w-[120px] rotate-[15deg] rounded-[20px] border-2 border-[#F15BB5] bg-white/10 xl:block" />

          <div className="relative z-10 flex h-full flex-col gap-6 md:gap-8 xl:gap-10">
            <ParticipantMobileSidebar
              items={sidebarItems}
              onSelectSection={handleSelectSection}
              onLogout={() => void handleLogout()}
            />

            <ParticipantHeader profile={dashboard.profile} />

            {error ? (
              <div className="rounded-xl border border-[#ef4444]/40 bg-[#7f1d1d]/30 px-4 py-3 text-sm text-[#fca5a5]">
                <div className="flex items-center justify-between gap-3">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={clearError}
                    className="rounded-md border border-[#fca5a5]/50 px-2 py-1 text-xs font-semibold text-[#fca5a5]"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : null}

            {renderSection()}

            <SelectedEventDetailsModal
              open={activeSection === "resultados" && isSelectedEventModalOpen}
              event={selectedEvent}
              categories={selectedEventCategoryGroups}
              hasLoadedCategories={selectedEventHasLoadedCategories}
              categoriesLoading={selectedEventCategoriesLoading}
              categoriesError={selectedEventCategoriesError}
              onLoadCategories={loadEventCategoriesForDetail}
              onClose={() => setIsSelectedEventModalOpen(false)}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

