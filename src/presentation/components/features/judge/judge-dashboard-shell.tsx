"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import {
  BadgeCheck,
  ChevronDown,
  Home,
  CalendarDays,
} from "lucide-react";
import { AccountMenu, DashboardRoleSwitch } from "@/presentation/components/layout";
import { Skeleton } from "@/presentation/components/ui";
import { useJudgeStore } from "@/presentation/stores";
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
];

const isItemActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export function JudgeMobileNavigation({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Navegacion de juez"
      className="fixed inset-x-0 bottom-0 z-[60] flex border-t border-[#2A2A2A] bg-[#0A0A0A]/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_28px_rgba(0,0,0,0.3)] backdrop-blur xl:hidden"
    >
      {judgeNavItems.map((item) => {
        const active =
          isItemActive(pathname, item.href) ||
          (item.id === "eventos" &&
            (pathname === "/juez/calificar" || pathname.startsWith("/juez/calificar/")));

        return (
          <Link
            key={`mobile-tab:${item.id}`}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition ${
              active ? "bg-[rgba(91,104,241,0.18)] text-[#AAB2FF]" : "text-[#9B9B9B] hover:bg-[#161616] hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
            {active ? <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#5B68F1]" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

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
  const dashboard = useJudgeStore((state) => state.dashboard);
  const loading = useJudgeStore((state) => state.loading);
  const error = useJudgeStore((state) => state.error);
  const loadDashboard = useJudgeStore((state) => state.loadDashboard);
  const clearError = useJudgeStore((state) => state.clearError);

  const initialLoadRequested = useRef(false);

  useEffect(() => {
    if (!dashboard && !loading && !initialLoadRequested.current) {
      initialLoadRequested.current = true;
      void loadDashboard();
    }
  }, [dashboard, loading, loadDashboard]);

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
            <span className="text-2xl font-bold tracking-[-0.5px] text-white">SICSEMPER</span>
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
        </aside>

        <section className="relative min-h-screen flex-1 px-4 py-6 pb-24 sm:px-6 md:px-8 lg:px-10 xl:px-[50px] xl:py-[50px]">
          <div className="pointer-events-none absolute right-[120px] top-[380px] hidden h-[120px] w-[120px] rotate-[15deg] rounded-[20px] border-2 border-[#F15BB5] bg-white/10 xl:block" />

          <div className="relative z-10 flex h-full flex-col gap-6 md:gap-8 xl:gap-10">
            <header className="flex items-center justify-between gap-3 md:gap-6">
              <div className="min-w-0 flex-1">
                <h1
                  className={`${judgeHeadingFont.className} truncate text-[26px] leading-none font-bold text-white md:text-[32px]`}
                >
                  Hola, {profile?.displayName ?? "Juez"}
                </h1>
                <p className="hidden text-sm text-[#AAAAAA] md:block">
                  Panel operativo de revision de maquetas asignadas
                </p>
              </div>

              <div className="ml-3 flex shrink-0 items-center gap-2 sm:gap-3 md:gap-6">
                <BadgeCheck className="h-7 w-7 text-[#10B981]" aria-label="Juez verificado" />

                <JudgeNotificationsBell />

                <DashboardRoleSwitch hideParticipantJudgeOnly />

                <AccountMenu initials={profile?.initials ?? "JU"} profileHref="/juez/perfil" />
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

            {children}
          </div>
        </section>
        <JudgeMobileNavigation pathname={pathname} />
      </div>
    </main>
  );
}
