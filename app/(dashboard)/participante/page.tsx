"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import {
  ParticipantEventsSection,
  ParticipantHeader,
  ParticipantHomeSection,
  ParticipantModelsSection,
  ParticipantProfileSection,
  ParticipantResultsSection,
  ParticipantSidebar,
} from "@/presentation/components/features/participant";
import type {
  ParticipantSectionId,
} from "@/domain/participant/participant.types";
import { Skeleton } from "@/presentation/components/ui";
import { useParticipantDashboardPage } from "@/presentation/components/features/participant/use-participant-dashboard-page";

const ParticipantMobileSidebar = dynamic(() =>
  import("@/presentation/components/features/participant").then(
    (module) => module.ParticipantMobileSidebar,
  ),
);

const participantSectionIds: ParticipantSectionId[] = ["inicio", "eventos", "maquetas", "resultados", "perfil"];

const parseSectionParam = (value: string | null): ParticipantSectionId | null => {
  if (!value) {
    return null;
  }

  return participantSectionIds.includes(value as ParticipantSectionId) ? (value as ParticipantSectionId) : null;
};

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
  const searchParams = useSearchParams();
  const initialSection = parseSectionParam(searchParams.get("section"));
  const {
    userId,
    dashboard,
    loading,
    error,
    clearError,
    activeSection,
    effectiveUserId,
    sidebarItems,
    loadDashboard,
    handleSelectSection,
    handleLogout,
  } = useParticipantDashboardPage({
    initialSection,
  });

  if (loading && !dashboard) {
    return <ParticipantDashboardLoading />;
  }

  if (error && !dashboard) {
    return <ParticipantDashboardError error={error} onRetry={() => loadDashboard(userId)} />;
  }

  if (!dashboard) {
    return <ParticipantDashboardLoading />;
  }

  const renderSection = () => {
    if (activeSection === "inicio") {
      return (
        <ParticipantHomeSection
          onGoToResults={() => {
            handleSelectSection("resultados");
          }}
        />
      );
    }

    if (activeSection === "eventos") {
      return (
        <ParticipantEventsSection
          onGoToResults={() => {
            handleSelectSection("resultados");
          }}
        />
      );
    }

    if (activeSection === "resultados") {
      return (
        <ParticipantResultsSection
          effectiveUserId={effectiveUserId}
          onGoToMyModels={() => {
            handleSelectSection("maquetas");
          }}
        />
      );
    }

    if (activeSection === "maquetas") {
      return <ParticipantModelsSection effectiveUserId={effectiveUserId} />;
    }

    if (activeSection === "perfil") {
      return <ParticipantProfileSection />;
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

