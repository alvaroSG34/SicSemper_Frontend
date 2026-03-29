"use client";

import { useMemo } from "react";
import { useJudgeStore } from "@/presentation/stores";
import { judgeHeadingFont } from "./judge-heading-font";

export function JudgeCompetenciasSection() {
  const loading = useJudgeStore((state) => state.loading);
  const assignedEvents = useJudgeStore((state) => state.dashboard?.assignedEvents ?? []);

  const sortedAssignedEvents = useMemo(
    () => [...assignedEvents].sort((left, right) => left.name.localeCompare(right.name)),
    [assignedEvents],
  );

  return (
    <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={`${judgeHeadingFont.className} text-[22px] font-semibold text-white`}>Competencias asignadas</h2>
        <span className="text-sm font-semibold text-[#5B68F1]">{sortedAssignedEvents.length} activas</span>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {sortedAssignedEvents.map((event) => (
          <article key={event.id} className="rounded-2xl bg-[#1A1A1A] p-5">
            <h3 className="text-base font-semibold text-white">{event.name}</h3>
            <p className="mt-1 text-[13px] text-[#999999]">{event.detail}</p>
            <p className="mt-3 text-xs font-medium text-[#8BA3FF]">{event.pendingCount} pendientes en este alcance</p>
          </article>
        ))}

        {!loading && sortedAssignedEvents.length === 0 ? (
          <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
            Aun no tienes competencias asignadas. Pide a un admin que te asigne un alcance.
          </p>
        ) : null}
      </div>
    </section>
  );
}
