"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { ImgWithSkeleton } from "@/presentation/components/ui";
import { useJudgeStore } from "@/presentation/stores";
import { judgeHeadingFont } from "./judge-heading-font";

export function JudgeEventosSection() {
  const loading = useJudgeStore((state) => state.loading);
  const assignedEvents = useJudgeStore((state) => state.dashboard?.assignedEvents ?? []);

  const sortedAssignedEvents = useMemo(
    () => [...assignedEvents].sort((left, right) => left.name.localeCompare(right.name)),
    [assignedEvents],
  );

  return (
    <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={`${judgeHeadingFont.className} text-[22px] font-semibold text-white`}>
          Eventos asignados
        </h2>
        <span className="text-sm font-semibold text-[#5B68F1]">{sortedAssignedEvents.length} activos</span>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {sortedAssignedEvents.map((event) => (
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
              </div>
            </div>
          </article>
        ))}

        {!loading && sortedAssignedEvents.length === 0 ? (
          <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
            No tienes eventos asignados. Pide a un admin que te asigne un alcance.
          </p>
        ) : null}
      </div>
    </section>
  );
}
