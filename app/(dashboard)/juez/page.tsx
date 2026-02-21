import { Outfit } from "next/font/google";
import type { LucideIcon } from "lucide-react";
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
import { DashboardRoleSwitch } from "@/presentation/components/layout";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type SidebarItem = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
};

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: "Inicio", active: true },
  { icon: ClipboardCheck, label: "Evaluaciones" },
  { icon: Trophy, label: "Competencias" },
  { icon: BarChart3, label: "Resultados" },
  { icon: Settings, label: "Perfil" },
];

const pendingQueue = [
  {
    project: "Maqueta Museo Interactivo",
    category: "Arquitectura Digital · Senior",
    priority: "Alta",
    time: "Vence en 2 h",
    status: "Pendiente",
  },
  {
    project: "App Salud Comunitaria",
    category: "UX/UI · Intermedio",
    priority: "Media",
    time: "Vence mañana",
    status: "En revisión",
  },
  {
    project: "Sistema de Riego IoT",
    category: "Innovación Tecnológica · Avanzado",
    priority: "Alta",
    time: "Vence en 6 h",
    status: "Pendiente",
  },
];

const recentReviews = [
  {
    project: "Plataforma de Turismo Local",
    score: "92/100",
    result: "Aprobada",
  },
  {
    project: "Dashboard Energía Verde",
    score: "88/100",
    result: "Aprobada",
  },
  {
    project: "App Gestión Escolar",
    score: "En curso",
    result: "En revisión",
  },
];

const assignedEvents = [
  {
    name: "Hackathon Global 2024",
    detail: "18 proyectos asignados · Finaliza en 2 días",
  },
  {
    name: "Challenge UX Research",
    detail: "12 proyectos asignados · Finaliza en 4 días",
  },
  {
    name: "Concurso Innovación LATAM",
    detail: "9 proyectos asignados · Finaliza en 6 días",
  },
];

