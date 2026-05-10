"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  ImageIcon,
  Minus,
  Plus,
  Save,
} from "lucide-react";
import type { JudgeReviewCriteria } from "@/domain/judge/judge.types";
import { getApiBaseUrl } from "@/core/api-base-url";
import { ImgWithSkeleton } from "@/presentation/components/ui";
import { useJudgeStore } from "@/presentation/stores";
import { judgeHeadingFont } from "./judge-heading-font";

type JudgeReviewPageProps = {
  modelId: string;
  backHref: string;
  level1Name: string;
  level2Name?: string | null;
  finalCategoryName: string;
  forceReadOnly?: boolean;
};

const MAX_CRITERION_SCORE = 10;
const MAX_TOTAL_SCORE = 30;

type CriteriaKey = "armado" | "pintura" | "detallesAgregados";

const criteriaConfig: Array<{
  key: CriteriaKey;
  label: string;
  description: string;
  accentClassName: string;
  trackClassName: string;
}> = [
  {
    key: "armado",
    label: "Armado",
    description: "Calidad del ensamble, estructura y solidez de la maqueta.",
    accentClassName: "text-[#8BA3FF]",
    trackClassName: "accent-[#6A78FF]",
  },
  {
    key: "pintura",
    label: "Pintura",
    description: "Acabado, uniformidad del color y limpieza de aplicacion.",
    accentClassName: "text-[#C09BFF]",
    trackClassName: "accent-[#8E6CF0]",
  },
  {
    key: "detallesAgregados",
    label: "Detalles agregados",
    description: "Nivel de detalle ornamental y elementos extra bien resueltos.",
    accentClassName: "text-[#F2B740]",
    trackClassName: "accent-[#F2B740]",
  },
];

const resolveMediaUrl = (input: { publicUrl: string | null; storageKey: string | null }) => {
  if (input.publicUrl) {
    return input.publicUrl;
  }

  if (!input.storageKey) {
    return null;
  }

  const apiBaseUrl = getApiBaseUrl();
  const apiOrigin = apiBaseUrl.replace(/\/api\/v1$/i, "");
  const normalizedStorageKey = input.storageKey.replace(/^\/+/, "");
  return `${apiOrigin}/uploads/${normalizedStorageKey}`;
};

const isImageMimeType = (mimeType: string) => mimeType.startsWith("image/");

const clampCriterionValue = (value: number) => Math.min(MAX_CRITERION_SCORE, Math.max(0, Math.trunc(value)));

const computeTotalScore = (criteria: JudgeReviewCriteria) =>
  criteriaConfig.reduce((sum, criterion) => sum + Number(criteria[criterion.key] ?? 0), 0);

const toInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "JZ";

