"use client";

import { Award, ChevronRight, Download, Image as ImageIcon, Medal, RotateCcw } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { ImageWithSkeleton } from "@/presentation/components/ui";
import { adminEventControlService } from "@/application/admin/services/admin-event-control.service";
import { useAdminEventPodium } from "./use-admin-event-podium";
import type {
  AdminEventPodiumInitialSelection,
  EventPodiumService,
} from "./use-admin-event-podium";
import type { AdminEventPodiumEntry, AdminEventPodiumSegment } from "@/domain/admin/admin.types";

const scoreLabel = (score: number) => (Number.isInteger(score) ? String(score) : score.toFixed(2));

const positionLabel = (position: number) => {
  if (position === 1) return "Oro";
  if (position === 2) return "Plata";
  if (position === 3) return "Bronce";
  return `Posición ${position}`;
};

const hierarchyLabel = (level: number) => {
  if (level === 0) return "Categoría";
  if (level === 1) return "Subcategoría";
  if (level === 2) return "Especialidad";
  return `Nivel ${level + 1}`;
};

function ModelPreview({
  entry,
  className = "h-32",
}: {
  entry: AdminEventPodiumEntry;
  className?: string;
}) {
  return entry.previewImageUrl ? (
    <ImageWithSkeleton
      src={entry.previewImageUrl}
      alt={entry.modelName}
      width={640}
      height={420}
      className={`w-full rounded-xl object-cover ${className}`}
      skeletonClassName="rounded-xl"
    />
  ) : (
    <div
      className={`flex w-full items-center justify-center rounded-xl border border-dashed border-[#3a3a3a] bg-[#101010] text-[#777] ${className}`}
    >
      <span className="flex items-center gap-2 text-xs">
        <ImageIcon className="h-4 w-4" /> Sin imagen
      </span>
    </div>
  );
}

function PodiumCard({ entry }: { entry: AdminEventPodiumEntry }) {
  return (
    <article className="flex min-w-0 flex-1 flex-col rounded-2xl border border-[#303030] bg-[#191919] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b7b7b7]">
        {entry.position === 1 ? "🏆 " : ""}
        {entry.position}° · {positionLabel(entry.position)}
      </p>
      <div className="mt-3">
        <ModelPreview entry={entry} className="h-40" />
      </div>
      <p className="mt-3 truncate text-base font-semibold text-white">{entry.modelName}</p>
      <p className="mt-1 text-xs text-[#aaa]">
        {entry.modelCode} · {entry.participantName}
      </p>
      <p className="mt-3 text-lg font-bold text-white">
        {scoreLabel(entry.finalScore)} <span className="text-xs font-normal text-[#999]">pts</span>
      </p>
    </article>
  );
}

function PositionBadge({ position }: { position: number }) {
  if (position > 3) {
    return (
      <span className="inline-flex min-w-8 justify-center text-sm font-semibold text-[#d6d6d6]">
        {position}
      </span>
    );
  }

  const medalColor =
    position === 1 ? "text-[#f5c542]" : position === 2 ? "text-[#c8d1df]" : "text-[#d8894c]";

  return (
    <span className={`relative inline-flex h-8 w-8 items-center justify-center ${medalColor}`}>
      <Medal className="h-7 w-7" strokeWidth={1.8} />
      <span className="absolute top-[10px] text-[10px] font-bold text-[#172033]">{position}</span>
    </span>
  );
}

