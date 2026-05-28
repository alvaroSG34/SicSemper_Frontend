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

type ParticipantShowcaseLevelThreeSectionProps = {
  eventId: string;
  level1Id: string;
  level2Id: string;
  level1Name: string;
  level2Name: string;
};

export function ParticipantShowcaseLevelThreeSection({
  eventId,
  level1Id,
  level2Id,
  level1Name,
  level2Name,
}: ParticipantShowcaseLevelThreeSectionProps) {
  const { showcaseTree, loading, error, retryEventContext } =
    useParticipantUploadEventContext(eventId);
  const [searchTerm, setSearchTerm] = useState("");

  const showcaseNodes = useMemo(
    () => new Map(showcaseTree?.nodes.map((node) => [node.id, node]) ?? []),
    [showcaseTree],
  );
  const level3Items = useMemo(() => {
    const level2Node = showcaseNodes.get(level2Id);
    if (!level2Node) {
      return [];
    }

    return level2Node.children
      .map((childId) => showcaseNodes.get(childId))
      .filter((node): node is NonNullable<typeof node> => Boolean(node));
  }, [level2Id, showcaseNodes]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return level3Items;
    }

    return level3Items.filter((item) =>
      item.name.toLowerCase().includes(normalizedSearch),
    );
  }, [level3Items, searchTerm]);

  return (
    <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
      <p className="inline-flex rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-3 py-1 text-xs font-semibold tracking-[1px] text-[#8BA3FF]">
        PASO 3 DE 3
      </p>
      <h2 className={`${outfit.className} mt-4 text-3xl font-bold text-white sm:text-4xl`}>
        Selecciona la especialidad final
      </h2>
      <p className="mt-2 text-sm text-[#A7A7A7]">
        {level1Name} <span className="text-[#6E6E6E]">/</span> {level2Name}
      </p>
      <div className="mt-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar especialidad..."
          className="h-10 w-full rounded-xl border border-[#303030] bg-[#111111] px-3 text-sm text-white outline-none focus:border-[#5B68F1]"
        />
      </div>

      {loading ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          Cargando especialidades...
        </p>
      ) : null}
      {error ? (
        <div className="mt-6 rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3">
          <p className="text-sm text-[#FFB4B4]">{error}</p>
          <button
            type="button"
            onClick={() => void retryEventContext()}
            className="mt-3 inline-flex h-8 items-center justify-center rounded-lg border border-[#8B1D1D] px-3 text-xs font-semibold text-[#FFD0D0] transition hover:border-[#A22B2B]"
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {!loading && !error ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/participante/participantes/${eventId}/maquetas/${level1Id}/${item.id}/escalas?l1=${encodeURIComponent(level1Name)}&l2=${encodeURIComponent(level2Name)}&l2id=${encodeURIComponent(level2Id)}&final=${encodeURIComponent(item.name)}`}
              className="group rounded-2xl border border-[#2D2D2D] bg-[#151515] p-5 transition hover:border-[#5B68F1]/70"
            >
              <h3 className="text-lg font-semibold text-white">{item.name}</h3>
              <p className="mt-2 text-sm text-[#9E9E9E]">
                Especialidad final para seleccionar escala y ver maquetas
              </p>
              <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#8BA3FF]">
                Elegir escala
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </p>
            </Link>
          ))}
        </div>
      ) : null}

      {!loading && !error && filteredItems.length === 0 ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          Esta subcategoria no tiene especialidades finales con maquetas inscritas.
        </p>
      ) : null}
      {!loading &&
      !error &&
      level3Items.length > 0 &&
      filteredItems.length === 0 &&
      searchTerm.trim() ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          No hay especialidades que coincidan con tu busqueda.
        </p>
      ) : null}

      <div className="mt-6">
        <Link
          href={`/participante/participantes/${eventId}/nivel-2/${level1Id}?l1=${encodeURIComponent(level1Name)}`}
          className="inline-flex h-9 items-center justify-center rounded-[18px] border border-[#303030] px-4 text-xs font-semibold text-[#D7D7D7]"
        >
          Volver a nivel 2
        </Link>
      </div>
    </section>
  );
}