export function JudgeReviewPage({
  modelId,
  backHref,
  level1Name,
  level2Name,
  finalCategoryName,
  forceReadOnly = false,
}: JudgeReviewPageProps) {
  const selectedModelId = useJudgeStore((state) => state.selectedModelId);
  const modelDetail = useJudgeStore((state) => state.modelDetail);
  const detailLoading = useJudgeStore((state) => state.detailLoading);
  const detailError = useJudgeStore((state) => state.detailError);
  const loading = useJudgeStore((state) => state.loading);
  const selectModel = useJudgeStore((state) => state.selectModel);
  const startReview = useJudgeStore((state) => state.startReview);
  const submitReview = useJudgeStore((state) => state.submitReview);

  const [criteriaDraft, setCriteriaDraft] = useState<JudgeReviewCriteria>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const startReviewTriggeredRef = useRef(false);

  useEffect(() => {
    if (selectedModelId === modelId && modelDetail?.id === modelId) {
      return;
    }

    void selectModel(modelId);
  }, [modelDetail?.id, modelId, selectModel, selectedModelId]);

  useEffect(() => {
    if (!modelDetail || modelDetail.id !== modelId) {
      return;
    }

    if (modelDetail.status !== "ENVIADA") {
      return;
    }

    if (modelDetail.myReview?.status === "SUBMITTED" || forceReadOnly) {
      return;
    }

    if (startReviewTriggeredRef.current) {
      return;
    }

    startReviewTriggeredRef.current = true;
    void startReview(modelId);
  }, [forceReadOnly, modelDetail, modelId, startReview]);

  const isSubmitted = modelDetail?.myReview?.status === "SUBMITTED";
  const readOnly = forceReadOnly || isSubmitted;
  const resolvedCriteria = useMemo(
    () => ({
      armado: criteriaDraft.armado ?? modelDetail?.myReview?.criteria?.armado ?? 0,
      pintura: criteriaDraft.pintura ?? modelDetail?.myReview?.criteria?.pintura ?? 0,
      detallesAgregados:
        criteriaDraft.detallesAgregados ?? modelDetail?.myReview?.criteria?.detallesAgregados ?? 0,
    }),
    [criteriaDraft, modelDetail?.myReview?.criteria?.armado, modelDetail?.myReview?.criteria?.detallesAgregados, modelDetail?.myReview?.criteria?.pintura],
  );
  const totalScore = useMemo(() => computeTotalScore(resolvedCriteria), [resolvedCriteria]);

  const setCriterionValue = (key: CriteriaKey, nextValue: number) => {
    if (readOnly) {
      return;
    }

    setCriteriaDraft((previous) => ({
      ...previous,
      [key]: clampCriterionValue(nextValue),
    }));
    setFormError(null);
    setFeedbackMessage(null);
  };

  const handleSubmit = async () => {
    if (!modelDetail || readOnly) {
      return;
    }

    const incomplete = criteriaConfig.some(
      (criterion) => typeof resolvedCriteria[criterion.key] !== "number",
    );

    if (incomplete) {
      setFormError("Completa los 3 criterios antes de guardar.");
      return;
    }

    setFormError(null);
    setFeedbackMessage(null);

    const result = await submitReview(modelDetail.id, {
      criteria: {
        armado: Number(resolvedCriteria.armado ?? 0),
        pintura: Number(resolvedCriteria.pintura ?? 0),
        detallesAgregados: Number(resolvedCriteria.detallesAgregados ?? 0),
      },
    });

    if (result) {
      setFeedbackMessage("Calificacion enviada correctamente.");
    }
  };

  if (detailLoading && (!modelDetail || modelDetail.id !== modelId)) {
    return (
      <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-6 text-sm text-[#B8B8B8]">
        Cargando evaluacion...
      </section>
    );
  }

  if (detailError && (!modelDetail || modelDetail.id !== modelId)) {
    return (
      <section className="rounded-3xl border border-[#8B1D1D] bg-[#451414] p-6 text-sm text-[#FFB4B4]">
        {detailError}
      </section>
    );
  }

  if (!modelDetail || modelDetail.id !== modelId) {
    return (
      <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6 text-sm text-[#9C9C9C]">
        No se encontro el detalle de la maqueta.
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[#1E1E1E] bg-[#101010] p-5 sm:p-6 md:p-8 xl:p-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[#8E8E8E]">
            {level1Name}
            {level2Name ? ` / ${level2Name}` : ""}
            {" / "}
            <span className="font-semibold text-[#8BA3FF]">{finalCategoryName}</span>
          </p>
          <h2 className={`${judgeHeadingFont.className} mt-2 text-3xl font-bold text-white sm:text-4xl`}>
            Evaluar maqueta
          </h2>
        </div>
        <Link
          href={backHref}
          className="inline-flex h-9 items-center justify-center rounded-[18px] border border-[#303030] px-4 text-xs font-semibold text-[#D7D7D7]"
        >
          Volver
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#252525] bg-[#151515] p-5">
            <p className="text-xs text-[#838383]">
              {modelDetail.category.name} · <span className="text-[#5E6BFF]">{modelDetail.code}</span>
            </p>
            <h3 className={`${judgeHeadingFont.className} mt-2 text-3xl font-bold text-white`}>
              {modelDetail.nombreModelo}
            </h3>
            <p className="mt-1 text-sm text-[#AAAAAA]">{modelDetail.participant.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  readOnly
                    ? "border-[#1F5B3A] bg-[#123425] text-[#53D58D]"
                    : "border-[#5B68F1]/50 bg-[#1F2440] text-[#AEB8FF]"
                }`}
              >
                {readOnly ? "Evaluada" : "Pendiente"}
              </span>
              <span className="inline-flex rounded-full border border-[#303030] bg-[#171717] px-2.5 py-1 text-xs text-[#CFCFCF]">
                Evento: {modelDetail.event.name}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#252525] bg-[#151515] p-5 text-sm text-[#D1D1D1]">
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <span className="text-[#8E8E8E]">Nombre:</span> {modelDetail.nombreModelo}
              </p>
              <p>
                <span className="text-[#8E8E8E]">Codigo:</span> {modelDetail.code}
              </p>
              <p>
                <span className="text-[#8E8E8E]">Categoria:</span> {modelDetail.category.label}
              </p>
              <p>
                <span className="text-[#8E8E8E]">Marca:</span> {modelDetail.brand || "No registrada"}
              </p>
              <p>
                <span className="text-[#8E8E8E]">Participante:</span> {modelDetail.participant.name}
              </p>
            </div>
            <p className="mt-3 text-[#AAAAAA]">{modelDetail.description || "Sin descripcion registrada."}</p>
          </div>

          <div className="rounded-2xl border border-[#252525] bg-[#151515] p-5">
            <p className="text-xs font-semibold tracking-[1.5px] text-[#8BA3FF]">FOTOS Y DOCUMENTOS</p>
            {modelDetail.media.length === 0 ? (
              <p className="mt-3 rounded-xl border border-[#2C2C2C] bg-[#111111] px-3 py-2 text-sm text-[#9D9D9D]">
                Esta maqueta no tiene archivos adjuntos.
              </p>
            ) : (
              <>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {modelDetail.media.map((media) => {
                    const mediaUrl = resolveMediaUrl(media);
                    const isImage = isImageMimeType(media.mimeType);

                    return (
                      <article key={media.id} className="overflow-hidden rounded-xl border border-[#2C2C2C] bg-[#101010]">
                        <div className="flex h-28 items-center justify-center bg-[#171717]">
                          {mediaUrl && isImage ? (
                            <ImgWithSkeleton
                              src={mediaUrl}
                              alt={media.fileName}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : isImage ? (
                            <ImageIcon className="h-5 w-5 text-[#7A7A7A]" />
                          ) : (
                            <FileText className="h-5 w-5 text-[#7A7A7A]" />
                          )}
                        </div>
                        <div className="space-y-1 px-3 py-2">
                          <p className="truncate text-xs font-medium text-[#DADADA]">{media.fileName}</p>
                          {mediaUrl ? (
                            <a
                              href={mediaUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex text-xs font-semibold text-[#8BA3FF] underline"
                            >
                              Abrir archivo
                            </a>
                          ) : (
                            <p className="text-xs text-[#FFB4B4]">Sin URL disponible</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[1.5px] text-[#8BA3FF]">CRITERIOS DE CALIFICACION</p>
            {criteriaConfig.map((criterion) => {
              const value = Number(resolvedCriteria[criterion.key] ?? 0);
              return (
                <article key={criterion.key} className="rounded-2xl border border-[#252525] bg-[#151515] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{criterion.label}</p>
                      <p className="mt-1 text-xs text-[#A7A7A7]">{criterion.description}</p>
                    </div>
                    <p className={`text-2xl font-bold ${criterion.accentClassName}`}>
                      {value}
                      <span className="text-sm text-[#8A8A8A]"> / 10</span>
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-[36px_1fr_36px] items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCriterionValue(criterion.key, value - 1)}
                      disabled={readOnly || loading}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2F2F2F] bg-[#111111] text-[#D0D0D0] disabled:opacity-45"
                      aria-label={`Reducir puntaje de ${criterion.label}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={MAX_CRITERION_SCORE}
                      step={1}
                      value={value}
                      onChange={(event) => setCriterionValue(criterion.key, Number(event.target.value))}
                      disabled={readOnly || loading}
                      className={`h-1.5 w-full cursor-pointer rounded-lg bg-[#232323] ${criterion.trackClassName}`}
                      aria-label={`Puntaje de ${criterion.label}`}
                    />
                    <button
                      type="button"
                      onClick={() => setCriterionValue(criterion.key, value + 1)}
                      disabled={readOnly || loading}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2F2F2F] bg-[#111111] text-[#D0D0D0] disabled:opacity-45"
                      aria-label={`Aumentar puntaje de ${criterion.label}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[#252525] bg-[#151515] p-5">
            <p className="text-xs font-semibold tracking-[1.5px] text-[#5C6CFF]">RESUMEN DE CALIFICACION</p>
            <div className="mt-4 rounded-xl border border-[#2E2E2E] bg-[#111111] px-4 py-5">
              <p className="text-center text-[11px] font-semibold tracking-[1px] text-[#8A8A8A]">PUNTAJE JUEZ ACTUAL</p>
              <p className="mt-2 text-center text-6xl font-bold text-white">
                {readOnly
                  ? Number(modelDetail.myReview?.totalScore ?? 0)
                  : totalScore}
              </p>
              <p className="text-center text-xs text-[#7D7D7D]">de {MAX_TOTAL_SCORE} puntos posibles</p>
            </div>
            <div className="mt-4 space-y-2">
              {criteriaConfig.map((criterion) => (
                <div key={criterion.key} className="flex items-center justify-between text-sm">
                  <span className="text-[#BFBFBF]">{criterion.label}</span>
                  <span className={`${criterion.accentClassName} font-semibold`}>
                    {Number(resolvedCriteria[criterion.key] ?? 0)} / {MAX_CRITERION_SCORE}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#252525] bg-[#151515] p-5">
            <p className="text-xs font-semibold tracking-[1.5px] text-[#5C6CFF]">CALIFICACIONES DEL PANEL</p>
            <div className="mt-3 space-y-2">
              {modelDetail.panelReviews.map((panelReview) => {
                const statusLabel =
                  panelReview.status === "SUBMITTED"
                    ? "Enviada"
                    : panelReview.status === "DRAFT"
                      ? "En borrador"
                      : "Pendiente";

                return (
                  <article
                    key={panelReview.judgeUserId}
                    className={`rounded-xl border px-3 py-2 ${
                      panelReview.isCurrentJudge
                        ? "border-[#5B68F1] bg-[#151A35]"
                        : "border-[#2F2F2F] bg-[#111111]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#2A315B] text-[11px] font-semibold text-[#C9D3FF]">
                          {toInitials(panelReview.judgeName)}
                        </span>
                        <p className="text-sm font-semibold text-[#EAEAEA]">
                          {panelReview.judgeName}
                          {panelReview.isCurrentJudge ? " (Tu)" : ""}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-[#DCDCDC]">
                        {panelReview.totalScore !== null ? `${panelReview.totalScore} pts` : "--"}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#9C9C9C]">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {statusLabel}
                      </span>
                      {panelReview.criteria ? (
                        <span>
                          Armado: {panelReview.criteria.armado ?? 0} · Pintura: {panelReview.criteria.pintura ?? 0} ·
                          Agregados: {panelReview.criteria.detallesAgregados ?? 0}
                        </span>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#294378] bg-[#122446] px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[1px] text-[#88A8FF]">PROMEDIO FINAL DE MAQUETA</p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <p className="text-xs text-[#9DB4E8]">
                {modelDetail.reviewSummary.submittedJudgeCount} de {modelDetail.reviewSummary.assignedJudgeCount} jueces enviaron
              </p>
              <p className="text-4xl font-bold text-[#E7F0FF]">
                {modelDetail.reviewSummary.averageScore !== null ? modelDetail.reviewSummary.averageScore : "--"}
              </p>
            </div>
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
          {feedbackMessage ? (
            <p className="rounded-lg border border-[#1F5B3A] bg-[#123425] px-3 py-2 text-xs text-[#9AF4C0]">
              {feedbackMessage}
            </p>
          ) : null}

          {!readOnly ? (
            <button
              type="button"
              disabled={loading || detailLoading}
              onClick={() => void handleSubmit()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#5B68F1]/70 bg-[#5A66EE] px-4 text-sm font-semibold text-white disabled:opacity-55"
            >
              <Save className="h-4 w-4" />
              Guardar calificacion
            </button>
          ) : (
            <p className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1F5B3A] bg-[#123425] px-4 py-3 text-sm font-semibold text-[#9AF4C0]">
              <CheckCircle2 className="h-4 w-4" />
              Calificacion enviada (solo lectura)
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
