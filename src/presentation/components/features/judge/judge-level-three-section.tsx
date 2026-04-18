"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { JudgeCategoryNavigationItem } from "@/domain/judge/judge.types";
import { useJudgeStore } from "@/presentation/stores";
import { judgeHeadingFont } from "./judge-heading-font";

type JudgeLevelThreeSectionProps = {
  eventId: string;
  level1Id: string;
  level2Id: string;
  level1Name: string;
  level2Name: string;
};

export function JudgeLevelThreeSection({
  eventId,
  level1Id,
  level2Id,
  level1Name,
  level2Name,
}: JudgeLevelThreeSectionProps) {
  const listEventCategoryChildren = useJudgeStore((state) => state.listEventCategoryChildren);
  const [items, setItems] = useState<JudgeCategoryNavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return items;
    }

    return items.filter((item) => item.name.toLowerCase().includes(normalizedSearch));
  }, [items, searchTerm]);

  useEffect(() => {
    let alive = true;

    void listEventCategoryChildren(eventId, level2Id)
      .then((response) => {
        if (!alive) {
          return;
        }
        setItems(response);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!alive) {
          return;
        }
        setError(reason instanceof Error ? reason.message : "No se pudieron cargar las especialidades.");
      })
      .finally(() => {
        if (!alive) {
          return;
        }
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [eventId, level2Id, listEventCategoryChildren]);

  return (
    <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
      <p className="inline-flex rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-3 py-1 text-xs font-semibold tracking-[1px] text-[#8BA3FF]">
        PASO 3 DE 3
      </p>
      <h2 className={`${judgeHeadingFont.className} mt-4 text-3xl font-bold text-white sm:text-4xl`}>
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
        <p className="mt-6 rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/juez/calificar/${eventId}/maquetas/${level1Id}/${item.id}?l1=${encodeURIComponent(level1Name)}&l2=${encodeURIComponent(level2Name)}&l2id=${encodeURIComponent(level2Id)}&final=${encodeURIComponent(item.name)}`}
              className="group rounded-2xl border border-[#2D2D2D] bg-[#151515] p-5 transition hover:border-[#5B68F1]/70"
            >
              <h3 className="text-lg font-semibold text-white">{item.name}</h3>
              <p className="mt-2 text-sm text-[#9E9E9E]">Especialidad final para listar maquetas</p>
              <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#8BA3FF]">
                Ver maquetas
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </p>
            </Link>
          ))}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          Esta subcategoria no tiene especialidades finales visibles.
        </p>
      ) : null}
      {!loading && !error && items.length > 0 && filteredItems.length === 0 ? (
        <p className="mt-6 rounded-xl border border-[#2D2D2D] bg-[#151515] px-4 py-3 text-sm text-[#9C9C9C]">
          No hay especialidades que coincidan con tu busqueda.
        </p>
      ) : null}

      <div className="mt-6">
        <Link
          href={`/juez/calificar/${eventId}/nivel-2/${level1Id}?l1=${encodeURIComponent(level1Name)}`}
          className="inline-flex h-9 items-center justify-center rounded-[18px] border border-[#303030] px-4 text-xs font-semibold text-[#D7D7D7]"
        >
          Volver a nivel 2
        </Link>
      </div>
    </section>
  );
}
