"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ParticipantEventsSection,
  ParticipantHomeSection,
  ParticipantModelsSection,
  ParticipantProfileSection,
  ParticipantResultsSection,
} from "@/presentation/components/features/participant";
import type { ParticipantSectionId } from "@/domain/participant/participant.types";
import { ParticipantDashboardShell } from "@/presentation/components/features/participant/participant-dashboard-shell";

type ParticipantDashboardPageProps = {
  activeSection: ParticipantSectionId;
};

export function ParticipantDashboardPage({ activeSection }: ParticipantDashboardPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelsPrefilterEventId = searchParams.get("eventId");
  return (
    <ParticipantDashboardShell activeSection={activeSection}>
      {({ effectiveUserId, clearFlowState, handleSelectSection }) => {
        if (activeSection === "inicio") {
          return (
            <ParticipantHomeSection
              onStartUpload={(eventId) => {
                clearFlowState();
                router.push(`/participante/subir/${encodeURIComponent(eventId)}/nivel-1`);
              }}
            />
          );
        }

        if (activeSection === "eventos") {
          return (
            <ParticipantEventsSection
              onStartUpload={(eventId) => {
                clearFlowState();
                router.push(`/participante/subir/${encodeURIComponent(eventId)}/nivel-1`);
              }}
              onGoToMyModelsByEvent={(eventId) => {
                clearFlowState();
                router.push(`/participante/maquetas?eventId=${encodeURIComponent(eventId)}`);
              }}
              onOpenParticipantsByEvent={(eventId) => {
                clearFlowState();
                router.push(`/participante/participantes/${encodeURIComponent(eventId)}/nivel-1`);
              }}
            />
          );
        }

        if (activeSection === "resultados") {
          return (
            <ParticipantResultsSection
              onGoToEvents={() => {
                handleSelectSection("eventos");
              }}
              onGoToMyModels={() => {
                handleSelectSection("maquetas");
              }}
            />
          );
        }

        if (activeSection === "maquetas") {
          return (
            <ParticipantModelsSection
              effectiveUserId={effectiveUserId}
              initialEventFilterId={modelsPrefilterEventId}
            />
          );
        }

        if (activeSection === "perfil") {
          return <ParticipantProfileSection />;
        }

        return (
          <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6">
            <p className="text-sm text-[#9C9C9C]">Esta seccion estara disponible pronto.</p>
          </section>
        );
      }}
    </ParticipantDashboardShell>
  );
}
