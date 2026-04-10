"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BadgeCheck,
  ChevronDown,
  Home,
  LogOut,
  Settings,
  CalendarDays,
} from "lucide-react";
import { DashboardRoleSwitch } from "@/presentation/components/layout";
import { Skeleton } from "@/presentation/components/ui";
import { useAuthStore, useJudgeStore } from "@/presentation/stores";
import { judgeHeadingFont } from "./judge-heading-font";
import { JudgeNotificationsBell } from "./judge-notifications-bell";

type JudgeDashboardShellProps = Readonly<{
  children: ReactNode;
}>;

type JudgeNavItem = {
  id: string;
  label: string;
  href: string;
  icon: typeof Home;
};

const judgeNavItems: JudgeNavItem[] = [
  { id: "inicio", label: "Inicio", href: "/juez/inicio", icon: Home },
  { id: "eventos", label: "Eventos", href: "/juez/eventos", icon: CalendarDays },
  { id: "perfil", label: "Perfil", href: "/juez/perfil", icon: Settings },
];

const isItemActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

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

function JudgeDashboardError({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#000000] px-4 text-white">
      <div className="w-full max-w-[560px] rounded-2xl border border-[#ef4444]/40 bg-[#7f1d1d]/30 p-6 text-center">
        <p className="text-sm text-[#fca5a5]">{error}</p>
        <button
          type="button"
          onClick={() => void onRetry()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-[#fca5a5]/50 px-5 text-sm font-semibold text-[#fca5a5]"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}

export function JudgeDashboardShell({ children }: JudgeDashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const dashboard = useJudgeStore((state) => state.dashboard);
  const loading = useJudgeStore((state) => state.loading);
  const error = useJudgeStore((state) => state.error);
  const loadDashboard = useJudgeStore((state) => state.loadDashboard);
  const clearError = useJudgeStore((state) => state.clearError);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [initialLoadRequested, setInitialLoadRequested] = useState(false);

  useEffect(() => {
    if (!dashboard && !loading && !initialLoadRequested) {
      setInitialLoadRequested(true);
      void loadDashboard();
    }
  }, [dashboard, loading, initialLoadRequested, loadDashboard]);

  const activeSectionLabel = useMemo(() => {
    if (pathname === "/juez/calificar" || pathname.startsWith("/juez/calificar/")) {
      return "Calificar";
    }

    const active = judgeNavItems.find((item) => isItemActive(pathname, item.href));
    return active?.label ?? "Inicio";
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRetryDashboardLoad = async () => {
    await loadDashboard();
  };

  if (!dashboard) {
    if (loading || !error) {
      return <JudgeDashboardLoading />;
    }
    return <JudgeDashboardError error={error} onRetry={handleRetryDashboardLoad} />;
  }

  const profile = dashboard.profile;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="relative flex min-h-screen flex-col xl:flex-row">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#1E1E1E] bg-[#000000] p-10 xl:flex">
          <div className="flex items-center gap-3">
            <ChevronDown className="h-5 w-5 text-white" />
            <span className="text-2xl font-bold tracking-[-0.5px] text-white">NOMBRE</span>
          </div>

          <nav className="mt-16 flex flex-col gap-8">
            {judgeNavItems.map((item) => {
              const active =
                isItemActive(pathname, item.href) ||
                (item.id === "eventos" &&
                  (pathname === "/juez/calificar" || pathname.startsWith("/juez/calificar/")));
              return (
                <Link key={item.id} href={item.href} className="flex items-center gap-4 text-left">
                  <item.icon className={`h-5 w-5 ${active ? "text-[#5B68F1]" : "text-[#AAAAAA]"}`} />
                  <span className={`text-base ${active ? "font-semibold text-[#5B68F1]" : "font-medium text-[#AAAAAA] opacity-80"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            className="mt-auto flex items-center gap-4 text-left opacity-70 transition hover:opacity-100 disabled:opacity-40"
          >
            <LogOut className="h-5 w-5 text-[#AAAAAA]" />
            <span className="text-base font-medium text-[#AAAAAA]">Cerrar sesion</span>
          </button>
        </aside>

        <section className="relative min-h-screen flex-1 px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:px-[50px] xl:py-[50px]">
          <div className="pointer-events-none absolute right-[120px] top-[380px] hidden h-[120px] w-[120px] rotate-[15deg] rounded-[20px] border-2 border-[#F15BB5] bg-white/10 xl:block" />

          <div className="relative z-10 flex h-full flex-col gap-6 md:gap-8 xl:gap-10">
            <div className="rounded-2xl border border-[#1E1E1E] bg-[#0c0c0c] px-4 py-3 xl:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ChevronDown className="h-4 w-4 text-white" />
                  <span className="text-lg font-bold tracking-[-0.3px] text-white">NOMBRE</span>
                </div>
                <span className="text-xs font-semibold text-[#5B68F1]">{activeSectionLabel}</span>
              </div>
            </div>

            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex flex-col gap-1">
                <h1 className={`${judgeHeadingFont.className} text-[30px] leading-none font-bold text-white md:text-[32px]`}>
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

                <JudgeNotificationsBell />

                <DashboardRoleSwitch />

                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#5B68F1] bg-[#2D2D2D] sm:h-12 sm:w-12">
                  <span className="text-sm font-semibold text-white">{profile?.initials ?? "JU"}</span>
                </div>
              </div>
            </header>

            <nav className="xl:hidden">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {judgeNavItems.map((item) => {
                  const active =
                    isItemActive(pathname, item.href) ||
                    (item.id === "eventos" &&
                      (pathname === "/juez/calificar" || pathname.startsWith("/juez/calificar/")));
                  return (
                    <Link
                      key={`mobile:${item.id}`}
                      href={item.href}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                        active
                          ? "border-[#5B68F1] bg-[rgba(91,104,241,0.2)] text-[#C8CEFF]"
                          : "border-[#2D2D2D] bg-[#111111] text-[#AAAAAA]"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

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

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
