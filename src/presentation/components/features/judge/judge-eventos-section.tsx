"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { ImgWithSkeleton } from "@/presentation/components/ui";
import { useJudgeStore } from "@/presentation/stores";
import { groupJudgeAssignedScopes } from "./judge-assigned-scopes";
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
        {sortedAssignedEvents.map((event) => {
          const groupedScopes = groupJudgeAssignedScopes(event.assignedScopes ?? []);

          return (
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

                  <div className="mt-3 rounded-xl border border-[#2D2D2D] bg-[#131313] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#8BA3FF]">
                      Alcances asignados
                    </p>
                    {groupedScopes.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {groupedScopes.map((scopeGroup) => (
                          <div key={`${event.id}:${scopeGroup.categoryName}`}>
                            <p className="text-xs font-semibold text-[#D7D7D7]">{scopeGroup.categoryName}</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {scopeGroup.includesGeneralScope ? (
                                <span className="rounded-full border border-[#3B415B] bg-[#1F2439] px-2 py-0.5 text-[11px] text-[#C9D3FF]">
                                  General (toda la categoría)
                                </span>
                              ) : null}
                              {scopeGroup.subcategories.map((subcategory) => (
                                <span
                                  key={`${event.id}:${scopeGroup.categoryName}:${subcategory}`}
                                  className="rounded-full border border-[#2D2D2D] bg-[#1D1D1D] px-2 py-0.5 text-[11px] text-[#CFCFCF]"
                                >
                                  {subcategory}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-[#9C9C9C]">
                        Sin alcances configurados para este evento.
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/juez/calificar?eventId=${encodeURIComponent(event.id)}`}
                    className="mt-4 inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#10B981]/60 bg-[#17261E] px-4 text-xs font-semibold text-white"
                  >
                    Calificar maquetas
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}

        {!loading && sortedAssignedEvents.length === 0 ? (
          <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
            No tienes eventos asignados. Pide a un admin que te asigne un alcance.
          </p>
        ) : null}
      </div>
    </section>
  );
}
