"use client";

import { ModelDetailView } from "@/presentation/components/features/participant/model-detail-view";
import { toParticipantModelDetail } from "@/presentation/components/features/admin/admin-event-model-detail-page";
import { useJudgePodiumModelDetail } from "./use-judge-podium-model-detail";

export function JudgePodiumModelDetailPage({
  eventId,
  modelId,
  backHref,
}: {
  eventId: string;
  modelId: string;
  backHref?: string;
}) {
  const { detail, loading, error } = useJudgePodiumModelDetail(eventId, modelId);
  const resolvedBackHref =
    backHref ?? `/juez/eventos/${encodeURIComponent(eventId)}/podio`;

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

