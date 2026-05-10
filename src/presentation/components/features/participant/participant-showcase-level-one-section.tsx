"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Outfit } from "next/font/google";
import { useParticipantUploadEventContext } from "./use-participant-upload-event-context";
import { useParticipantShowcaseCategoryAvailability } from "./use-participant-showcase-category-availability";
import { hasModelsInSubtree } from "./participant-showcase-tree";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantShowcaseLevelOneSectionProps = {
  eventId: string;
};

export function ParticipantShowcaseLevelOneSection({
  eventId,
}: ParticipantShowcaseLevelOneSectionProps) {
  const { eventCategories, subcategoriesByCategory, loading, error, eventName } =
    useParticipantUploadEventContext(eventId);
  const {
    categoryIdSet,
    loading: availabilityLoading,
    error: availabilityError,
  } = useParticipantShowcaseCategoryAvailability(eventId);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const visibleItems = eventCategories.filter((item) =>
      hasModelsInSubtree(item.id, subcategoriesByCategory, categoryIdSet),
    );
    if (!normalizedSearch) {
      return visibleItems;
    }

    return visibleItems.filter((item) =>
      item.name.toLowerCase().includes(normalizedSearch),
    );
  }, [categoryIdSet, eventCategories, searchTerm, subcategoriesByCategory]);

  return (
    <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
      <p className="inline-flex rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-3 py-1 text-xs font-semibold tracking-[1px] text-[#8BA3FF]">
        PASO 1 DE 3
      </p>
      <h2 className={`${outfit.className} mt-4 text-3xl font-bold text-white sm:text-4xl`}>
        Selecciona una categoria
      </h2>
      <p className="mt-2 text-sm text-[#A7A7A7]">
        Evento: <span className="text-[#DCDCDC]">{eventName}</span>
      </p>
      <div className="mt-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar categoria..."
          className="h-10 w-full rounded-xl border border-[#303030] bg-[#111111] px-3 text-sm text-white outline-none focus:border-[#5B68F1]"
        />
      </div>

      {loading ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          Cargando categorias...
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">
          {error}
        </p>
      ) : null}
      {availabilityError ? (
        <p className="mt-6 rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">
          {availabilityError}
        </p>
      ) : null}
      {availabilityLoading ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          Validando categorias con maquetas...
        </p>
      ) : null}

      {!loading && !error && !availabilityLoading && !availabilityError ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const isLeaf = (subcategoriesByCategory[item.id] ?? []).length === 0;
            const href = isLeaf
              ? `/participante/participantes/${eventId}/maquetas/${item.id}/${item.id}?l1=${encodeURIComponent(item.name)}&final=${encodeURIComponent(item.name)}`
              : `/participante/participantes/${eventId}/nivel-2/${item.id}?l1=${encodeURIComponent(item.name)}`;

            return (
              <Link
                key={item.id}
                href={href}
                className="group rounded-2xl border border-[#2D2D2D] bg-[#151515] p-5 transition hover:border-[#5B68F1]/70"
              >
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                <p className="mt-2 text-sm text-[#9E9E9E]">
                  {isLeaf
                    ? "Seleccion final disponible"
                    : "Contiene subcategorias para continuar"}
                </p>
                <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#8BA3FF]">
                  Continuar
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            );
          })}
        </div>
      ) : null}

      {!loading && !error && !availabilityLoading && !availabilityError && filteredItems.length === 0 ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          Este evento no tiene categorias con maquetas inscritas.
        </p>
      ) : null}
      {!loading &&
      !error &&
      !availabilityLoading &&
      !availabilityError &&
      eventCategories.length > 0 &&
      filteredItems.length === 0 &&
      searchTerm.trim() ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          No hay categorias que coincidan con tu busqueda.
        </p>
      ) : null}

      <div className="mt-6">
        <Link
          href="/participante/eventos"
          className="inline-flex h-9 items-center justify-center rounded-[18px] border border-[#303030] px-4 text-xs font-semibold text-[#D7D7D7]"
        >
          Volver a eventos
        </Link>
      </div>
    </section>
  );
}
