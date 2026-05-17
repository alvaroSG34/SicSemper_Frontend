"use client";

import Link from "next/link";
import { Outfit } from "next/font/google";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ClipboardList,
  Crown,
  FolderTree,
  Home,
  ImageIcon,
  LogOut,
  Settings,
  Ruler,
  Shield,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useMemo, type ComponentType } from "react";
import { useAuthStore, useAdminStore } from "@/presentation/stores";
import { Skeleton } from "@/presentation/components/ui";
import type { User } from "@/domain/user/user.types";
import { AdminParticipantsSection } from "@/presentation/components/features/admin/admin-participants-section";
import { AdminJudgesSection } from "@/presentation/components/features/admin/admin-judges-section";
import { AdminClubsSection } from "@/presentation/components/features/admin/admin-clubs-section";
import { AdminEventsSection } from "@/presentation/components/features/admin/admin-events-section";
import { AdminCategoriesSection } from "@/presentation/components/features/admin/admin-categories-section";
import { AdminScalesSection } from "@/presentation/components/features/admin/admin-scales-section";
import { AdminAdminsSection } from "@/presentation/components/features/admin/admin-admins-section";
import { AdminAdminPermissionsManager } from "@/presentation/components/features/admin/admin-admin-permissions-manager";
import { AdminPermissionsSection } from "@/presentation/components/features/admin/admin-permissions-section";
import { AdminLandingSection } from "@/presentation/components/features/admin/admin-landing-section";
import { AdminNotificationsBell } from "@/presentation/components/features/admin/admin-notifications-bell";
import {
  createAdminAccessMatrix,
  listAvailableAdminSections,
  type AdminSectionId,
} from "@/presentation/components/features/admin/admin-access-matrix";
import {
  adminPermissionsManagerRoute,
  adminSectionRouteById,
} from "@/presentation/components/features/admin/admin-routes";
import { useAdminPermissions } from "@/presentation/components/features/admin/use-admin-permissions";

const DashboardRoleSwitch = dynamic(() =>
  import("@/presentation/components/layout").then((module) => module.DashboardRoleSwitch),
);

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type SidebarItem = {
  id: AdminSectionId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
};

type AdminDashboardPageProps = {
  activeSection: AdminSectionId;
  isAdminPermissionManagerVisible?: boolean;
  activePermissionAdminId?: string | null;
};

const sidebarItems: SidebarItem[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "participantes", label: "Participantes", icon: Users },
  { id: "eventos", label: "Eventos", icon: Trophy },
  { id: "jueces", label: "Jueces", icon: UserCog },
  { id: "clubes", label: "Clubes", icon: Shield },
  { id: "admins", label: "Admins", icon: Crown },
  { id: "landing", label: "Landing", icon: ImageIcon },
  { id: "categorias", label: "Categorias", icon: FolderTree },
  { id: "escalas", label: "Escalas", icon: Ruler },
  { id: "ajustes", label: "Ajustes", icon: Settings },
];

function AdminDashboardLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] px-4 py-6 text-white sm:px-6 md:px-8 lg:px-10 xl:px-[50px] xl:py-[50px]">
      <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col gap-6 md:gap-8 xl:gap-10">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-52" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>

        <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <article
              key={`admin-kpi-skeleton-${index}`}
              className="rounded-[20px] border border-[#2D2D2D] bg-[#121212] p-6"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-10 w-20" />
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`admin-list-skeleton-${index}`}
                className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4"
              >
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="mt-2 h-3 w-2/5" />
                <Skeleton className="mt-4 h-8 w-36" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export function AdminDashboardPage({
  activeSection,
  isAdminPermissionManagerVisible = false,
  activePermissionAdminId = null,
}: AdminDashboardPageProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.currentRole);
  const logout = useAuthStore((state) => state.logout);

  const users = useAdminStore((state) => state.users);
  const dashboard = useAdminStore((state) => state.dashboard);
  const summary = useAdminStore((state) => state.summary);
  const loading = useAdminStore((state) => state.loading);
  const error = useAdminStore((state) => state.error);

  const loadSummary = useAdminStore((state) => state.loadSummary);
  const loadDashboard = useAdminStore((state) => state.loadDashboard);
  const clearError = useAdminStore((state) => state.clearError);

  const isSuperadmin = currentRole === "SUPERADMIN" || Boolean(user?.roles.includes("SUPERADMIN"));
  const effectivePermissions = useMemo(
    () => dashboard?.effectivePermissions ?? summary?.effectivePermissions ?? [],
    [dashboard?.effectivePermissions, summary?.effectivePermissions],
  );
  const adminAccess = useMemo(
    () => createAdminAccessMatrix(effectivePermissions, isSuperadmin),
    [effectivePermissions, isSuperadmin],
  );
  const availableSections = useMemo(() => listAvailableAdminSections(adminAccess), [adminAccess]);
  const firstAvailableSection = availableSections[0] ?? "inicio";
  const sectionRequiresDashboardData =
    activeSection !== "inicio" && activeSection !== "ajustes" && activeSection !== "landing";
  const permissionsResolved = sectionRequiresDashboardData ? dashboard !== null : summary !== null || dashboard !== null;

  useEffect(() => {
    void loadSummary({ force: true });
  }, [activeSection, loadSummary]);

  useEffect(() => {
    if (!sectionRequiresDashboardData) {
      return;
    }
    void loadDashboard({ force: true });
  }, [activeSection, loadDashboard, sectionRequiresDashboardData]);

  useEffect(() => {
    if (!permissionsResolved) {
      return;
    }

    if (isAdminPermissionManagerVisible && !adminAccess.section.admins) {
      router.replace(adminSectionRouteById[firstAvailableSection], { scroll: false });
      return;
    }

    if (adminAccess.section[activeSection]) {
      return;
    }

    router.replace(adminSectionRouteById[firstAvailableSection], { scroll: false });
  }, [
    activeSection,
    adminAccess,
    firstAvailableSection,
    isAdminPermissionManagerVisible,
    permissionsResolved,
    router,
  ]);

  const setActiveSection = (section: AdminSectionId) => {
    if (!adminAccess.section[section]) {
      return;
    }

    if (section === activeSection && !isAdminPermissionManagerVisible) {
      return;
    }

    router.push(adminSectionRouteById[section]);
  };

  const openAdminPermissionsManager = (targetUser: User) => {
    router.push(`${adminPermissionsManagerRoute}?adminId=${encodeURIComponent(targetUser.id)}`);
  };

  const closeAdminPermissionsManager = () => {
    router.push(adminSectionRouteById.admins);
  };

  const setSelectedAdminPermissionTarget = (adminUserId: string) => {
    router.replace(`${adminPermissionsManagerRoute}?adminId=${encodeURIComponent(adminUserId)}`, {
      scroll: false,
    });
  };

  const catalog = dashboard?.catalog;
  const assignments = useMemo(() => dashboard?.assignments ?? [], [dashboard?.assignments]);
  const alerts = dashboard?.alerts ?? summary?.alerts ?? [];
  const activity = dashboard?.activity ?? summary?.activity ?? [];
  const clubs = useMemo(() => dashboard?.clubs ?? [], [dashboard?.clubs]);
  const permissions = useMemo(() => dashboard?.permissions?.items ?? [], [dashboard?.permissions?.items]);
  const kpis = dashboard?.kpis ?? summary?.kpis;

  const { permissionSearch, setPermissionSearch, filteredPermissions } = useAdminPermissions(permissions);

  const visibleSidebarItems = useMemo(
    () =>
      sidebarItems
        .filter((item) => adminAccess.section[item.id])
        .map((item) => ({
          ...item,
          active: item.id === activeSection,
        })),
    [activeSection, adminAccess],
  );

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading && !dashboard) {
    return <AdminDashboardLoading />;
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#000000] text-white">
      <div className="relative flex min-h-screen flex-col xl:flex-row">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#1E1E1E] bg-[#000000] p-10 xl:flex">
          <div className="flex items-center gap-3">
            <ChevronDown className="h-5 w-5 text-white" />
            <span className="text-2xl font-bold tracking-[-0.5px] text-white">IPMS BOLIVIA</span>
          </div>

          <nav className="mt-16 flex flex-col gap-7">
            {visibleSidebarItems.map((item) => (
              <Link
                key={item.id}
                href={adminSectionRouteById[item.id]}
                className="flex items-center gap-4 text-left"
              >
                <item.icon className={`h-5 w-5 ${item.active ? "text-[#5B68F1]" : "text-[#AAAAAA]"}`} />
                <span
                  className={`text-base ${
                    item.active ? "font-semibold text-[#5B68F1]" : "font-medium text-[#AAAAAA] opacity-80"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
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
                <span className="text-lg font-bold tracking-[-0.3px] text-white">IPMS BOLIVIA</span>
              </div>
              <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {visibleSidebarItems.map((item) => (
                  <Link
                    key={`mobile-${item.id}`}
                    href={adminSectionRouteById[item.id]}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                      item.active
                        ? "border-[#5B68F1] bg-[rgba(91,104,241,0.15)] text-[#5B68F1]"
                        : "border-[#2A2A2A] bg-[#111111] text-[#AAAAAA]"
                    }`}
                  >
                    <item.icon className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <header id="inicio" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex flex-col gap-1">
                <h1 className={`${outfit.className} text-[30px] leading-none font-bold text-white md:text-[32px]`}>
                  Hola, Admin {user?.name?.split(" ")[0] ?? "IPMS BOLIVIA"}
                </h1>
                <p className="text-sm text-[#AAAAAA]">Centro de control operativo de competencias de modelismo</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
                <div className="rounded-full border border-[#10B981] bg-[rgba(16,185,129,0.1)] px-3 py-1.5 sm:px-4 sm:py-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Sistema estable
                  </span>
                </div>

                <AdminNotificationsBell />

                <DashboardRoleSwitch />

                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#5B68F1] bg-[#2D2D2D] sm:h-12 sm:w-12">
                  <span className="text-sm font-semibold text-white">
                    {(user?.name ?? "AD").slice(0, 2).toUpperCase()}
                  </span>
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

            {activeSection === "inicio" ? (
              <>
                <section className="flex w-full flex-col gap-6 rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold tracking-[2px] text-[#F15BB5]">RESUMEN EJECUTIVO</p>
                    <h2
                      className={`${outfit.className} text-3xl leading-tight font-bold text-white sm:text-4xl xl:text-5xl xl:leading-none`}
                    >
                      Monitoreo de competencias de modelismo
                    </h2>
                    <p className="text-sm text-[#AAAAAA] sm:text-base">
                      Gestiona participantes, jueces, categorias y eventos desde un unico panel.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {adminAccess.section.eventos ? (
                      <button
                        type="button"
                        onClick={() => setActiveSection("eventos")}
                        className="inline-flex h-10 items-center justify-center rounded-full bg-[#5B68F1] px-5 text-xs font-semibold text-white"
                      >
                        Crear evento
                      </button>
                    ) : null}
                    {adminAccess.section.jueces ? (
                      <button
                        type="button"
                        onClick={() => setActiveSection("jueces")}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-[#5B68F1]/60 bg-[#252B4A] px-5 text-xs font-semibold text-white"
                      >
                        Invitar juez
                      </button>
                    ) : null}
                    {adminAccess.section.categorias ? (
                      <button
                        type="button"
                        onClick={() => setActiveSection("categorias")}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-[#F15BB5]/60 bg-[#2A171D] px-5 text-xs font-semibold text-white"
                      >
                        Gestionar categorias
                      </button>
                    ) : null}
                    {adminAccess.section.admins ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveSection("admins")}
                          className="inline-flex h-10 items-center justify-center rounded-full border border-[#F59E0B]/60 bg-[#2C2110] px-5 text-xs font-semibold text-white"
                        >
                          Gestionar admins
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSection("permisos")}
                          className="inline-flex h-10 items-center justify-center rounded-full border border-[#10B981]/60 bg-[#10261E] px-5 text-xs font-semibold text-white"
                        >
                          Ver permisos
                        </button>
                      </>
                    ) : null}
                  </div>
                </section>

                <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
                  <article className="flex h-[140px] flex-col justify-between rounded-[20px] border border-[#5B68F1] bg-[#121212] p-6">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-[#5B68F1]" />
                      <p className="text-sm font-medium text-[#AAAAAA]">Usuarios activos</p>
                    </div>
                    <p className={`${outfit.className} text-5xl leading-none font-bold text-[#5B68F1]`}>
                      {kpis?.activeUsers ?? 0}
                    </p>
                  </article>

                  <article className="flex h-[140px] flex-col justify-between rounded-[20px] border border-[#10B981] bg-[#121212] p-6">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-6 w-6 text-[#10B981]" />
                      <p className="text-sm font-medium text-[#AAAAAA]">Eventos activos</p>
                    </div>
                    <p className={`${outfit.className} text-5xl leading-none font-bold text-[#10B981]`}>
                      {kpis?.activeEvents ?? 0}
                    </p>
                  </article>

                  <article className="flex h-[140px] flex-col justify-between rounded-[20px] border border-[#F15BB5] bg-[#121212] p-6 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-[#F15BB5]" />
                      <p className="text-sm font-medium text-[#AAAAAA]">Incidencias abiertas</p>
                    </div>
                    <p className={`${outfit.className} text-5xl leading-none font-bold text-[#F15BB5]`}>
                      {kpis?.openIncidents ?? 0}
                    </p>
                  </article>
                </section>
              </>
            ) : null}

            {activeSection === "participantes" && adminAccess.section.participantes ? (
              <AdminParticipantsSection
                users={users}
                headingClassName={outfit.className}
                canUpdateUsers={adminAccess.module.users.update}
              />
            ) : null}

            {activeSection === "eventos" && adminAccess.section.eventos ? (
              <AdminEventsSection
                events={catalog?.events ?? []}
                clubs={clubs}
                categories={catalog?.categories ?? []}
                subcategories={catalog?.subcategories ?? []}
                eventCategories={catalog?.eventCategories ?? []}
                scales={catalog?.scales ?? []}
                users={users}
                assignments={assignments}
                headingClassName={outfit.className}
                loading={loading}
                canCreateEvents={adminAccess.module.events.create}
                canUpdateEvents={adminAccess.module.events.update}
                canDeleteEvents={adminAccess.module.events.delete}
                canReadJudgeAssignments={adminAccess.module.judgeAssignments.read}
                canManageJudgeAssignments={
                  adminAccess.module.judgeAssignments.create &&
                  adminAccess.module.judgeAssignments.delete
                }
              />
            ) : null}
            {activeSection === "jueces" && adminAccess.section.jueces ? (
              <AdminJudgesSection
                users={users}
                assignments={assignments}
                headingClassName={outfit.className}
                canManageJudgeRole={adminAccess.module.users.update}
                canCreateJudge={adminAccess.module.users.create}
                canReadJudgePermissions={adminAccess.module.judgePermissions.read}
                canManageJudgePermissions={
                  adminAccess.module.judgePermissions.create &&
                  adminAccess.module.judgePermissions.delete
                }
              />
            ) : null}

            {activeSection === "clubes" && adminAccess.section.clubes ? (
              <AdminClubsSection
                clubs={clubs}
                headingClassName={outfit.className}
                canCreateClubs={adminAccess.module.clubs.create}
                canUpdateClubs={adminAccess.module.clubs.update}
                canDeleteClubs={adminAccess.module.clubs.delete}
              />
            ) : null}

            {activeSection === "categorias" && adminAccess.section.categorias ? (
              <AdminCategoriesSection
                categories={catalog?.categories ?? []}
                subcategories={catalog?.subcategories ?? []}
                headingClassName={outfit.className}
                loading={loading}
                canCreateCategories={adminAccess.module.categories.create}
                canUpdateCategories={adminAccess.module.categories.update}
                canDeleteCategories={adminAccess.module.categories.delete}
              />
            ) : null}

            {activeSection === "escalas" && adminAccess.section.escalas ? (
              <AdminScalesSection
                scales={catalog?.scales ?? []}
                headingClassName={outfit.className}
                loading={loading}
                canCreateScales={adminAccess.module.categories.create}
                canUpdateScales={adminAccess.module.categories.update}
                canDeleteScales={adminAccess.module.categories.delete}
              />
            ) : null}

            {activeSection === "admins" && adminAccess.section.admins && !isAdminPermissionManagerVisible ? (
              <AdminAdminsSection
                users={users}
                headingClassName={outfit.className}
                loading={loading}
                activePermissionAdminId={activePermissionAdminId}
                openAdminPermissionsManager={openAdminPermissionsManager}
                canCreateAdmins={adminAccess.module.users.create}
                canUpdateAdmins={adminAccess.module.users.update}
                canManageAdminPermissions={adminAccess.module.adminPermissions.read}
              />
            ) : null}

            {activeSection === "admins" && adminAccess.section.admins && isAdminPermissionManagerVisible ? (
              <AdminAdminPermissionsManager
                headingClassName={outfit.className}
                users={users}
                selectedAdminId={activePermissionAdminId}
                onSelectAdmin={setSelectedAdminPermissionTarget}
                onBackToAdmins={closeAdminPermissionsManager}
                loading={loading}
                canManageAdminPermissions={
                  adminAccess.module.adminPermissions.create &&
                  adminAccess.module.adminPermissions.delete
                }
              />
            ) : null}

            {activeSection === "permisos" && adminAccess.section.permisos ? (
              <AdminPermissionsSection
                headingClassName={outfit.className}
                permissions={filteredPermissions}
                totalPermissions={dashboard?.permissions?.total ?? permissions.length}
                permissionSearch={permissionSearch}
                onPermissionSearchChange={setPermissionSearch}
              />
            ) : null}

            {activeSection === "landing" && adminAccess.section.landing ? (
              <AdminLandingSection headingClassName={outfit.className} />
            ) : null}

            {activeSection === "ajustes" ? (
              <section className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-8">
                <article className="rounded-3xl bg-[#121212] p-5 sm:p-6 xl:p-8">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>
                      Actividad reciente
                    </h3>
                    <ClipboardList className="h-5 w-5 text-[#5B68F1]" />
                  </div>

                  <div className="space-y-3">
                    {activity.slice(0, 8).map((item) => (
                      <div key={item.id} className="rounded-xl bg-[#1A1A1A] p-4">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-[13px] text-[#A0A0A0]">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article id="ajustes" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>
                      Alertas operativas
                    </h3>
                    <AlertTriangle className="h-5 w-5 text-[#F15BB5]" />
                  </div>

                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="rounded-xl bg-[#1A1A1A] p-4">
                        <p className="text-sm font-semibold text-white">{alert.title}</p>
                        <p className="mt-1 text-[13px] text-[#A0A0A0]">{alert.detail}</p>
                        <div className="mt-2 flex items-center gap-2 text-[11px]">
                          <span className="rounded-full border border-[#352A2A] bg-[#251919] px-2 py-1 text-[#FCA5A5]">
                            Severidad {alert.severity}
                          </span>
                          <span className="rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-2 py-1 text-[#C9D3FF]">
                            {alert.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            ) : null}
            {!isAdminPermissionManagerVisible ? (
              <footer className="pb-6 text-xs text-[#777777]">
                {loading ? "Actualizando panel..." : "Panel administrativo actualizado"}
                <span className="ml-2 inline-flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  Datos sincronizados con la API
                </span>
              </footer>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
