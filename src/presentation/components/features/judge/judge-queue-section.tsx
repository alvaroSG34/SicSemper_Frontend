"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, FileText, Save, X } from "lucide-react";
import type { JudgeReviewCriteria } from "@/domain/judge/judge.types";
import { ImgWithSkeleton } from "@/presentation/components/ui";
import { useJudgeStore } from "@/presentation/stores";
import { groupJudgeAssignedScopes } from "./judge-assigned-scopes";
import { useJudgeQueue } from "./use-judge-queue";

type JudgeQueueSectionProps = {
  headingClassName: string;
  lockedEventId?: string;
  lockedCategoryId?: string;
  tableView?: boolean;
  hideFilters?: boolean;
  showLockedEventSummary?: boolean;
};

const criteriaFields: Array<{ key: keyof Required<JudgeReviewCriteria>; label: string }> = [
  { key: "tecnica", label: "Técnica" },
  { key: "pintura", label: "Pintura" },
  { key: "fidelidad", label: "Fidelidad" },
  { key: "detalle", label: "Detalle" },
  { key: "presentacion", label: "Presentación" },
];

const isImageMimeType = (mimeType: string) => mimeType.startsWith("image/");
const isPdfMimeType = (mimeType: string) => mimeType === "application/pdf";
const DEFAULT_API_BASE_URL = "http://localhost:3001/api/v1";

const resolveApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

const resolveMediaUrl = (input: { publicUrl: string | null; storageKey: string | null }) => {
  if (input.publicUrl) {
    return input.publicUrl;
  }

  if (!input.storageKey) {
    return null;
  }

  const apiBaseUrl = resolveApiBaseUrl();
  const apiOrigin = apiBaseUrl.replace(/\/api\/v1$/i, "");
  const normalizedStorageKey = input.storageKey.replace(/^\/+/, "");
  return `${apiOrigin}/uploads/${normalizedStorageKey}`;
};

