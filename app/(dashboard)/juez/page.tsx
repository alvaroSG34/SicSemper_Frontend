"use client";

import { Outfit } from "next/font/google";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Home,
  LogOut,
  Settings,
  Timer,
  Trophy,
} from "lucide-react";
import { useEffect } from "react";
import { DashboardRoleSwitch } from "@/presentation/components/layout";
import { useAuthStore, useJudgeStore } from "@/presentation/stores";
import { Skeleton } from "@/presentation/components/ui";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const sidebarItems = [
  { id: "inicio", label: "Inicio", icon: Home, active: true },
  { id: "evaluaciones", label: "Evaluaciones", icon: ClipboardCheck },
  { id: "competencias", label: "Competencias", icon: Trophy },
  { id: "resultados", label: "Resultados", icon: BarChart3 },
  { id: "perfil", label: "Perfil", icon: Settings },
];
function JudgeDashboardLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 xl:px-[50px] xl:py-[50px]">
      <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col gap-6 md:gap-8 xl:gap-10">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-20 rounded-full" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>

        <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-11 w-72" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`judge-queue-skeleton-${index}`} className="rounded-xl border border-[#2B2B2B] bg-[#191919] p-4">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="mt-2 h-3 w-1/2" />
                <div className="mt-4 flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`judge-kpi-skeleton-${index}`} className="rounded-[20px] border border-[#2D2D2D] bg-[#121212] p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-10 w-20" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export default function JuezPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const dashboard = useJudgeStore((state) => state.dashboard);
  const loading = useJudgeStore((state) => state.loading);
  const error = useJudgeStore((state) => state.error);
  const loadDashboard = useJudgeStore((state) => state.loadDashboard);
  const startReview = useJudgeStore((state) => state.startReview);
  const completeReview = useJudgeStore((state) => state.completeReview);
  const clearError = useJudgeStore((state) => state.clearError);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const profile = dashboard?.profile;
  const summary = dashboard?.summary;
  const kpis = dashboard?.kpis;
  const pendingQueue = dashboard?.pendingQueue ?? [];
  const recentReviews = dashboard?.recentReviews ?? [];
  const assignedEvents = dashboard?.assignedEvents ?? [];

  if (loading && !dashboard) {
    return <JudgeDashboardLoading />;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="relative flex min-h-screen flex-col xl:flex-row">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#1E1E1E] bg-[#000000] p-10 xl:flex">
          <div className="flex items-center gap-3">
            <ChevronDown className="h-5 w-5 text-white" />
            <span className="text-2xl font-bold tracking-[-0.5px] text-white">NOMBRE</span>
          </div>

          <nav className="mt-16 flex flex-col gap-8">
            {sidebarItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <item.icon className={`h-5 w-5 ${item.active ? "text-[#5B68F1]" : "text-[#AAAAAA]"}`} />
                <span
                  className={`text-base ${
                    item.active ? "font-semibold text-[#5B68F1]" : "font-medium text-[#AAAAAA] opacity-80"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="mt-auto flex items-center gap-4 text-left opacity-70 transition hover:opacity-100"
          >
            <LogOut className="h-5 w-5 text-[#AAAAAA]" />
            <span className="text-base font-medium text-[#AAAAAA]">Cerrar sesion</span>
          </button>
        </aside>

        <section className="relative min-h-screen flex-1 px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:px-[50px] xl:py-[50px]">
          <div className="pointer-events-none absolute right-[120px] top-[380px] hidden h-[120px] w-[120px] rotate-[15deg] rounded-[20px] border-2 border-[#F15BB5] bg-white/10 xl:block" />

          <div className="relative z-10 flex h-full flex-col gap-6 md:gap-8 xl:gap-10">
            <div className="rounded-2xl border border-[#1E1E1E] bg-[#0c0c0c] px-4 py-3 xl:hidden">
              <div className="flex items-center gap-3">
                <ChevronDown className="h-4 w-4 text-white" />
                <span className="text-lg font-bold tracking-[-0.3px] text-white">NOMBRE</span>
              </div>
            </div>

            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex flex-col gap-1">
                <h1 className={`${outfit.className} text-[30px] leading-none font-bold text-white md:text-[32px]`}>
                  Hola, {profile?.displayName ?? "Juez"}
                </h1>
                <p className="text-sm text-[#AAAAAA]">Panel operativo de revision de maquetas asignadas</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
                <div className="rounded-full border border-[#10B981] bg-[rgba(16,185,129,0.1)] px-3 py-1.5 sm:px-4 sm:py-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {profile?.verified ? "Juez verificado" : "Revision activa"}
                  </span>
                </div>

                <div className="relative flex h-10 w-10 items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-[5px] bg-[#F15BB5]" />
                </div>

                <DashboardRoleSwitch />

                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#5B68F1] bg-[#2D2D2D] sm:h-12 sm:w-12">
                  <span className="text-sm font-semibold text-white">{profile?.initials ?? "JU"}</span>
                </div>
              </div>
            </header>

            {error ? (
              <div className="rounded-xl border border-[#ef4444]/40 bg-[#7f1d1d]/30 px-4 py-3 text-sm text-[#fca5a5]">
                <div className="flex items-center justify-between gap-3">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={clearError}
                    className="rounded-md border border-[#fca5a5]/50 px-2 py-1 text-xs font-semibold text-[#fca5a5]"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : null}

            <section className="flex w-full flex-col gap-6 rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:flex-row xl:items-stretch xl:justify-between xl:gap-8 xl:p-10">
              <div className="flex flex-1 flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold tracking-[2px] text-[#F15BB5]">COLA DE REVISION</p>
                  <h2
                    className={`${outfit.className} text-3xl leading-tight font-bold text-white sm:text-4xl xl:text-5xl xl:leading-none`}
                  >
                    {loading ? "Cargando asignaciones..." : `${pendingQueue.length} maquetas por revisar`}
                  </h2>
                  <p className="text-sm text-[#AAAAAA] sm:text-base">
                    Avanza sobre tu cola asignada y cierra calificaciones a tiempo.
                  </p>
                </div>

                <div className="grid gap-3">
                  {pendingQueue.map((item) => (
                    <article
                      key={item.id}
                      className="grid gap-3 rounded-xl border border-[#2B2B2B] bg-[#191919] p-4 md:grid-cols-[1fr_auto]"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-white">{item.project}</p>
                        <p className="text-xs text-[#999999]">
                          {item.category} Â· {item.participantName}
                        </p>
                        <p className="text-xs text-[#777777]">{item.eventName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full border border-[#3A2A2A] bg-[#2A171D] px-2 py-1 text-[#F15BB5]">
                            Prioridad {item.priority}
                          </span>
                          <span className="rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-2 py-1 text-[#8BA3FF]">
                            {item.time}
                          </span>
                          <span className="rounded-full border border-[#2A3A30] bg-[#17261E] px-2 py-1 text-[#34D399]">
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        {item.canStart ? (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => void startReview(item.id)}
                            className="inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#5B68F1]/60 bg-[#252B4A] px-4 text-xs font-semibold text-white"
                          >
                            Iniciar
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        ) : null}

                        {item.canComplete ? (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => void completeReview(item.id)}
                            className="inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#10B981]/60 bg-[#17261E] px-4 text-xs font-semibold text-white"
                          >
                            Finalizar
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}

                  {!loading && pendingQueue.length === 0 ? (
                    <p className="rounded-xl border border-[#2D2D2D] bg-[#161616] px-4 py-3 text-sm text-[#9C9C9C]">
                      No tienes maquetas pendientes en tus alcances asignados.
                    </p>
                  ) : null}
                </div>
              </div>

              <aside className="w-full rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:w-[320px]">
                <h3 className={`${outfit.className} text-xl font-semibold text-white`}>Resumen rapido</h3>
                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
                    <p className="text-xs text-[#999999]">Pendientes urgentes</p>
                    <p className={`${outfit.className} mt-1 text-3xl font-bold text-[#F15BB5]`}>
                      {summary?.pendingUrgent ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
                    <p className="text-xs text-[#999999]">Siguiente corte</p>
                    <p className="mt-1 text-sm font-semibold text-white">{summary?.nextCutoff ?? "Sin cortes activos"}</p>
                  </div>
                  <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
                    <p className="text-xs text-[#999999]">Cobertura de revisiones</p>
                    <p className="mt-1 text-sm font-semibold text-white">{summary?.coveragePercent ?? 0}% completado</p>
                  </div>
                </div>
              </aside>
            </section>

            <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
              <article className="flex h-[140px] flex-col justify-between rounded-[20px] border border-[#5B68F1] bg-[#121212] p-6">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-6 w-6 text-[#5B68F1]" />
                  <p className="text-sm font-medium text-[#AAAAAA]">Pendientes</p>
                </div>
                <p className={`${outfit.className} text-5xl leading-none font-bold text-[#5B68F1]`}>
                  {kpis?.pendingCount ?? 0}
                </p>
              </article>

              <article className="flex h-[140px] flex-col justify-between rounded-[20px] border border-[#10B981] bg-[#121212] p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
                  <p className="text-sm font-medium text-[#AAAAAA]">Calificadas hoy</p>
                </div>
                <p className={`${outfit.className} text-5xl leading-none font-bold text-[#10B981]`}>
                  {kpis?.reviewedToday ?? 0}
                </p>
              </article>

              <article className="flex h-[140px] flex-col justify-between rounded-[20px] border border-[#F15BB5] bg-[#121212] p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3">
                  <Timer className="h-6 w-6 text-[#F15BB5]" />
                  <p className="text-sm font-medium text-[#AAAAAA]">Tiempo promedio</p>
                </div>
                <div className="flex items-end gap-1">
                  <p className={`${outfit.className} text-5xl leading-none font-bold text-[#F15BB5]`}>
                    {kpis?.averageReviewMinutes ?? 0}
                  </p>
                  <p className="pb-1 text-sm text-[#AAAAAA]">min</p>
                </div>
              </article>
            </section>

            <section className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-8">
              <article className="flex flex-col gap-6 rounded-3xl bg-[#121212] p-5 sm:p-6 xl:p-8">
                <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Evaluaciones recientes</h3>

                <div className="flex flex-col gap-4">
                  {recentReviews.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-xl bg-[#1A1A1A] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#EEEEEE]">{item.project}</p>
                        <p className="text-xs text-[#8D8D8D]">{item.participantName}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="rounded-full border border-[#2A2A2A] bg-[#151515] px-2 py-1 text-[#DDDDDD]">
                          {item.scoreLabel}
                        </span>
                        <span className="rounded-full border border-[#2A3A30] bg-[#17261E] px-2 py-1 text-[#34D399]">
                          {item.result}
                        </span>
                      </div>
                    </div>
                  ))}

                  {!loading && recentReviews.length === 0 ? (
                    <p className="rounded-xl border border-[#2D2D2D] bg-[#161616] px-4 py-3 text-sm text-[#9C9C9C]">
                      Aun no hay revisiones finalizadas en tus alcances.
                    </p>
                  ) : null}
                </div>
              </article>

              <article className="flex flex-col gap-6 rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>
                    Competencias asignadas
                  </h3>
                  <span className="text-sm font-semibold text-[#5B68F1]">{assignedEvents.length} activas</span>
                </div>

                <div className="flex flex-col gap-4">
                  {assignedEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl bg-[#1A1A1A] p-5">
                      <h4 className="text-base font-semibold text-white">{event.name}</h4>
                      <p className="mt-1 text-[13px] text-[#999999]">{event.detail}</p>
                      <p className="mt-3 text-xs font-medium text-[#8BA3FF]">
                        {event.pendingCount} pendientes en este alcance
                      </p>
                    </div>
                  ))}

                  {!loading && assignedEvents.length === 0 ? (
                    <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                      Aun no tienes competencias asignadas. Pide a un admin que te asigne un alcance.
                    </p>
                  ) : null}
                </div>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}


