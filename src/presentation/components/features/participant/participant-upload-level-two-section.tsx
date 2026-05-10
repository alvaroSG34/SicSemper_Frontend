"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Outfit } from "next/font/google";
import { useParticipantUploadEventContext } from "./use-participant-upload-event-context";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantUploadLevelTwoSectionProps = {
  eventId: string;
  level1Id: string;
  level1Name: string;
};

export function ParticipantUploadLevelTwoSection({
  eventId,
  level1Id,
  level1Name,
}: ParticipantUploadLevelTwoSectionProps) {
  const { subcategoriesByCategory, loading, error } =
    useParticipantUploadEventContext(eventId);
  const [searchTerm, setSearchTerm] = useState("");

  const level2Items = useMemo(
    () => subcategoriesByCategory[level1Id] ?? [],
    [level1Id, subcategoriesByCategory],
  );
  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return level2Items;
    }

    return level2Items.filter((item) =>
      item.name.toLowerCase().includes(normalizedSearch),
    );
  }, [level2Items, searchTerm]);

  return (
    <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
      <p className="inline-flex rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-3 py-1 text-xs font-semibold tracking-[1px] text-[#8BA3FF]">
        PASO 2 DE 3
      </p>
      <h2 className={`${outfit.className} mt-4 text-3xl font-bold text-white sm:text-4xl`}>
        Selecciona una subcategoria
      </h2>
      <p className="mt-2 text-sm text-[#A7A7A7]">
        {level1Name} <span className="text-[#6E6E6E]">/ Nivel 2</span>
      </p>
      <div className="mt-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar subcategoria..."
          className="h-10 w-full rounded-xl border border-[#303030] bg-[#111111] px-3 text-sm text-white outline-none focus:border-[#5B68F1]"
        />
      </div>

      {loading ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          Cargando subcategorias...
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const isLeaf = (subcategoriesByCategory[item.id] ?? []).length === 0;
            const href = isLeaf
              ? `/participante/subir/${eventId}/formulario/${level1Id}/${item.id}?l1=${encodeURIComponent(level1Name)}&final=${encodeURIComponent(item.name)}`
              : `/participante/subir/${eventId}/nivel-3/${level1Id}/${item.id}?l1=${encodeURIComponent(level1Name)}&l2=${encodeURIComponent(item.name)}`;

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
                    : "Contiene especialidades finales"}
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

      {!loading && !error && level2Items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          Esta categoria no tiene subcategorias disponibles.
        </p>
      ) : null}
      {!loading && !error && level2Items.length > 0 && filteredItems.length === 0 ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          No hay subcategorias que coincidan con tu busqueda.
        </p>
      ) : null}

      <div className="mt-6">
        <Link
          href={`/participante/subir/${eventId}/nivel-1`}
          className="inline-flex h-9 items-center justify-center rounded-[18px] border border-[#303030] px-4 text-xs font-semibold text-[#D7D7D7]"
        >
          Volver a nivel 1
        </Link>
      </div>
    </section>
  );
}
