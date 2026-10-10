"use client";

import { ModelDetailView } from "@/presentation/components/features/participant/model-detail-view";
import type { AdminEventModelDetail } from "@/domain/admin/admin.types";
import type { ParticipantShowcaseModelDetail } from "@/domain/participant/participant.types";
import { useAdminEventModelDetail } from "./use-admin-event-model-detail";

export const toParticipantModelDetail = (
  detail: AdminEventModelDetail,
): ParticipantShowcaseModelDetail => ({
  model: {
    id: detail.model.id,
    nombreModelo: detail.model.nombreModelo,
    codigo: detail.model.code,
    marca: detail.model.brand,
    descripcion: detail.model.description,
    status: detail.model.status as ParticipantShowcaseModelDetail["model"]["status"],
    createdAt: detail.model.createdAt,
  },
  owner: {
    id: detail.owner.userId,
    name: detail.owner.name,
    clubName: detail.owner.clubName,
  },
  context: {
    eventName: detail.eventName,
    categoryLabel: detail.registration.categoryLabel,
    scaleValue: detail.registration.scaleValue,
  },
  media: detail.media,
  scoring: {
    finalScore: detail.scoring.finalScore,
    judgeBreakdown: detail.scoring.judgeBreakdown.map((entry) => ({
      judgeName: entry.judgeName,
      totalScore: entry.totalScore,
      criteria: entry.criteria,
      generalComment: entry.generalComment,
      submittedAt: entry.submittedAt,
    })),
  },
});

export function AdminEventModelDetailPage({
  eventId,
  modelId,
  backHref,
}: {
  eventId: string;
  modelId: string;
  backHref?: string;
}) {
  const { detail, loading, error } = useAdminEventModelDetail(eventId, modelId);
  const resolvedBackHref =
    backHref ?? `/admin/eventos/${encodeURIComponent(eventId)}/control?tab=podio`;

  return (
    <main className="min-h-screen bg-[#000000] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 xl:px-[50px] xl:py-[50px]">
      <div className="mx-auto w-full max-w-[1500px]">
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
    </main>
  );
}