export default function JuezPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="relative flex min-h-screen flex-col xl:flex-row">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#1E1E1E] bg-[#000000] p-10 xl:flex">
          <div className="flex items-center gap-3">
            <ChevronDown className="h-5 w-5 text-white" />
            <span className="text-2xl font-bold tracking-[-0.5px] text-white">SicSemper</span>
          </div>

          <nav className="mt-16 flex flex-col gap-8">
            {sidebarItems.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
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

          <div className="mt-auto flex items-center gap-4 opacity-70">
            <LogOut className="h-5 w-5 text-[#AAAAAA]" />
            <span className="text-base font-medium text-[#AAAAAA]">Cerrar sesión</span>
          </div>
        </aside>

        <section className="relative min-h-screen flex-1 px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:px-[50px] xl:py-[50px]">
          <div className="pointer-events-none absolute right-[120px] top-[380px] hidden h-[120px] w-[120px] rotate-[15deg] rounded-[20px] border-2 border-[#F15BB5] bg-white/10 xl:block" />

          <div className="relative z-10 flex h-full flex-col gap-6 md:gap-8 xl:gap-10">
            <div className="rounded-2xl border border-[#1E1E1E] bg-[#0c0c0c] px-4 py-3 xl:hidden">
              <div className="flex items-center gap-3">
                <ChevronDown className="h-4 w-4 text-white" />
                <span className="text-lg font-bold tracking-[-0.3px] text-white">SicSemper</span>
              </div>
              <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {sidebarItems.map((item) => (
                  <button
                    key={`mobile-${item.label}`}
                    type="button"
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                      item.active
                        ? "border-[#5B68F1] bg-[rgba(91,104,241,0.15)] text-[#5B68F1]"
                        : "border-[#2A2A2A] bg-[#111111] text-[#AAAAAA]"
                    }`}
                  >
                    <item.icon className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex flex-col gap-1">
                <h1 className={`${outfit.className} text-[30px] leading-none font-bold text-white md:text-[32px]`}>
                  Hola, Juez Mariana
                </h1>
                <p className="text-sm text-[#AAAAAA]">Panel de Evaluación · Especialidad UX/UI</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
                <div className="rounded-full border border-[#10B981] bg-[rgba(16,185,129,0.1)] px-3 py-1.5 sm:px-4 sm:py-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Juez verificado
                  </span>
                </div>

                <div className="relative flex h-10 w-10 items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-[5px] bg-[#F15BB5]" />
                </div>

                <DashboardRoleSwitch />

                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#5B68F1] bg-[#2D2D2D] sm:h-12 sm:w-12">
                  <span className="text-sm font-semibold text-white">JM</span>
                </div>
              </div>
            </header>

            <section className="flex w-full flex-col gap-6 rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:flex-row xl:items-stretch xl:justify-between xl:gap-8 xl:p-10">
              <div className="flex flex-1 flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold tracking-[2px] text-[#F15BB5]">COLA DE EVALUACIONES PENDIENTES</p>
                  <h2
                    className={`${outfit.className} text-3xl leading-tight font-bold text-white sm:text-4xl xl:text-5xl xl:leading-none`}
                  >
                    3 proyectos críticos por revisar
                  </h2>
                  <p className="text-sm text-[#AAAAAA] sm:text-base">
                    Prioriza evaluaciones urgentes para cerrar resultados a tiempo.
                  </p>
                </div>

                <div className="grid gap-3">
                  {pendingQueue.map((item) => (
                    <article
                      key={item.project}
                      className="grid gap-3 rounded-xl border border-[#2B2B2B] bg-[#191919] p-4 md:grid-cols-[1fr_auto]"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-white">{item.project}</p>
                        <p className="text-xs text-[#999999]">{item.category}</p>
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

                      <button
                        type="button"
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-[18px] border border-[#5B68F1]/60 bg-[#252B4A] px-4 text-xs font-semibold text-white"
                      >
                        Calificar ahora
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="w-full rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:w-[320px]">
                <h3 className={`${outfit.className} text-xl font-semibold text-white`}>Resumen rápido</h3>
                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
                    <p className="text-xs text-[#999999]">Pendientes urgentes</p>
                    <p className={`${outfit.className} mt-1 text-3xl font-bold text-[#F15BB5]`}>3</p>
                  </div>
                  <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
                    <p className="text-xs text-[#999999]">Siguiente corte</p>
                    <p className="mt-1 text-sm font-semibold text-white">Hoy, 18:00 · Sala UX/UI</p>
                  </div>
                  <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
                    <p className="text-xs text-[#999999]">Cobertura de revisiones</p>
                    <p className="mt-1 text-sm font-semibold text-white">72% completado</p>
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
                <p className={`${outfit.className} text-5xl leading-none font-bold text-[#5B68F1]`}>8</p>
              </article>

              <article className="flex h-[140px] flex-col justify-between rounded-[20px] border border-[#10B981] bg-[#121212] p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
                  <p className="text-sm font-medium text-[#AAAAAA]">Evaluadas hoy</p>
                </div>
                <p className={`${outfit.className} text-5xl leading-none font-bold text-[#10B981]`}>5</p>
              </article>

              <article className="flex h-[140px] flex-col justify-between rounded-[20px] border border-[#F15BB5] bg-[#121212] p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3">
                  <Timer className="h-6 w-6 text-[#F15BB5]" />
                  <p className="text-sm font-medium text-[#AAAAAA]">Tiempo promedio</p>
                </div>
                <div className="flex items-end gap-1">
                  <p className={`${outfit.className} text-5xl leading-none font-bold text-[#F15BB5]`}>18</p>
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
                      key={item.project}
                      className="flex flex-col gap-3 rounded-xl bg-[#1A1A1A] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className="text-sm font-medium text-[#EEEEEE]">{item.project}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="rounded-full border border-[#2A2A2A] bg-[#151515] px-2 py-1 text-[#DDDDDD]">
                          {item.score}
                        </span>
                        <span className="rounded-full border border-[#2A3A30] bg-[#17261E] px-2 py-1 text-[#34D399]">
                          {item.result}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="flex flex-col gap-6 rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>
                    Competencias asignadas
                  </h3>
                  <button type="button" className="text-sm font-semibold text-[#5B68F1]">
                    <span className="inline-flex items-center gap-1">
                      Ver todo
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {assignedEvents.map((event) => (
                    <div key={event.name} className="rounded-2xl bg-[#1A1A1A] p-5">
                      <h4 className="text-base font-semibold text-white">{event.name}</h4>
                      <p className="mt-1 text-[13px] text-[#999999]">{event.detail}</p>
                      <button
                        type="button"
                        className="mt-4 flex h-9 w-[150px] items-center justify-center rounded-[18px] bg-[#2D2D2D] text-xs font-semibold text-white"
                      >
                        Abrir panel
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
