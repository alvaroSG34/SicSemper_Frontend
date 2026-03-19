"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useJudgeQueue } from "./use-judge-queue";

type JudgeQueueSectionProps = {
  headingClassName: string;
};

export function JudgeQueueSection({ headingClassName }: JudgeQueueSectionProps) {
  const {
    loading,
    pendingQueue,
    summary,
    startReview,
    completeReview,
    queueHeadline,
  } = useJudgeQueue();

  return (
    <section className="flex w-full flex-col gap-6 rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:flex-row xl:items-stretch xl:justify-between xl:gap-8 xl:p-10">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold tracking-[2px] text-[#F15BB5]">COLA DE REVISION</p>
          <h2
            className={`${headingClassName} text-3xl leading-tight font-bold text-white sm:text-4xl xl:text-5xl xl:leading-none`}
          >
            {queueHeadline}
          </h2>
          <p className="text-sm text-[#AAAAAA] sm:text-base">
            Avanza sobre tu cola asignada y cierra calificaciones a tiempo.
          </p>
        </div>

        <div className="grid gap-3">
          {pendingQueue.map((item) => (
            <article
              key={item.id}
              className="grid gap-3 rounded-xl border border-[#2B2B2B] bg-[#191919] p-4 md:grid-cols-[1fr_auto]"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-white">{item.project}</p>
                <p className="text-xs text-[#999999]">
                  {item.category} · {item.participantName}
                </p>
                <p className="text-xs text-[#777777]">{item.eventName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-[#3A2A2A] bg-[#2A171D] px-2 py-1 text-[#F15BB5]">
                    Prioridad {item.priority}
                  </span>
                  <span className="rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-2 py-1 text-[#8BA3FF]">
                    {item.time}
                  </span>
                  <span className="rounded-full border border-[#2A3A30] bg-[#17261E] px-2 py-1 text-[#34D399]">
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {item.canStart ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void startReview(item.id)}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#5B68F1]/60 bg-[#252B4A] px-4 text-xs font-semibold text-white"
                  >
                    Iniciar
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                {item.canComplete ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void completeReview(item.id)}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#10B981]/60 bg-[#17261E] px-4 text-xs font-semibold text-white"
                  >
                    Finalizar
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </article>
          ))}

          {!loading && pendingQueue.length === 0 ? (
            <p className="rounded-xl border border-[#2D2D2D] bg-[#161616] px-4 py-3 text-sm text-[#9C9C9C]">
              No tienes maquetas pendientes en tus alcances asignados.
            </p>
          ) : null}
        </div>
      </div>

      <aside className="w-full rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:w-[320px]">
        <h3 className={`${headingClassName} text-xl font-semibold text-white`}>Resumen rapido</h3>
        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
            <p className="text-xs text-[#999999]">Pendientes urgentes</p>
            <p className={`${headingClassName} mt-1 text-3xl font-bold text-[#F15BB5]`}>
              {summary?.pendingUrgent ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
            <p className="text-xs text-[#999999]">Siguiente corte</p>
            <p className="mt-1 text-sm font-semibold text-white">{summary?.nextCutoff ?? "Sin cortes activos"}</p>
          </div>
          <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
            <p className="text-xs text-[#999999]">Cobertura de revisiones</p>
            <p className="mt-1 text-sm font-semibold text-white">{summary?.coveragePercent ?? 0}% completado</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
