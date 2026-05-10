"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useJudgeStore } from "@/presentation/stores";
import { useJudgeQueue } from "./use-judge-queue";

type JudgeQueueSectionProps = {
  headingClassName: string;
  lockedEventId?: string;
  lockedCategoryId?: string;
  tableView?: boolean;
  hideFilters?: boolean;
  showLockedEventSummary?: boolean;
  reviewBasePath?: string;
  reviewQuery?: string;
};

export function JudgeQueueSection({
  headingClassName,
  lockedEventId,
  lockedCategoryId,
  tableView = false,
  hideFilters = false,
  showLockedEventSummary = true,
  reviewBasePath,
  reviewQuery = "",
}: JudgeQueueSectionProps) {
  const {
    loading,
    modelFilters,
    models,
    modelsLoading,
    modelsError,
    queueHeadline,
    loadModels,
  } = useJudgeQueue({ eventId: lockedEventId, categoryId: lockedCategoryId });
  const assignedEvents = useJudgeStore((state) => state.dashboard?.assignedEvents ?? []);
  const [searchText, setSearchText] = useState(modelFilters.search ?? "");

  const lockedEventName = useMemo(() => {
    if (!lockedEventId) {
      return null;
    }

    return (
      assignedEvents.find((event) => event.id === lockedEventId)?.name ??
      models?.items[0]?.eventName ??
      null
    );
  }, [assignedEvents, lockedEventId, models?.items]);

  const currentPage = models?.page ?? 1;
  const totalPages = models?.totalPages ?? 1;

  const handleChangeFilter = async (
    partial: Partial<{
      status: "ENVIADA" | "EN_REVISION" | "CALIFICADA" | "";
      priority: "Alta" | "Media" | "Baja" | "";
      page: number;
    }>,
  ) => {
    await loadModels({
      page: partial.page ?? 1,
      status:
        partial.status !== undefined
          ? partial.status || undefined
          : modelFilters.status,
      priority:
        partial.priority !== undefined
          ? partial.priority || undefined
          : modelFilters.priority,
      search: modelFilters.search,
      pageSize: modelFilters.pageSize,
      eventId: lockedEventId ?? modelFilters.eventId,
      categoryId: lockedCategoryId ?? modelFilters.categoryId,
    });
  };

  const handleSearch = async () => {
    await loadModels({
      search: searchText.trim() || undefined,
      page: 1,
      pageSize: modelFilters.pageSize,
      status: modelFilters.status,
      priority: modelFilters.priority,
      eventId: lockedEventId ?? modelFilters.eventId,
      categoryId: lockedCategoryId ?? modelFilters.categoryId,
    });
  };

  const resolveReviewHref = (modelId: string) => {
    if (!reviewBasePath) {
      return null;
    }

    return `${reviewBasePath}/${encodeURIComponent(modelId)}${reviewQuery}`;
  };

  return (
    <section className="flex w-full flex-col gap-6 rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold tracking-[2px] text-[#F15BB5]">
          {lockedEventId ? "CALIFICAR MAQUETAS" : "COLA DE REVISION"}
        </p>
        <h2
          className={`${headingClassName} text-3xl leading-tight font-bold text-white sm:text-4xl xl:text-5xl xl:leading-none`}
        >
          {queueHeadline}
        </h2>
        <p className="text-sm text-[#AAAAAA] sm:text-base">
          Selecciona una maqueta para abrir la pantalla dedicada de calificacion.
        </p>
        {lockedEventId && showLockedEventSummary ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-2 py-1 text-[#8BA3FF]">
              Evento: {lockedEventName ?? "Evento seleccionado"}
            </span>
            <Link
              href="/juez/eventos"
              className="inline-flex h-7 items-center justify-center rounded-full border border-[#303030] px-3 font-semibold text-[#D7D7D7]"
            >
              Volver a eventos
            </Link>
          </div>
        ) : null}
      </div>

      {!hideFilters ? (
        <div className="grid gap-4 rounded-2xl border border-[#2B2B2B] bg-[#171717] p-4 md:grid-cols-[1fr_auto_auto_auto]">
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Buscar por modelo, codigo o participante"
            className="h-10 rounded-xl border border-[#303030] bg-[#111111] px-3 text-sm text-white outline-none focus:border-[#5B68F1]"
          />
          <select
            value={modelFilters.status ?? ""}
            onChange={(event) =>
              void handleChangeFilter({
                status: event.target.value as "ENVIADA" | "EN_REVISION" | "CALIFICADA" | "",
              })
            }
            className="h-10 rounded-xl border border-[#303030] bg-[#111111] px-3 text-sm text-white"
          >
            <option value="">Todos los estados</option>
            <option value="ENVIADA">ENVIADA</option>
            <option value="EN_REVISION">EN_REVISION</option>
            <option value="CALIFICADA">CALIFICADA</option>
          </select>
          <select
            value={modelFilters.priority ?? ""}
            onChange={(event) =>
              void handleChangeFilter({
                priority: event.target.value as "Alta" | "Media" | "Baja" | "",
              })
            }
            className="h-10 rounded-xl border border-[#303030] bg-[#111111] px-3 text-sm text-white"
          >
            <option value="">Todas las prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
          <button
            type="button"
            onClick={() => void handleSearch()}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#5B68F1]/60 bg-[#252B4A] px-4 text-xs font-semibold text-white"
          >
            Buscar
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-5">
        {tableView ? (
          <div className="overflow-hidden rounded-xl border border-[#2B2B2B] bg-[#151515]">
            <div className="grid grid-cols-[52px_2fr_1.1fr_1.1fr_160px] gap-2 border-b border-[#262626] bg-[#1A1A1A] px-4 py-3 text-[11px] font-semibold tracking-[0.4px] text-[#9C9C9C] uppercase">
              <span>#</span>
              <span>Nombre / Equipo</span>
              <span>Estado</span>
              <span>Calificacion</span>
              <span>Accion</span>
            </div>
            {models?.items.map((item, index) => {
              const rowNumber = (currentPage - 1) * (models?.pageSize ?? 12) + index + 1;
              const isReadOnly = item.reviewStatus === "SUBMITTED";
              const reviewHref = resolveReviewHref(item.id);
              const actionHref =
                reviewHref && isReadOnly
                  ? `${reviewHref}${reviewHref.includes("?") ? "&" : "?"}readonly=1`
                  : reviewHref;
              const actionLabel = isReadOnly ? "Ver detalle" : "Calificar";

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[52px_2fr_1.1fr_1.1fr_160px] items-center gap-2 border-b border-[#232323] bg-[#161616] px-4 py-3 text-sm last:border-b-0"
                >
                  <span className="text-xs text-[#8C8C8C]">{String(rowNumber).padStart(2, "0")}</span>
                  <div className="min-w-0 text-left">
                    <p className="truncate font-semibold text-white">{item.project}</p>
                    <p className="truncate text-xs text-[#9A9A9A]">{item.participantName}</p>
                  </div>
                  <span className="inline-flex w-fit rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-2 py-1 text-xs text-[#8BA3FF]">
                    {item.status}
                  </span>
                  <span className="text-xs text-[#CFCFCF]">
                    {item.reviewStatus === "SUBMITTED" ? item.myScore?.toFixed(2) ?? "--" : "Pendiente"}
                  </span>
                  <div className="flex justify-start">
                    {actionHref ? (
                      <Link
                        href={actionHref}
                        className={`inline-flex h-8 items-center justify-center rounded-[14px] px-4 text-xs font-semibold ${
                          isReadOnly
                            ? "border border-[#303030] bg-[#191919] text-[#E7E7E7]"
                            : "border border-[#5B68F1]/70 bg-[#4D58DD] text-white"
                        }`}
                      >
                        {actionLabel}
                      </Link>
                    ) : (
                      <span className="text-xs text-[#8A8A8A]">Ruta no disponible</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {models?.items.map((item) => {
              const isReadOnly = item.reviewStatus === "SUBMITTED";
              const reviewHref = resolveReviewHref(item.id);
              const actionHref =
                reviewHref && isReadOnly
                  ? `${reviewHref}${reviewHref.includes("?") ? "&" : "?"}readonly=1`
                  : reviewHref;
              const actionLabel = isReadOnly ? "Ver detalle" : "Calificar";

              return (
                <article key={item.id} className="grid gap-3 rounded-xl border border-[#2B2B2B] bg-[#191919] p-4 transition">
                  <div className="flex flex-col items-start gap-1 text-left">
                    <p className="text-sm font-semibold text-white">{item.project}</p>
                    <p className="text-xs text-[#999999]">
                      {item.code} · {item.category} · {item.participantName}
                    </p>
                    <p className="text-xs text-[#777777]">{item.eventName}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-[#3A2A2A] bg-[#2A171D] px-2 py-1 text-[#F15BB5]">
                      Prioridad {item.priority}
                    </span>
                    <span className="rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-2 py-1 text-[#8BA3FF]">
                      {item.dueLabel}
                    </span>
                    <span className="rounded-full border border-[#2A3A30] bg-[#17261E] px-2 py-1 text-[#34D399]">
                      {item.reviewStatus}
                    </span>
                  </div>
                  {actionHref ? (
                    <Link
                      href={actionHref}
                      className="inline-flex h-9 w-fit items-center justify-center gap-1 rounded-[18px] border border-[#5B68F1]/70 bg-[#4D58DD] px-4 text-xs font-semibold text-white"
                    >
                      {actionLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span className="text-xs text-[#8A8A8A]">Ruta no disponible</span>
                  )}
                </article>
              );
            })}
          </>
        )}

        {!modelsLoading && (models?.items.length ?? 0) === 0 ? (
          <p className="rounded-xl border border-[#2D2D2D] bg-[#161616] px-4 py-3 text-sm text-[#9C9C9C]">
            No hay maquetas para el filtro actual.
          </p>
        ) : null}

        {modelsError ? (
          <p className="rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">
            {modelsError}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#2A2A2A] bg-[#151515] px-4 py-3">
          <p className="text-xs text-[#9C9C9C]">
            Pagina {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || modelsLoading || loading}
              onClick={() => void handleChangeFilter({ page: currentPage - 1 })}
              className="h-8 rounded-lg border border-[#303030] px-3 text-xs text-white disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages || modelsLoading || loading}
              onClick={() => void handleChangeFilter({ page: currentPage + 1 })}
              className="h-8 rounded-lg border border-[#303030] px-3 text-xs text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