export function AdminEventPodiumSection({
  eventId,
  initialSelection,
  service,
  modelDetailHref,
  showExport = false,
}: {
  eventId: string;
  initialSelection?: AdminEventPodiumInitialSelection;
  service?: EventPodiumService;
  modelDetailHref?: (
    eventId: string,
    modelId: string,
    selection: AdminEventPodiumInitialSelection,
  ) => string;
  showExport?: boolean;
}) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const podium = useAdminEventPodium({ eventId, initialSelection, service });
  const selectedNode = podium.selectedPath.at(-1)
    ? podium.nodesById.get(podium.selectedPath.at(-1)!)
    : null;
  const result = podium.result;
  const selectionLevelCount =
    podium.selectedPath.length +
    (podium.selectedPath.length === 0 || Boolean(selectedNode?.children.length) ? 1 : 0);
  const selectionLevels = Array.from({ length: selectionLevelCount }, (_, level) => {
    const parentId = level === 0 ? null : podium.selectedPath[level - 1];
    const optionIds = parentId
      ? (podium.nodesById.get(parentId)?.children ?? [])
      : (podium.tree?.rootIds ?? []);
    return {
      level,
      selectedId: podium.selectedPath[level] ?? null,
      options: optionIds
        .map((id) => podium.nodesById.get(id))
        .filter((node): node is NonNullable<typeof node> => Boolean(node)),
    };
  });

  const chooseSegment = (segment: AdminEventPodiumSegment) => podium.selectSegment(segment);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white">Podio del evento</h2>
          <p className="mt-1 text-sm text-[#9c9c9c]">
            {podium.tree?.eventName ?? "Consulta los resultados oficiales por categoría y escala."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void podium.reload()}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#303030] px-3 text-xs font-semibold text-[#d5d5d5] hover:border-[#5B68F1]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Actualizar
          </button>
          {showExport ? (
            <button
              type="button"
              disabled={exporting}
              onClick={async () => {
                setExporting(true);
                setExportError(null);
                try {
                  const response = await adminEventControlService.exportEventControlPodium(eventId);
                  const disposition = response.headers.get("content-disposition") ?? "";
                  const fileName =
                    disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? "podio-evento.xlsx";
                  const url = URL.createObjectURL(response.blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = fileName;
                  document.body.appendChild(anchor);
                  anchor.click();
                  anchor.remove();
                  URL.revokeObjectURL(url);
                } catch (error) {
                  setExportError(
                    error instanceof Error ? error.message : "No se pudo exportar el podio.",
                  );
                } finally {
                  setExporting(false);
                }
              }}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#5B68F1] bg-[#5B68F1]/15 px-3 text-xs font-semibold text-white hover:bg-[#5B68F1]/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> {exporting ? "Exportando..." : "Exportar Excel"}
            </button>
          ) : null}
        </div>
      </div>

      {exportError ? (
        <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
          {exportError}
        </p>
      ) : null}

      {podium.error ? (
        <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
          {podium.error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-[#2d2d2d] bg-[#121212] p-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#242424] pb-3">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#888]">
            Ruta
          </span>
          <button
            type="button"
            onClick={() => podium.goBack(0)}
            className="rounded-md px-2 py-1 text-xs text-[#bdbdbd] hover:bg-[#252525]"
          >
            Categorías
          </button>
          {podium.selectedPath.map((categoryId, index) => {
            const node = podium.nodesById.get(categoryId);
            return node ? (
              <span key={categoryId} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-[#666]" />
                <button
                  type="button"
                  onClick={() => podium.goBack(index + 1)}
                  className="rounded-md px-2 py-1 text-xs text-[#bdbdbd] hover:bg-[#252525]"
                >
                  {node.name}
                </button>
              </span>
            ) : null;
          })}
        </div>

        {podium.loading ? (
          <p className="py-8 text-center text-sm text-[#999]">
            Cargando categorías con resultados...
          </p>
        ) : null}
        {!podium.loading && !podium.tree?.nodes.length ? (
          <p className="py-8 text-center text-sm text-[#999]">
            Aún no hay maquetas calificadas para mostrar.
          </p>
        ) : null}
        {!podium.loading && podium.tree?.nodes.length && selectionLevels.length ? (
          <div className="mt-4 space-y-3">
            {selectionLevels.map((selection) => (
              <div
                key={selection.level}
                className="rounded-xl border border-[#2d2d2d] bg-[#171717] p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">
                    {hierarchyLabel(selection.level)}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selection.options.map((node) => {
                    const active = selection.selectedId === node.id;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => podium.selectCategory(node.id, selection.level)}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${active ? "border-[#5B68F1] bg-[#5B68F1]/20 text-white" : "border-[#303030] bg-[#191919] text-[#cfcfcf] hover:border-[#5B68F1]"}`}
                      >
                        <span>{node.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {selectedNode && selectedNode.children.length === 0 ? (
          <div className="mt-4 border-t border-[#242424] pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#888]">
              Escala o grupo MultiEscala
            </p>
            {podium.loadingSegments ? (
              <p className="py-5 text-sm text-[#999]">Cargando segmentos...</p>
            ) : null}
            {!podium.loadingSegments && !podium.segments.length ? (
              <p className="py-5 text-sm text-[#999]">
                No hay escalas con maquetas calificadas en esta especialidad.
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {podium.segments.map((segment) => {
                const active =
                  (podium.selectedSegment?.scaleId ?? podium.selectedSegment?.groupId) ===
                  (segment.scaleId ?? segment.groupId);
                return (
                  <button
                    key={`${segment.type}-${segment.id}`}
                    type="button"
                    onClick={() => chooseSegment(segment)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold ${active ? "border-[#5B68F1] bg-[#5B68F1]/20 text-white" : "border-[#303030] text-[#cfcfcf] hover:border-[#5B68F1]"}`}
                  >
                    {segment.label}{" "}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {podium.loadingResult ? (
        <div className="rounded-2xl border border-[#2d2d2d] bg-[#161616] p-8 text-center text-sm text-[#999]">
          Calculando resultados...
        </div>
      ) : null}
      {result ? (
        <>
          <div className="rounded-2xl border border-[#2d2d2d] bg-[#161616] p-5">
            <div>
              <div>
                <p className="flex items-center gap-2 text-xl font-semibold text-white">
                  <Award className="h-5 w-5 text-[#f5c542]" /> {result.categoryLabel} ·{" "}
                  {result.segmentLabel}
                </p>
                <p className="mt-1 text-sm text-[#999]">
                  Podio oficial · {result.total} maquetas calificadas
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
              {result.podium.map((entry) => (
                <PodiumCard key={entry.modelId} entry={entry} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2d2d2d] bg-[#161616] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Detalle de posiciones</h3>
                <p className="mt-1 text-xs text-[#999]">
                  Resultados oficiales de la categoría seleccionada
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#aaa]">
                Mostrar{" "}
                <select
                  value={podium.pageSize}
                  onChange={(event) => podium.setPageSize(Number(event.target.value))}
                  className="rounded-lg border border-[#333] bg-[#111] px-2 py-1 text-white"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[820px] border-separate border-spacing-y-1 text-left text-sm">
                <thead>
                  <tr className="text-xs text-[#888]">
                    <th className="px-3 py-2">Posición</th>
                    <th className="px-3 py-2">Maqueta</th>
                    <th className="px-3 py-2">Puntaje</th>
                    <th className="px-3 py-2">Participante</th>
                    <th className="px-3 py-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rankings.map((entry) => (
                    <tr key={entry.modelId} className="bg-[#1d1d1f]">
                      <td className="w-16 px-3 py-2">
                        <PositionBadge position={entry.position} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md">
                            <ModelPreview entry={entry} className="h-9" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{entry.modelName}</p>
                            <p className="text-xs text-[#999]">{entry.modelCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-semibold text-white">
                        {scoreLabel(entry.finalScore)}
                      </td>
                      <td className="px-3 py-2 text-[#c8c8c8]">{entry.participantName}</td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={
                            modelDetailHref
                              ? modelDetailHref(eventId, entry.modelId, {
                                  selectedPath: podium.selectedPath,
                                  finalCategoryId: podium.finalCategoryId,
                                  selectedSegment: podium.selectedSegment ?? undefined,
                                })
                              : (() => {
                                  const query = new URLSearchParams({ tab: "podio" });
                                  if (podium.selectedPath.length > 0) {
                                    query.set("path", podium.selectedPath.join(","));
                                  }
                                  if (podium.finalCategoryId) {
                                    query.set("finalCategoryId", podium.finalCategoryId);
                                  }
                                  if (podium.selectedSegment?.scaleId) {
                                    query.set("scaleId", podium.selectedSegment.scaleId);
                                  }
                                  if (podium.selectedSegment?.groupId) {
                                    query.set("groupId", podium.selectedSegment.groupId);
                                  }
                                  return `/admin/eventos/${encodeURIComponent(eventId)}/control/maquetas/${encodeURIComponent(entry.modelId)}?${query.toString()}`;
                                })()
                          }
                          className="inline-flex items-center justify-center rounded-lg border border-[#5B68F1] bg-[#5B68F1]/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#5B68F1]/25"
                        >
                          Ver maqueta
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#999]">
              <span>
                Página {result.page} de {result.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={result.page <= 1}
                  onClick={() => podium.setPage(result.page - 1)}
                  className="rounded-lg border border-[#333] px-3 py-1.5 text-white disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={result.page >= result.totalPages}
                  onClick={() => podium.setPage(result.page + 1)}
                  className="rounded-lg border border-[#333] px-3 py-1.5 text-white disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
