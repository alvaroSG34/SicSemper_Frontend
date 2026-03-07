"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ParticipantEventDetail,
  ParticipantEventsExplorer,
  ParticipantHeader,
  ParticipantKpis,
  ParticipantMobileSidebar,
  ParticipantMyModels,
  ParticipantNextChallenge,
  ParticipantOpenEvents,
  ParticipantProfilePanel,
  ParticipantSidebar,
  ParticipantUploadModelWizard,
} from "@/presentation/components/features/participant";
import type { ParticipantSectionId } from "@/domain/participant/participant.types";
import { useAuthStore, useParticipantStore } from "@/presentation/stores";
import { Skeleton } from "@/presentation/components/ui";

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
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [activeSection, setActiveSection] = useState<ParticipantSectionId>("inicio");

  const dashboard = useParticipantStore((state) => state.dashboard);
  const loading = useParticipantStore((state) => state.loading);
  const error = useParticipantStore((state) => state.error);
  const exploreEvents = useParticipantStore((state) => state.exploreEvents);
  const selectedEvent = useParticipantStore((state) => state.selectedEvent);
  const eventCategories = useParticipantStore((state) => state.eventCategories);
  const subcategoriesByCategory = useParticipantStore((state) => state.subcategoriesByCategory);
  const scales = useParticipantStore((state) => state.scales);
  const myModels = useParticipantStore((state) => state.myModels);
  const flowLoading = useParticipantStore((state) => state.flowLoading);
  const flowError = useParticipantStore((state) => state.flowError);
  const flowSuccessMessage = useParticipantStore((state) => state.flowSuccessMessage);
  const loadDashboard = useParticipantStore((state) => state.loadDashboard);
  const loadExploreEvents = useParticipantStore((state) => state.loadExploreEvents);
  const selectEvent = useParticipantStore((state) => state.selectEvent);
  const submitModel = useParticipantStore((state) => state.submitModel);
  const loadMyModels = useParticipantStore((state) => state.loadMyModels);
  const clearError = useParticipantStore((state) => state.clearError);
  const clearFlowState = useParticipantStore((state) => state.clearFlowState);

  const effectiveUserId = user?.id ?? dashboard?.profile.userId ?? "";

  useEffect(() => {
    void loadDashboard(user?.id);
    void loadExploreEvents();
  }, [loadDashboard, loadExploreEvents, user?.id]);

  useEffect(() => {
    if (!effectiveUserId) {
      return;
    }
    void loadMyModels(effectiveUserId);
  }, [effectiveUserId, loadMyModels]);

  useEffect(() => {
    const sectionNeedsEvent = activeSection === "eventos" || activeSection === "resultados";
    if (!sectionNeedsEvent || selectedEvent || exploreEvents.length === 0) {
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
    clearFlowState();
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const renderSection = () => {
    if (activeSection === "inicio") {
      return (
        <>
          <ParticipantNextChallenge challenge={dashboard.nextChallenge} />

          <ParticipantKpis kpis={dashboard.kpis} />

          <section className="grid w-full grid-cols-1 gap-5 xl:gap-8">
            <ParticipantOpenEvents events={dashboard.openEvents} />
          </section>
        </>
      );
    }

    if (activeSection === "eventos") {
      return (
        <section className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-8">
          <ParticipantEventsExplorer
            events={exploreEvents}
            selectedEventId={selectedEvent?.id ?? null}
            loading={flowLoading && exploreEvents.length === 0}
            onSelectEvent={(eventId) => {
              void selectEvent(eventId);
            }}
          />

          <ParticipantEventDetail
            event={selectedEvent}
            onStartUpload={() => {
              if (!selectedEvent) {
                return;
              }
              clearFlowState();
              setActiveSection("resultados");
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
      return <ParticipantMyModels models={myModels} loading={flowLoading && myModels.length === 0} />;
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
          </div>
        </section>
      </div>
    </main>
  );
}
