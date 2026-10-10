"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ModelDetailView } from "@/presentation/components/features/participant/model-detail-view";
import { toParticipantModelDetail } from "@/presentation/components/features/admin/admin-event-model-detail-page";
import { useParticipantPodiumModelDetail } from "./use-participant-podium-model-detail";

export function ParticipantPodiumModelDetailPage({
  eventId,
  modelId,
  backHref,
}: {
  eventId: string;
  modelId: string;
  backHref?: string;
}) {
  const { detail, loading, error } = useParticipantPodiumModelDetail(eventId, modelId);
  const resolvedBackHref =
    backHref ?? `/participante/eventos/${encodeURIComponent(eventId)}/podio`;

  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => (
        <div className="w-full">
          {loading ? (
            <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-6 text-sm text-[#BBBBBB]">
              Cargando detalle de la maqueta...
            </section>
          ) : error ? (
            <section className="rounded-3xl border border-[#8B1D1D] bg-[#451414] p-6 text-sm text-[#FFB4B4]">
              {error}
            </section>
          ) : detail ? (
            <ModelDetailView detail={toParticipantModelDetail(detail)} backHref={resolvedBackHref} />
          ) : (
            <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6 text-sm text-[#9C9C9C]">
              No se encontro la maqueta solicitada.
            </section>
          )}
        </div>
      )}
    </ParticipantDashboardShell>
  );
}

