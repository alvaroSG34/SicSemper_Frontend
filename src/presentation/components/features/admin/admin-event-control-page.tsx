"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Outfit } from "next/font/google";
import { ArrowLeft, Eye, FileText, Image as ImageIcon, Medal, ShieldCheck, ShieldX } from "lucide-react";
import { createAdminAccessMatrix } from "@/presentation/components/features/admin/admin-access-matrix";
import { useAdminEventControl } from "@/presentation/components/features/admin/use-admin-event-control";
import { useAuthStore, useAdminStore } from "@/presentation/stores";
import { ImageWithSkeleton } from "@/presentation/components/ui";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

type EventControlTab = "resumen" | "participantes" | "maquetas";

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return dateFormatter.format(date);
};

const formatScore = (value: number | null) => {
  if (typeof value !== "number") {
    return "-";
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
};

const formatPercent = (value: number | null | undefined) => {
  if (typeof value !== "number") {
    return "0.00%";
  }
  return `${value.toFixed(2)}%`;
};

const formatActivityType = (type: "REGISTRATION_CREATED" | "MODEL_CREATED" | "JUDGE_REVIEW_SUBMITTED") => {
  if (type === "REGISTRATION_CREATED") {
    return "Inscripción";
  }
  if (type === "MODEL_CREATED") {
    return "Maqueta";
  }
  return "Evaluación";
};

export function AdminEventControlPage({ eventId }: { eventId: string }) {
  const user = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.currentRole);
  const dashboard = useAdminStore((state) => state.dashboard);
  const summarySnapshot = useAdminStore((state) => state.summary);
  const loadSummary = useAdminStore((state) => state.loadSummary);

  const [activeTab, setActiveTab] = useState<EventControlTab>("resumen");

  useEffect(() => {
    if (!dashboard && !summarySnapshot) {
      void loadSummary();
    }
  }, [dashboard, loadSummary, summarySnapshot]);

  const isSuperadmin = currentRole === "SUPERADMIN" || Boolean(user?.roles.includes("SUPERADMIN"));
  const effectivePermissions = useMemo(
    () => dashboard?.effectivePermissions ?? summarySnapshot?.effectivePermissions ?? [],
    [dashboard?.effectivePermissions, summarySnapshot?.effectivePermissions],
  );
  const access = useMemo(
    () => createAdminAccessMatrix(effectivePermissions, isSuperadmin),
    [effectivePermissions, isSuperadmin],
  );
  const canReadEventControl = access.module.events.read;
  const canManageUsers = access.module.users.update;
  const canManagePodiumTieBreak = isSuperadmin;

  const {
    loading,
    error,
    pendingAction,
    summary,
    participants,
    participantsFilters,
    setParticipantsFilters,
    participantsPage,
    setParticipantsPage,
    participantsPageSize,
    setParticipantsPageSize,
    participantSummary,
    selectedParticipantDetail,
    setSelectedParticipantDetail,
    openParticipantDetail,
    setParticipantVerifiedFromList,
    toggleParticipantBanFromList,
    models,
    modelsFilters,
    setModelsFilters,
    modelsPage,
    setModelsPage,
    modelsPageSize,
    setModelsPageSize,
    modelsSummary,
    selectedModelDetail,
    setSelectedModelDetail,
    openModelDetail,
    selectedTieBreakContext,
    selectTieBreakContext,
    podiumTieBreakState,
    podiumTieBreakOrder,
    loadingTieBreak,
    moveTieBreakCandidate,
    savePodiumTieBreak,
    clearPodiumTieBreak,
  } = useAdminEventControl({
    eventId,
    canManageUsers,
    canManagePodiumTieBreak,
  });

  const tieBreakContextOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: Array<{ finalCategoryId: string; scaleId: string; label: string }> = [];
    const pushOption = (input: {
      finalCategoryId?: string;
      scaleId?: string;
      categoryLabel?: string;
      scaleValue?: string;
    }) => {
      if (!input.finalCategoryId || !input.scaleId) {
        return;
      }
      const key = `${input.finalCategoryId}:${input.scaleId}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      options.push({
        finalCategoryId: input.finalCategoryId,
        scaleId: input.scaleId,
        label: `${input.categoryLabel ?? "Categoria"} · ${input.scaleValue ?? "Escala"}`,
      });
    };

    models.forEach((row) => {
      pushOption({
        finalCategoryId: row.finalCategoryId,
        scaleId: row.scaleId,
        categoryLabel: row.categoryLabel,
        scaleValue: row.scaleValue,
      });
    });

    summary?.topSegmentsByScore.forEach((segment) => {
      pushOption({
        finalCategoryId: segment.finalCategoryId,
        scaleId: segment.scaleId,
        categoryLabel: segment.categoryLabel,
        scaleValue: segment.scaleValue,
      });
    });
    summary?.topSegmentsByVolume.forEach((segment) => {
      pushOption({
        finalCategoryId: segment.finalCategoryId,
        scaleId: segment.scaleId,
        categoryLabel: segment.categoryLabel,
        scaleValue: segment.scaleValue,
      });
    });

    return options;
  }, [models, summary]);

  if (!canReadEventControl) {
    return (
      <main className="min-h-screen bg-[#000000] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 xl:px-[50px] xl:py-[50px]">
        <div className="mx-auto w-full max-w-[1400px]">
          <Link
            href="/admin/eventos"
            className="mb-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a eventos
          </Link>
          <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#B8B8B8]">
            No tienes permisos para acceder al centro de control de eventos.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#000000] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 xl:px-[50px] xl:py-[50px]">
      <div className="mx-auto w-full max-w-[1500px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/admin/eventos"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a eventos
            </Link>
            <h1 className={`${outfit.className} mt-3 text-3xl font-semibold text-white`}>
              Centro de control
            </h1>
            <p className="mt-1 text-sm text-[#9C9C9C]">
              {summary?.eventName ?? "Evento"}
            </p>
          </div>
        </div>

        {error ? (
          <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("resumen")}
            className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold ${
              activeTab === "resumen"
                ? "border border-[#5B68F1] bg-[rgba(91,104,241,0.2)] text-white"
                : "border border-[#2D2D2D] text-[#D1D1D1]"
            }`}
          >
            Resumen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("participantes")}
            className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold ${
              activeTab === "participantes"
                ? "border border-[#5B68F1] bg-[rgba(91,104,241,0.2)] text-white"
                : "border border-[#2D2D2D] text-[#D1D1D1]"
            }`}
          >
            Participantes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("maquetas")}
            className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold ${
              activeTab === "maquetas"
                ? "border border-[#5B68F1] bg-[rgba(91,104,241,0.2)] text-white"
                : "border border-[#2D2D2D] text-[#D1D1D1]"
            }`}
          >
            Maquetas
          </button>
        </div>

        {activeTab === "resumen" ? (
          <>
          <section className="hidden">
            <article className="rounded-2xl border border-[#2D2D2D] bg-[#161616] p-4">
              <p className="text-xs text-[#9C9C9C]">Inscripciones</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {summary?.registrationsCount ?? 0}
              </p>
            </article>
            <article className="rounded-2xl border border-[#2D2D2D] bg-[#161616] p-4">
              <p className="text-xs text-[#9C9C9C]">Participantes únicos</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {summary?.uniqueParticipantsCount ?? 0}
              </p>
            </article>
            <article className="rounded-2xl border border-[#2D2D2D] bg-[#161616] p-4">
              <p className="text-xs text-[#9C9C9C]">Maquetas</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {summary?.modelsCount ?? 0}
              </p>
              <p className="mt-2 text-xs text-[#9C9C9C]">
                ENVIADA {summary?.modelsEnviadasCount ?? 0} · EN_REVISION {summary?.modelsEnRevisionCount ?? 0} · CALIFICADA {summary?.modelsCalificadasCount ?? 0}
              </p>
            </article>
            <article className="rounded-2xl border border-[#2D2D2D] bg-[#161616] p-4">
              <p className="text-xs text-[#9C9C9C]">Promedio final</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {summary?.averageFinalScore !== null && summary?.averageFinalScore !== undefined
                  ? summary.averageFinalScore.toFixed(2)
                  : "-"}
              </p>
            </article>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-[#2D2D2D] bg-[#161616] p-4">
              <p className="text-xs uppercase tracking-[0.5px] text-[#9C9C9C]">Salud del evento</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Estado</p>
                  <p className="mt-1 text-lg font-semibold text-white">{summary?.eventStatus ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Organizador</p>
                  <p className="mt-1 text-sm font-semibold text-white">{summary?.organizerClubName ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Inicio</p>
                  <p className="mt-1 text-sm font-semibold text-white">{formatDateTime(summary?.startDate)}</p>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Fin</p>
                  <p className="mt-1 text-sm font-semibold text-white">{formatDateTime(summary?.endDate)}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Verificados</p>
                  <p className="mt-1 text-xl font-semibold text-white">{summary?.verifiedParticipantsCount ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Sin verificar</p>
                  <p className="mt-1 text-xl font-semibold text-white">{summary?.unverifiedParticipantsCount ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Suspendidos</p>
                  <p className="mt-1 text-xl font-semibold text-white">{summary?.suspendedParticipantsCount ?? 0}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-[#2D2D2D] bg-[#161616] p-4">
              <p className="text-xs uppercase tracking-[0.5px] text-[#9C9C9C]">Embudo operativo</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Inscripciones</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{summary?.registrationsCount ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Participantes únicos</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{summary?.uniqueParticipantsCount ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Con maquetas</p>
                  <p className="mt-1 text-xl font-semibold text-white">{summary?.participantsWithModelsCount ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Sin maquetas</p>
                  <p className="mt-1 text-xl font-semibold text-white">{summary?.participantsWithoutModelsCount ?? 0}</p>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                <p className="text-[11px] text-[#9C9C9C]">Maquetas</p>
                <p className="mt-1 text-2xl font-semibold text-white">{summary?.modelsCount ?? 0}</p>
                <p className="mt-1 text-xs text-[#9C9C9C]">
                  ENVIADA {summary?.modelsEnviadasCount ?? 0} · EN_REVISION {summary?.modelsEnRevisionCount ?? 0} · CALIFICADA {summary?.modelsCalificadasCount ?? 0}
                </p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Tasa de calificación</p>
                  <p className="mt-1 text-xl font-semibold text-white">{formatPercent(summary?.qualifiedModelsRate)}</p>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Pendientes de revisión</p>
                  <p className="mt-1 text-xl font-semibold text-white">{summary?.pendingReviewModelsCount ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Reviews enviadas</p>
                  <p className="mt-1 text-xl font-semibold text-white">{summary?.judgeReviewsSubmittedCount ?? 0}</p>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Reviews draft</p>
                  <p className="mt-1 text-xl font-semibold text-white">{summary?.judgeReviewsDraftCount ?? 0}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-[#2D2D2D] bg-[#161616] p-4">
              <p className="text-xs uppercase tracking-[0.5px] text-[#9C9C9C]">Podio operativo por segmento</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Top por puntaje</p>
                  <div className="mt-2 space-y-2">
                    {summary?.topSegmentsByScore.length ? summary.topSegmentsByScore.map((segment, index) => (
                      <div key={`${segment.eventCategoryId}-${segment.scaleId}`} className="rounded-lg border border-[#2A2A2A] bg-[#141414] p-2">
                        <p className="flex items-center gap-2 text-xs font-semibold text-white">
                          <Medal className="h-3.5 w-3.5 text-[#F6C453]" />
                          #{index + 1} · {segment.categoryLabel} · {segment.scaleValue}
                        </p>
                        <p className="mt-1 text-[11px] text-[#9C9C9C]">
                          Promedio {formatScore(segment.averageFinalScore)} · {segment.modelsCount} maqueta(s)
                        </p>
                      </div>
                    )) : <p className="text-xs text-[#9C9C9C]">No hay segmentos calificados todavía.</p>}
                  </div>
                </div>
                <div className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Top por volumen</p>
                  <div className="mt-2 space-y-2">
                    {summary?.topSegmentsByVolume.length ? summary.topSegmentsByVolume.map((segment, index) => (
                      <div key={`${segment.eventCategoryId}-${segment.scaleId}`} className="rounded-lg border border-[#2A2A2A] bg-[#141414] p-2">
                        <p className="text-xs font-semibold text-white">
                          #{index + 1} · {segment.categoryLabel} · {segment.scaleValue}
                        </p>
                        <p className="mt-1 text-[11px] text-[#9C9C9C]">
                          {segment.modelsCount} maqueta(s) · Promedio {formatScore(segment.averageFinalScore)}
                        </p>
                      </div>
                    )) : <p className="text-xs text-[#9C9C9C]">No hay maquetas registradas todavía.</p>}
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-[#2D2D2D] bg-[#161616] p-4">
              <p className="text-xs uppercase tracking-[0.5px] text-[#9C9C9C]">Actividad reciente</p>
              <div className="mt-3 space-y-2">
                {summary?.recentActivity.length ? summary.recentActivity.map((item, index) => (
                  <div key={`${item.type}-${item.timestamp}-${index}`} className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white">{formatActivityType(item.type)} · {item.actorName}</p>
                      <span className="text-[11px] text-[#9C9C9C]">{formatDateTime(item.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#BDBDBD]">{item.detail}</p>
                  </div>
                )) : <p className="text-xs text-[#9C9C9C]">Sin actividad reciente para este evento.</p>}
              </div>
            </article>
          </section>
          </>
        ) : null}

        {activeTab === "participantes" ? (
          <section className="rounded-2xl border border-[#2D2D2D] bg-[#161616] p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input
                value={participantsFilters.search}
                onChange={(event) =>
                  setParticipantsFilters((prev) => ({ ...prev, search: event.target.value }))
                }
                placeholder="Buscar por nombre o correo"
                className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
              />
              <select
                value={participantsFilters.userStatus}
                onChange={(event) =>
                  setParticipantsFilters((prev) => ({
                    ...prev,
                    userStatus: event.target.value as typeof prev.userStatus,
                  }))
                }
                className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
              >
                <option value="">Estado usuario: todos</option>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
                <option value="SUSPENDIDO">SUSPENDIDO</option>
              </select>
              <select
                value={participantsFilters.registrationStatus}
                onChange={(event) =>
                  setParticipantsFilters((prev) => ({
                    ...prev,
                    registrationStatus: event.target.value as typeof prev.registrationStatus,
                  }))
                }
                className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
              >
                <option value="">Estado inscripción: todos</option>
                <option value="ACTIVA">ACTIVA</option>
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="CANCELADA">CANCELADA</option>
              </select>
              <select
                value={participantsFilters.verified}
                onChange={(event) =>
                  setParticipantsFilters((prev) => ({
                    ...prev,
                    verified: event.target.value as typeof prev.verified,
                  }))
                }
                className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
              >
                <option value="">Verificación: todos</option>
                <option value="true">Verificados</option>
                <option value="false">Sin verificar</option>
              </select>
              <button
                type="button"
                onClick={() => setParticipantsPage(1)}
                className="h-10 rounded-lg border border-[#5B68F1] bg-[rgba(91,104,241,0.2)] px-3 text-sm font-semibold text-white"
              >
                Aplicar filtros
              </button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-[#2D2D2D]">
              <table className="min-w-[980px] w-full text-left">
                <thead className="bg-[#101010] text-xs uppercase tracking-[0.5px] text-[#9C9C9C]">
                  <tr>
                    <th className="px-3 py-3">Participante</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3">Verificado</th>
                    <th className="px-3 py-3">Inscripciones</th>
                    <th className="px-3 py-3">Maquetas</th>
                    <th className="px-3 py-3">Última inscripción</th>
                    <th className="px-3 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((row) => {
                    const isSuspended = row.status === "SUSPENDIDO";
                    const actionKeyVerified = `participant:verified:${row.userId}`;
                    const actionKeyBan = `participant:ban:${row.userId}`;
                    return (
                      <tr key={row.userId} className="border-t border-[#252525] text-sm">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-white">{row.name}</p>
                          <p className="text-xs text-[#9C9C9C]">{row.email}</p>
                        </td>
                        <td className="px-3 py-3 text-[#D1D1D1]">{row.status}</td>
                        <td className="px-3 py-3 text-[#D1D1D1]">{row.verified ? "SI" : "NO"}</td>
                        <td className="px-3 py-3 text-[#D1D1D1]">{row.registrationsCount}</td>
                        <td className="px-3 py-3 text-[#D1D1D1]">{row.modelsCount}</td>
                        <td className="px-3 py-3 text-[#D1D1D1]">{formatDateTime(row.lastRegistrationDate)}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => void openParticipantDetail(row.userId)}
                              disabled={pendingAction === `participant:detail:${row.userId}`}
                              className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#2D2D2D] px-3 text-xs text-white disabled:opacity-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Detalle
                            </button>
                            {canManageUsers ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void setParticipantVerifiedFromList(row.userId, !row.verified)
                                  }
                                  disabled={pendingAction === actionKeyVerified}
                                  className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#2D2D2D] px-3 text-xs text-white disabled:opacity-50"
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  {row.verified ? "Quitar verif." : "Verificar"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void toggleParticipantBanFromList(row.userId, isSuspended)
                                  }
                                  disabled={pendingAction === actionKeyBan}
                                  className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#2D2D2D] px-3 text-xs text-white disabled:opacity-50"
                                >
                                  <ShieldX className="h-3.5 w-3.5" />
                                  {isSuspended ? "Reactivar" : "Suspender"}
                                </button>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#9C9C9C]">
                {participantSummary.total} registro(s) · Página {participantSummary.page} de {participantSummary.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={participantsPageSize}
                  onChange={(event) => {
                    setParticipantsPageSize(Number(event.target.value));
                    setParticipantsPage(1);
                  }}
                  className="h-8 rounded-lg border border-[#2D2D2D] bg-[#101010] px-2 text-xs text-white"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <button
                  type="button"
                  disabled={participantsPage <= 1}
                  onClick={() => setParticipantsPage((current) => Math.max(1, current - 1))}
                  className="h-8 rounded-lg border border-[#2D2D2D] px-3 text-xs text-white disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={participantsPage >= participantSummary.totalPages}
                  onClick={() =>
                    setParticipantsPage((current) => Math.min(participantSummary.totalPages, current + 1))
                  }
                  className="h-8 rounded-lg border border-[#2D2D2D] px-3 text-xs text-white disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "maquetas" ? (
          <section className="rounded-2xl border border-[#2D2D2D] bg-[#161616] p-4 sm:p-5">
            <div className="mb-5 rounded-xl border border-[#2D2D2D] bg-[#101010] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Desempate de podio</p>
                  <p className="mt-1 text-xs text-[#9C9C9C]">
                    Define orden manual solo cuando hay empate que impacta top 3.
                  </p>
                </div>
                {!canManagePodiumTieBreak ? (
                  <span className="rounded-full border border-[#2D2D2D] px-2 py-1 text-[11px] text-[#BDBDBD]">
                    Solo lectura
                  </span>
                ) : null}
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <select
                  value={
                    selectedTieBreakContext
                      ? `${selectedTieBreakContext.finalCategoryId}:${selectedTieBreakContext.scaleId}`
                      : ""
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) {
                      void selectTieBreakContext(null);
                      return;
                    }
                    const [finalCategoryId, scaleId] = value.split(":");
                    if (!finalCategoryId || !scaleId) {
                      return;
                    }
                    void selectTieBreakContext({ finalCategoryId, scaleId });
                  }}
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 text-sm text-white outline-none"
                >
                  <option value="">Selecciona categoria y escala</option>
                  {tieBreakContextOptions.map((option) => (
                    <option
                      key={`${option.finalCategoryId}:${option.scaleId}`}
                      value={`${option.finalCategoryId}:${option.scaleId}`}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                {selectedTieBreakContext ? (
                  <button
                    type="button"
                    onClick={() => void selectTieBreakContext(selectedTieBreakContext)}
                    className="h-10 rounded-lg border border-[#2D2D2D] px-3 text-sm text-white"
                  >
                    Actualizar
                  </button>
                ) : null}
              </div>
              {tieBreakContextOptions.length === 0 ? (
                <p className="mt-2 text-xs text-[#9C9C9C]">
                  No hay categorias/escalas disponibles para desempate en este evento.
                </p>
              ) : null}

              {loadingTieBreak ? (
                <p className="mt-3 text-xs text-[#9C9C9C]">Cargando candidatos...</p>
              ) : null}

              {podiumTieBreakState ? (
                <div className="mt-3 space-y-3">
                  {podiumTieBreakState.locked ? (
                    <p className="rounded-lg border border-[#8B1D1D] bg-[#451414] px-3 py-2 text-xs text-[#FFB4B4]">
                      El evento esta finalizado. El desempate queda bloqueado.
                    </p>
                  ) : null}
                  {podiumTieBreakState.candidates.length === 0 ? (
                    <p className="rounded-lg border border-[#2D2D2D] bg-[#141414] px-3 py-2 text-xs text-[#9C9C9C]">
                      No hay empate en podio para este contexto.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {podiumTieBreakOrder
                          .map((modelId) =>
                            podiumTieBreakState.candidates.find((candidate) => candidate.modelId === modelId),
                          )
                          .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
                          .map((candidate, index) => (
                            <div
                              key={candidate.modelId}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#2D2D2D] bg-[#141414] px-3 py-2"
                            >
                              <div>
                                <p className="text-xs font-semibold text-white">
                                  {index + 1}. {candidate.nombreModelo}
                                </p>
                                <p className="text-[11px] text-[#9C9C9C]">
                                  {candidate.participantName} · Puntaje {formatScore(candidate.finalScore)} ·
                                  Auto #{candidate.automaticRank}
                                </p>
                              </div>
                              {canManagePodiumTieBreak && !podiumTieBreakState.locked ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => moveTieBreakCandidate(candidate.modelId, "up")}
                                    className="h-8 rounded-lg border border-[#2D2D2D] px-2 text-xs text-white"
                                  >
                                    Subir
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveTieBreakCandidate(candidate.modelId, "down")}
                                    className="h-8 rounded-lg border border-[#2D2D2D] px-2 text-xs text-white"
                                  >
                                    Bajar
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={
                            !canManagePodiumTieBreak ||
                            podiumTieBreakState.locked ||
                            pendingAction === "podium-tiebreak:save"
                          }
                          onClick={() => void savePodiumTieBreak()}
                          className="h-9 rounded-lg border border-[#0B8F5D] bg-[#0F6C47] px-3 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Guardar desempate
                        </button>
                        <button
                          type="button"
                          disabled={
                            !canManagePodiumTieBreak ||
                            podiumTieBreakState.locked ||
                            pendingAction === "podium-tiebreak:clear"
                          }
                          onClick={() => void clearPodiumTieBreak()}
                          className="h-9 rounded-lg border border-[#8B1D1D] bg-[#4C1515] px-3 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Volver a automatico
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input
                value={modelsFilters.search}
                onChange={(event) =>
                  setModelsFilters((prev) => ({ ...prev, search: event.target.value }))
                }
                placeholder="Buscar por maqueta/codigo/participante"
                className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
              />
              <select
                value={modelsFilters.status}
                onChange={(event) =>
                  setModelsFilters((prev) => ({
                    ...prev,
                    status: event.target.value as typeof prev.status,
                  }))
                }
                className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
              >
                <option value="">Estado: todos</option>
                <option value="ENVIADA">ENVIADA</option>
                <option value="EN_REVISION">EN_REVISION</option>
                <option value="CALIFICADA">CALIFICADA</option>
              </select>
              <select
                value={modelsFilters.sort}
                onChange={(event) =>
                  setModelsFilters((prev) => ({
                    ...prev,
                    sort: event.target.value as typeof prev.sort,
                  }))
                }
                className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
              >
                <option value="SCORE_DESC">Calificación mayor</option>
                <option value="SCORE_ASC">Calificación menor</option>
                <option value="DATE_DESC">Más recientes</option>
                <option value="DATE_ASC">Más antiguas</option>
              </select>
              <button
                type="button"
                onClick={() => setModelsPage(1)}
                className="h-10 rounded-lg border border-[#5B68F1] bg-[rgba(91,104,241,0.2)] px-3 text-sm font-semibold text-white"
              >
                Aplicar filtros
              </button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-[#2D2D2D]">
              <table className="min-w-[980px] w-full text-left">
                <thead className="bg-[#101010] text-xs uppercase tracking-[0.5px] text-[#9C9C9C]">
                  <tr>
                    <th className="px-3 py-3">Maqueta</th>
                    <th className="px-3 py-3">Participante</th>
                    <th className="px-3 py-3">Categoría</th>
                    <th className="px-3 py-3">Escala</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3">Puntaje</th>
                    <th className="px-3 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((row) => (
                    <tr key={row.id} className="border-t border-[#252525] text-sm">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-white">{row.nombreModelo}</p>
                        <p className="text-xs text-[#9C9C9C]">Código {row.code}</p>
                      </td>
                      <td className="px-3 py-3 text-[#D1D1D1]">
                        <p>{row.participantName}</p>
                        <p className="text-xs text-[#9C9C9C]">{row.participantEmail}</p>
                      </td>
                      <td className="px-3 py-3 text-[#D1D1D1]">{row.categoryLabel}</td>
                      <td className="px-3 py-3 text-[#D1D1D1]">{row.scaleValue}</td>
                      <td className="px-3 py-3 text-[#D1D1D1]">{row.status}</td>
                      <td className="px-3 py-3 text-[#D1D1D1]">{formatScore(row.finalScore)}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => void openModelDetail(row.id)}
                          disabled={pendingAction === `model:detail:${row.id}`}
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#2D2D2D] px-3 text-xs text-white disabled:opacity-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#9C9C9C]">
                {modelsSummary.total} registro(s) · Página {modelsSummary.page} de {modelsSummary.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={modelsPageSize}
                  onChange={(event) => {
                    setModelsPageSize(Number(event.target.value));
                    setModelsPage(1);
                  }}
                  className="h-8 rounded-lg border border-[#2D2D2D] bg-[#101010] px-2 text-xs text-white"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <button
                  type="button"
                  disabled={modelsPage <= 1}
                  onClick={() => setModelsPage((current) => Math.max(1, current - 1))}
                  className="h-8 rounded-lg border border-[#2D2D2D] px-3 text-xs text-white disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={modelsPage >= modelsSummary.totalPages}
                  onClick={() =>
                    setModelsPage((current) => Math.min(modelsSummary.totalPages, current + 1))
                  }
                  className="h-8 rounded-lg border border-[#2D2D2D] px-3 text-xs text-white disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {loading ? (
          <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
            Cargando centro de control...
          </p>
        ) : null}
      </div>

      {selectedParticipantDetail ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className={`${outfit.className} text-[20px] font-semibold text-white`}>
                  {selectedParticipantDetail.user.name}
                </h4>
                <p className="text-xs text-[#9C9C9C]">{selectedParticipantDetail.user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParticipantDetail(null)}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs text-white"
              >
                Cerrar
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-3">
                <p className="text-xs text-[#9C9C9C]">Inscripciones</p>
                <div className="mt-2 max-h-[280px] space-y-2 overflow-y-auto pr-1">
                  {selectedParticipantDetail.registrations.map((registration) => (
                    <div key={registration.registrationId} className="rounded-lg border border-[#2D2D2D] bg-[#151515] p-2">
                      <p className="text-xs font-semibold text-white">{registration.categoryLabel}</p>
                      <p className="text-[11px] text-[#9C9C9C]">
                        {registration.registrationStatus} · {registration.registrationCode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-3">
                <p className="text-xs text-[#9C9C9C]">Maquetas</p>
                <div className="mt-2 max-h-[280px] space-y-2 overflow-y-auto pr-1">
                  {selectedParticipantDetail.models.map((model) => (
                    <div key={model.id} className="rounded-lg border border-[#2D2D2D] bg-[#151515] p-2">
                      <p className="text-xs font-semibold text-white">{model.nombreModelo}</p>
                      <p className="text-[11px] text-[#9C9C9C]">
                        {model.status} · {model.categoryLabel} · Puntaje {formatScore(model.finalScore)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedModelDetail ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-5xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className={`${outfit.className} text-[20px] font-semibold text-white`}>
                  {selectedModelDetail.model.nombreModelo}
                </h4>
                <p className="text-xs text-[#9C9C9C]">
                  Código {selectedModelDetail.model.code} · {selectedModelDetail.owner.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModelDetail(null)}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-3">
                <p className="text-xs text-[#9C9C9C]">Media</p>
                <div className="mt-2 space-y-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold text-white">Imágenes</p>
                    {selectedModelDetail.media.images.length === 0 ? (
                      <p className="text-xs text-[#9C9C9C]">Sin imágenes.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedModelDetail.media.images.map((image) => (
                          <div key={image.id} className="overflow-hidden rounded-lg border border-[#2D2D2D] bg-[#0F0F0F]">
                            {image.publicUrl ? (
                              <ImageWithSkeleton
                                src={image.publicUrl}
                                alt={image.fileName}
                                width={320}
                                height={200}
                                sizes="(min-width: 1024px) 220px, 45vw"
                                className="h-28 w-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-28 items-center justify-center text-[#9C9C9C]">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            )}
                            <p className="truncate px-2 py-1 text-[11px] text-[#B8B8B8]">{image.fileName}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold text-white">Documentos</p>
                    {selectedModelDetail.media.documents.length === 0 ? (
                      <p className="text-xs text-[#9C9C9C]">Sin documentos.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedModelDetail.media.documents.map((file) => (
                          <a
                            key={file.id}
                            href={file.publicUrl ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-[#2D2D2D] bg-[#141414] px-3 py-2 text-xs text-[#D1D1D1]"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="truncate">{file.fileName}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-3">
                <p className="text-xs text-[#9C9C9C]">Calificaciones</p>
                <p className="mt-1 text-sm text-white">
                  Puntaje final: <span className="font-semibold">{formatScore(selectedModelDetail.scoring.finalScore)}</span>
                </p>
                <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                  {selectedModelDetail.scoring.judgeBreakdown.map((entry) => (
                    <div key={`${entry.judgeUserId}-${entry.judgeName}`} className="rounded-lg border border-[#2D2D2D] bg-[#151515] p-2">
                      <p className="text-xs font-semibold text-white">{entry.judgeName}</p>
                      <p className="text-[11px] text-[#9C9C9C]">
                        Total: {formatScore(entry.totalScore)} · Enviado: {formatDateTime(entry.submittedAt)}
                      </p>
                      {entry.generalComment ? (
                        <p className="mt-1 text-[11px] text-[#B8B8B8]">{entry.generalComment}</p>
                      ) : null}
                    </div>
                  ))}
                  {selectedModelDetail.scoring.judgeBreakdown.length === 0 ? (
                    <p className="text-xs text-[#9C9C9C]">Aún no hay evaluaciones de jueces para esta maqueta.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
