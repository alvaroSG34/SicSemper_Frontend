"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { useEffect, useState } from "react";
import { ImgWithSkeleton } from "@/presentation/components/ui";
import { useJudgeStore } from "@/presentation/stores";
import { judgeHeadingFont } from "./judge-heading-font";

export function JudgeEventosSection() {
  const loading = useJudgeStore((state) => state.loading);
  const assignedEvents = useJudgeStore((state) => state.dashboard?.assignedEvents ?? []);
  const pastEvents = useJudgeStore((state) => state.pastEvents ?? []);
  const pastEventsLoading = useJudgeStore((state) => state.pastEventsLoading ?? false);
  const pastEventsError = useJudgeStore((state) => state.pastEventsError ?? null);
  const loadPastEvents = useJudgeStore((state) => state.loadPastEvents ?? (() => Promise.resolve()));
  const [view, setView] = useState<"active" | "past">("active");

  useEffect(() => {
    void loadPastEvents();
  }, [loadPastEvents]);

  const sortedAssignedEvents = useMemo(
    () => [...assignedEvents].sort((left, right) => left.name.localeCompare(right.name)),
    [assignedEvents],
  );
  const sortedPastEvents = useMemo(
    () => [...pastEvents].sort((left, right) => left.name.localeCompare(right.name)),
    [pastEvents],
  );

  return (
    <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={`${judgeHeadingFont.className} text-[22px] font-semibold text-white`}>Eventos asignados</h2>
        <div className="flex rounded-full border border-[#303030] p-1 text-xs font-semibold">
          <button type="button" onClick={() => setView("active")} className={`rounded-full px-3 py-1.5 ${view === "active" ? "bg-[#5B68F1] text-white" : "text-[#999]"}`}>
            Activos ({sortedAssignedEvents.length})
          </button>
          <button type="button" onClick={() => setView("past")} className={`rounded-full px-3 py-1.5 ${view === "past" ? "bg-[#5B68F1] text-white" : "text-[#999]"}`}>
            Pasados ({sortedPastEvents.length})
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {view === "active" && sortedAssignedEvents.map((event) => (
          <article key={event.id} className="rounded-2xl bg-[#1A1A1A] p-5">
            <div className="grid gap-4 sm:grid-cols-[96px_1fr] sm:items-start">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-[#2D2D2D] bg-[#111111]">
                {event.imageUrl ? (
                  <ImgWithSkeleton
                    src={event.imageUrl}
                    alt={`Imagen del evento ${event.name}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs font-semibold text-[#8C8C8C]">Sin imagen</span>
                )}
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">{event.name}</h3>
                <p className="mt-1 text-[13px] text-[#999999]">{event.detail}</p>
                <p className="mt-3 text-xs font-medium text-[#F87171]">
                  {event.pendingCount} maquetas por calificar
                </p>

                <Link
                  href={`/juez/calificar/${encodeURIComponent(event.id)}/nivel-1`}
                  className="mt-4 inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#10B981]/60 bg-[#17261E] px-4 text-xs font-semibold text-white"
                >
                  Calificar maquetas
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/juez/eventos/${encodeURIComponent(event.id)}/podio`}
                  className="mt-3 ml-2 inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#5B68F1]/60 bg-[#1A1E36] px-4 text-xs font-semibold text-white"
                >
                  Ver podio <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}

        {view === "active" && !loading && sortedAssignedEvents.length === 0 ? (
          <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
            No tienes eventos asignados. Pide a un admin que te asigne un alcance.
          </p>
        ) : null}
        {view === "past" && pastEventsLoading ? (
          <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">Cargando eventos pasados...</p>
        ) : null}
        {view === "past" && pastEventsError ? (
          <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">{pastEventsError}</p>
        ) : null}
        {view === "past" && !pastEventsLoading && !pastEventsError && sortedPastEvents.map((event) => (
          <article key={event.id} className="rounded-2xl bg-[#1A1A1A] p-5">
            <div className="grid gap-4 sm:grid-cols-[96px_1fr] sm:items-start">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-[#2D2D2D] bg-[#111111]">
                {event.imageUrl ? <ImgWithSkeleton src={event.imageUrl} alt={`Imagen del evento ${event.name}`} className="h-full w-full object-cover" loading="lazy" /> : <span className="text-xs font-semibold text-[#8C8C8C]">Sin imagen</span>}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-white">{event.name}</h3>
                  <span className="rounded-full border border-[#3B3B3B] px-2 py-1 text-[10px] font-semibold text-[#D7D7D7]">{event.status === "FINALIZADO" ? "FINALIZADO" : "PASADO"}</span>
                </div>
                <p className="mt-1 text-[13px] text-[#999999]">{event.modelCount} maquetas asignadas · {event.reviewedCount} evaluaciones enviadas</p>
                <Link href={`/juez/eventos/pasados/${encodeURIComponent(event.id)}`} className="mt-4 inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#5B68F1]/60 bg-[#1A1E36] px-4 text-xs font-semibold text-white">
                  Ver evaluaciones <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link href={`/juez/eventos/pasados/${encodeURIComponent(event.id)}/podio`} className="mt-4 ml-2 inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#5B68F1]/60 bg-[#1A1E36] px-4 text-xs font-semibold text-white">
                  Ver podio <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
        {view === "past" && !pastEventsLoading && !pastEventsError && sortedPastEvents.length === 0 ? (
          <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">No tienes eventos pasados asignados.</p>
        ) : null}
      </div>
    </section>
  );
}