const normalizeRubricScore = (rawValue: string): number | undefined => {
  if (rawValue.trim() === "") {
    return undefined;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  const integerValue = Math.trunc(parsed);
  return Math.min(10, Math.max(0, integerValue));
};

export function JudgeQueueSection({
  headingClassName,
  lockedEventId,
  lockedCategoryId,
  tableView = false,
  hideFilters = false,
  showLockedEventSummary = true,
}: JudgeQueueSectionProps) {
  const {
    loading,
    modelFilters,
    models,
    modelsLoading,
    modelsError,
    selectedModelId,
    modelDetail,
    detailLoading,
    detailError,
    queueHeadline,
    loadModels,
    selectModel,
    startReview,
    saveDraft,
    submitReview,
  } = useJudgeQueue({ eventId: lockedEventId, categoryId: lockedCategoryId });
  const assignedEvents = useJudgeStore((state) => state.dashboard?.assignedEvents ?? []);

  const [searchText, setSearchText] = useState(modelFilters.search ?? "");
  const [criteria, setCriteria] = useState<JudgeReviewCriteria>({});
  const [generalComment, setGeneralComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; fileName: string } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCriteria(modelDetail?.myReview?.criteria ?? {});
    setGeneralComment(modelDetail?.myReview?.generalComment ?? "");
    setFormError(null);
    setPreviewImage(null);
  }, [
    modelDetail?.id,
    modelDetail?.myReview?.updatedAt,
    modelDetail?.myReview?.status,
    modelDetail?.myReview?.criteria,
    modelDetail?.myReview?.generalComment,
  ]);

  useEffect(() => {
    if (!previewImage) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [previewImage]);

  useEffect(() => {
    if (!isScoreModalOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsScoreModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isScoreModalOpen]);

  const canEditReview = modelDetail?.myReview?.status !== "SUBMITTED";
  const canSubmitReview = canEditReview && !!modelDetail;

  const currentPage = models?.page ?? 1;
  const totalPages = models?.totalPages ?? 1;

  const criteriaCompletion = useMemo(
    () => criteriaFields.filter((field) => typeof criteria[field.key] === "number").length,
    [criteria],
  );
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
  const lockedEventScopes = useMemo(() => {
    if (!lockedEventId) {
      return [];
    }

    const lockedEvent = assignedEvents.find((event) => event.id === lockedEventId);
    return groupJudgeAssignedScopes(lockedEvent?.assignedScopes ?? []);
  }, [assignedEvents, lockedEventId]);

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

  const handleSaveDraft = async () => {
    if (!modelDetail) {
      return;
    }

    setFormError(null);
    await saveDraft(modelDetail.id, {
      criteria,
      generalComment,
    });
  };

  const handleOpenScoreModal = async (modelId: string) => {
    setFormError(null);
    await selectModel(modelId);
    setIsScoreModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!modelDetail) {
      return;
    }

    const missing = criteriaFields.some((field) => typeof criteria[field.key] !== "number");
    if (missing) {
      setFormError("Completa los 5 criterios antes de enviar.");
      return;
    }

    const outOfRange = criteriaFields.some((field) => {
      const value = criteria[field.key];
      return typeof value === "number" && (value < 0 || value > 10);
    });
    if (outOfRange) {
      setFormError("Cada criterio debe estar entre 0 y 10.");
      return;
    }

    setFormError(null);
    const normalizedComment = generalComment.trim();
    const result = await submitReview(modelDetail.id, {
      criteria: {
        tecnica: Number(criteria.tecnica),
        pintura: Number(criteria.pintura),
        fidelidad: Number(criteria.fidelidad),
        detalle: Number(criteria.detalle),
        presentacion: Number(criteria.presentacion),
      },
      generalComment: normalizedComment.length > 0 ? normalizedComment : undefined,
    });

    if (result) {
      setIsScoreModalOpen(false);
    }
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
          Evalúa tus maquetas asignadas con borrador, envío final y cierre por cobertura.
        </p>
        {lockedEventId && showLockedEventSummary ? (
          <div className="mt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
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
            <div className="rounded-xl border border-[#2D2D2D] bg-[#151515] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#8BA3FF]">
                Alcances asignados
              </p>
              {lockedEventScopes.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {lockedEventScopes.map((scopeGroup) => (
                    <div key={`locked:${scopeGroup.categoryName}`}>
                      <p className="text-xs font-semibold text-[#D7D7D7]">{scopeGroup.categoryName}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {scopeGroup.includesGeneralScope ? (
                          <span className="rounded-full border border-[#3B415B] bg-[#1F2439] px-2 py-0.5 text-[11px] text-[#C9D3FF]">
                            General (toda la categoría)
                          </span>
                        ) : null}
                        {scopeGroup.subcategories.map((subcategory) => (
                          <span
                            key={`locked:${scopeGroup.categoryName}:${subcategory}`}
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
                <p className="mt-2 text-xs text-[#9C9C9C]">Sin alcances configurados para este evento.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {!hideFilters ? (
        <div className="grid gap-4 rounded-2xl border border-[#2B2B2B] bg-[#171717] p-4 md:grid-cols-[1fr_auto_auto_auto]">
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Buscar por modelo, código o participante"
            className="h-10 rounded-xl border border-[#303030] bg-[#111111] px-3 text-sm text-white outline-none focus:border-[#5B68F1]"
          />
          <select
            value={modelFilters.status ?? ""}
            onChange={(event) => void handleChangeFilter({ status: event.target.value as "ENVIADA" | "EN_REVISION" | "CALIFICADA" | "" })}
            className="h-10 rounded-xl border border-[#303030] bg-[#111111] px-3 text-sm text-white"
          >
            <option value="">Todos los estados</option>
            <option value="ENVIADA">ENVIADA</option>
            <option value="EN_REVISION">EN_REVISION</option>
            <option value="CALIFICADA">CALIFICADA</option>
          </select>
          <select
            value={modelFilters.priority ?? ""}
            onChange={(event) => void handleChangeFilter({ priority: event.target.value as "Alta" | "Media" | "Baja" | "" })}
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
        <div className="flex flex-col gap-3">
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

                return (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[52px_2fr_1.1fr_1.1fr_160px] items-center gap-2 border-b border-[#232323] px-4 py-3 text-sm last:border-b-0 ${
                      selectedModelId === item.id ? "bg-[#1D223A]" : "bg-[#161616]"
                    }`}
                  >
                    <span className="text-xs text-[#8C8C8C]">{String(rowNumber).padStart(2, "0")}</span>
                    <button
                      type="button"
                      onClick={() => void selectModel(item.id)}
                      className="min-w-0 text-left"
                    >
                      <p className="truncate font-semibold text-white">{item.project}</p>
                      <p className="truncate text-xs text-[#9A9A9A]">{item.participantName}</p>
                    </button>
                    <span className="inline-flex w-fit rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-2 py-1 text-xs text-[#8BA3FF]">
                      {item.status}
                    </span>
                    <span className="text-xs text-[#CFCFCF]">
                      {item.reviewStatus === "SUBMITTED" ? item.myScore?.toFixed(2) ?? "--" : "Pendiente"}
                    </span>
                    <div className="flex justify-start">
                      {item.reviewStatus !== "SUBMITTED" ? (
                        <button
                          type="button"
                          disabled={loading || modelsLoading}
                          onClick={() => void handleOpenScoreModal(item.id)}
                          className="inline-flex h-8 items-center justify-center rounded-[14px] border border-[#5B68F1]/70 bg-[#4D58DD] px-4 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Calificar
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={loading || modelsLoading}
                          onClick={() => void handleOpenScoreModal(item.id)}
                          className="inline-flex h-8 items-center justify-center rounded-[14px] border border-[#303030] bg-[#191919] px-4 text-xs font-semibold text-[#E7E7E7] disabled:opacity-50"
                        >
                          Ver detalle
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {models?.items.map((item) => (
                <article
                  key={item.id}
                  className={`grid gap-3 rounded-xl border p-4 transition md:grid-cols-[1fr_auto] ${
                    selectedModelId === item.id
                      ? "border-[#5B68F1] bg-[#1D223A]"
                      : "border-[#2B2B2B] bg-[#191919]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => void selectModel(item.id)}
                    className="flex flex-col items-start gap-1 text-left"
                  >
                    <p className="text-sm font-semibold text-white">{item.project}</p>
                    <p className="text-xs text-[#999999]">
                      {item.code} · {item.category} · {item.participantName}
                    </p>
                    <p className="text-xs text-[#777777]">{item.eventName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
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
                  </button>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {item.status === "ENVIADA" ? (
                      <button
                        type="button"
                        disabled={loading || modelsLoading}
                        onClick={() => void startReview(item.id)}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#5B68F1]/60 bg-[#252B4A] px-4 text-xs font-semibold text-white"
                      >
                        Iniciar
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    {item.reviewStatus !== "SUBMITTED" ? (
                      <button
                        type="button"
                        disabled={loading || modelsLoading}
                        onClick={() => void handleOpenScoreModal(item.id)}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#10B981]/60 bg-[#17261E] px-4 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Calificar
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </>
          )}

          {!modelsLoading && (models?.items.length ?? 0) === 0 ? (
            <p className="rounded-xl border border-[#2D2D2D] bg-[#161616] px-4 py-3 text-sm text-[#9C9C9C]">
              No hay maquetas para el filtro actual.
            </p>
          ) : null}

          {modelsError ? (
            <p className="rounded-xl border border-[#8B1D1D] bg-[#451414] px-4 py-3 text-sm text-[#FFB4B4]">{modelsError}</p>
          ) : null}

          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#2A2A2A] bg-[#151515] px-4 py-3">
            <p className="text-xs text-[#9C9C9C]">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || modelsLoading}
                onClick={() => void handleChangeFilter({ page: currentPage - 1 })}
                className="h-8 rounded-lg border border-[#303030] px-3 text-xs text-white disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages || modelsLoading}
                onClick={() => void handleChangeFilter({ page: currentPage + 1 })}
                className="h-8 rounded-lg border border-[#303030] px-3 text-xs text-white disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

      </div>

      {isScoreModalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsScoreModalOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs tracking-[1px] text-[#8BA3FF]">CALIFICAR MAQUETA</p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  {modelDetail?.nombreModelo ?? "Cargando..."}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#2F2F2F] text-[#E5E5E5]"
                aria-label="Cerrar modal de calificacion"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modelDetail ? (
              <>
                <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#2D2D2D] bg-[#151515] p-3">
                      <p className="text-sm font-semibold text-white">{modelDetail.nombreModelo}</p>
                      <p className="mt-2 text-xs text-[#B6B6B6]">
                        {modelDetail.description || "Sin descripción registrada."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#2D2D2D] bg-[#151515] p-3 text-xs text-[#D7D7D7]">
                      <p>
                        <span className="text-[#9C9C9C]">Código:</span> {modelDetail.code}
                      </p>
                      <p className="mt-1">
                        <span className="text-[#9C9C9C]">Categoría:</span>{" "}
                        {modelDetail.category.parentName ?? modelDetail.category.name}
                      </p>
                      <p className="mt-1">
                        <span className="text-[#9C9C9C]">Subcategoría:</span> {modelDetail.category.name}
                      </p>
                      <p className="mt-1">
                        <span className="text-[#9C9C9C]">Etiqueta:</span> {modelDetail.category.label}
                      </p>
                      <p className="mt-1">
                        <span className="text-[#9C9C9C]">Marca:</span> {modelDetail.brand || "Sin marca"}
                      </p>
                      <p className="mt-1">
                        <span className="text-[#9C9C9C]">Participante:</span> {modelDetail.participant.name}
                      </p>
                      <p className="mt-1">
                        <span className="text-[#9C9C9C]">Evento:</span> {modelDetail.event.name}
                      </p>
                      <p className="mt-1">
                        <span className="text-[#9C9C9C]">Cobertura:</span> {modelDetail.progress.submittedJudgeCount}/
                        {modelDetail.progress.assignedJudgeCount} jueces enviaron
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold tracking-[1px] text-[#8BA3FF]">Archivos del participante</p>
                      <div className="grid gap-3">
                        {modelDetail.media.map((mediaItem) => {
                          const mediaUrl = resolveMediaUrl(mediaItem);
                          const isImage = isImageMimeType(mediaItem.mimeType);
                          const isPdf = isPdfMimeType(mediaItem.mimeType);

                          return (
                            <article key={mediaItem.id} className="rounded-xl border border-[#2B2B2B] bg-[#121212] p-3">
                              <div className="grid grid-cols-[64px_1fr] items-start gap-3">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#171717]">
                                  {mediaUrl && isImage ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewImage({
                                          url: mediaUrl,
                                          fileName: mediaItem.fileName,
                                        })
                                      }
                                      className="h-full w-full"
                                      aria-label={`Ampliar imagen ${mediaItem.fileName}`}
                                    >
                                      <ImgWithSkeleton
                                        src={mediaUrl}
                                        alt={mediaItem.fileName}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                    </button>
                                  ) : (
                                    <FileText className="h-5 w-5 text-[#8C8C8C]" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-medium text-[#DADADA]">{mediaItem.fileName}</p>
                                  <p className="mt-1 text-[11px] text-[#8C8C8C]">{mediaItem.mimeType}</p>

                                  {mediaUrl ? (
                                    <div className="mt-2 flex flex-wrap gap-3">
                                      <a
                                        href={mediaUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#8BA3FF] underline"
                                      >
                                        {isPdf ? "Abrir PDF" : "Abrir"}
                                      </a>
                                      <a
                                        href={mediaUrl}
                                        download={mediaItem.fileName}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#9AE6B4] underline"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                        Descargar
                                      </a>
                                    </div>
                                  ) : (
                                    <p className="mt-2 text-xs text-[#FFB4B4]">Archivo sin URL disponible.</p>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        })}

                        {modelDetail.media.length === 0 ? (
                          <p className="rounded-lg border border-[#2D2D2D] bg-[#151515] px-3 py-2 text-xs text-[#9C9C9C]">
                            Esta maqueta no tiene archivos adjuntos.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold tracking-[1px] text-[#8BA3FF]">
                        RÚBRICA ({criteriaCompletion}/5)
                      </p>
                      {criteriaFields.map((field) => (
                        <label key={field.key} className="flex items-center justify-between gap-3 text-xs text-[#DADADA]">
                          <span>{field.label}</span>
                          <input
                            type="number"
                            min={0}
                            max={10}
                            step={1}
                            inputMode="numeric"
                            disabled={!canEditReview || detailLoading}
                            value={criteria[field.key] ?? ""}
                            onChange={(event) =>
                              setCriteria((prev) => ({
                                ...prev,
                                [field.key]: normalizeRubricScore(event.target.value),
                              }))
                            }
                            onKeyDown={(event) => {
                              if (["e", "E", "+", "-", ".", ","].includes(event.key)) {
                                event.preventDefault();
                              }
                            }}
                            className="h-8 w-20 rounded-lg border border-[#303030] bg-[#111111] px-2 text-right text-white"
                          />
                        </label>
                      ))}
                    </div>

                    <div>
                      <label className="text-xs font-semibold tracking-[1px] text-[#8BA3FF]">
                        Comentario general (opcional)
                      </label>
                      <textarea
                        value={generalComment}
                        disabled={!canEditReview || detailLoading}
                        onChange={(event) => setGeneralComment(event.target.value)}
                        rows={6}
                        className="mt-2 w-full rounded-xl border border-[#303030] bg-[#111111] p-3 text-sm text-white outline-none focus:border-[#5B68F1]"
                        placeholder="Escribe observaciones adicionales para la maqueta (opcional)."
                      />
                    </div>

                    {formError ? (
                      <p className="rounded-lg border border-[#8B1D1D] bg-[#451414] px-3 py-2 text-xs text-[#FFB4B4]">
                        {formError}
                      </p>
                    ) : null}
                    {detailError ? (
                      <p className="rounded-lg border border-[#8B1D1D] bg-[#451414] px-3 py-2 text-xs text-[#FFB4B4]">
                        {detailError}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!canEditReview || detailLoading}
                        onClick={() => void handleSaveDraft()}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#5B68F1]/60 bg-[#252B4A] px-4 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Guardar borrador
                        <Save className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={!canSubmitReview || detailLoading}
                        onClick={() => void handleSubmitReview()}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#10B981]/60 bg-[#17261E] px-4 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Enviar evaluación
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#9C9C9C]">{detailLoading ? "Cargando detalle..." : "Selecciona una maqueta."}</p>
            )}
          </div>
        </div>
      ) : null}
      {previewImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="w-full max-w-5xl rounded-2xl border border-[#2B2B2B] bg-[#121212] p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-xs font-medium text-[#DADADA]">{previewImage.fileName}</p>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#2F2F2F] text-[#E5E5E5]"
                aria-label="Cerrar previsualizacion"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto rounded-xl border border-[#262626] bg-black/30 p-2">
              <ImgWithSkeleton
                src={previewImage.url}
                alt={previewImage.fileName}
                className="mx-auto max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
