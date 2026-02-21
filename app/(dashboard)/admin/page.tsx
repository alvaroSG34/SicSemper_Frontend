"use client";

import { Outfit } from "next/font/google";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  ChevronDown,
  ClipboardList,
  FolderTree,
  Home,
  LogOut,
  Settings,
  Shield,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType, type FormEvent } from "react";
import type { CatalogEventStatus, JudgeAssignmentScope } from "@/domain/admin/admin.types";
import { DashboardRoleSwitch } from "@/presentation/components/layout";
import { useAuthStore, useAdminStore } from "@/presentation/stores";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type SidebarItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
};

const sidebarItems: SidebarItem[] = [
  { id: "inicio", label: "Inicio", icon: Home, active: true },
  { id: "participantes", label: "Participantes", icon: Users },
  { id: "eventos", label: "Eventos", icon: Trophy },
  { id: "jueces", label: "Jueces", icon: UserCog },
  { id: "clubes", label: "Clubes", icon: Shield },
  { id: "categorias", label: "Categorías", icon: FolderTree },
  { id: "ajustes", label: "Ajustes", icon: Settings },
];

const eventStatusOptions: CatalogEventStatus[] = ["ACTIVO", "PAUSADO", "BORRADOR"];

const clubData = [
  { id: "club-1", name: "Club IPMS Central", members: 42, city: "La Paz" },
  { id: "club-2", name: "Asociación Creativa UX", members: 27, city: "Santa Cruz" },
  { id: "club-3", name: "Frontend Builders Hub", members: 33, city: "Cochabamba" },
];

const roleLabel: Record<"PARTICIPANTE" | "JUEZ" | "ADMIN", string> = {
  PARTICIPANTE: "Participante",
  JUEZ: "Juez",
  ADMIN: "Admin",
};

const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);

  const users = useAdminStore((state) => state.users);
  const dashboard = useAdminStore((state) => state.dashboard);
  const loading = useAdminStore((state) => state.loading);
  const error = useAdminStore((state) => state.error);

  const loadDashboard = useAdminStore((state) => state.loadDashboard);
  const clearError = useAdminStore((state) => state.clearError);
  const promoteToJudge = useAdminStore((state) => state.promoteToJudge);
  const demoteJudge = useAdminStore((state) => state.demoteJudge);
  const createEvent = useAdminStore((state) => state.createEvent);
  const updateEvent = useAdminStore((state) => state.updateEvent);
  const createCategory = useAdminStore((state) => state.createCategory);
  const updateCategory = useAdminStore((state) => state.updateCategory);
  const createSubcategory = useAdminStore((state) => state.createSubcategory);
  const updateSubcategory = useAdminStore((state) => state.updateSubcategory);
  const assignJudgeScope = useAdminStore((state) => state.assignJudgeScope);
  const removeJudgeScope = useAdminStore((state) => state.removeJudgeScope);

  const [newEventName, setNewEventName] = useState("");
  const [newEventStatus, setNewEventStatus] = useState<CatalogEventStatus>("BORRADOR");
  const [newEventPlace, setNewEventPlace] = useState("");
  const [newEventStartDate, setNewEventStartDate] = useState("");
  const [newEventEndDate, setNewEventEndDate] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEventId, setNewCategoryEventId] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryCategoryId, setNewSubcategoryCategoryId] = useState("");

  const [selectedJudgeId, setSelectedJudgeId] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const catalog = dashboard?.catalog;
  const assignments = useMemo(() => dashboard?.assignments ?? [], [dashboard?.assignments]);
  const alerts = dashboard?.alerts ?? [];
  const activity = dashboard?.activity ?? [];
  const kpis = dashboard?.kpis;

  const judgeUsers = useMemo(
    () => users.filter((candidate) => candidate.roles.includes("JUEZ")),
    [users],
  );

  const effectiveNewCategoryEventId =
    newCategoryEventId && catalog?.events.some((event) => event.id === newCategoryEventId)
      ? newCategoryEventId
      : catalog?.events[0]?.id ?? "";

  const effectiveNewSubcategoryCategoryId =
    newSubcategoryCategoryId &&
    catalog?.categories.some((category) => category.id === newSubcategoryCategoryId)
      ? newSubcategoryCategoryId
      : catalog?.categories[0]?.id ?? "";

  const effectiveJudgeId =
    selectedJudgeId && judgeUsers.some((judge) => judge.id === selectedJudgeId)
      ? selectedJudgeId
      : judgeUsers[0]?.id ?? "";

  const effectiveEventId =
    selectedEventId && catalog?.events.some((event) => event.id === selectedEventId)
      ? selectedEventId
      : catalog?.events[0]?.id ?? "";

  const categoryOptions = useMemo(() => {
    if (!catalog || !effectiveEventId) {
      return [];
    }

    return catalog.categories.filter((category) => category.eventId === effectiveEventId);
  }, [catalog, effectiveEventId]);

  const effectiveCategoryId =
    selectedCategoryId && categoryOptions.some((category) => category.id === selectedCategoryId)
      ? selectedCategoryId
      : categoryOptions[0]?.id ?? "";

  const subcategoryOptions = useMemo(() => {
    if (!catalog || !effectiveCategoryId) {
      return [];
    }

    return catalog.subcategories.filter((subcategory) => subcategory.categoryId === effectiveCategoryId);
  }, [catalog, effectiveCategoryId]);

  const effectiveSubcategoryId =
    selectedSubcategoryId &&
    subcategoryOptions.some((subcategory) => subcategory.id === selectedSubcategoryId)
      ? selectedSubcategoryId
      : subcategoryOptions[0]?.id ?? "";

  const eventNameById = useMemo(() => {
    const map = new Map<string, string>();
    catalog?.events.forEach((event) => {
      map.set(event.id, event.name);
    });
    return map;
  }, [catalog]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    catalog?.categories.forEach((category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, [catalog]);

  const subcategoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    catalog?.subcategories.forEach((subcategory) => {
      map.set(subcategory.id, subcategory.name);
    });
    return map;
  }, [catalog]);

  const userNameById = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((candidate) => {
      map.set(candidate.id, candidate.name);
    });
    return map;
  }, [users]);

  const filteredAssignments = useMemo(() => {
    if (!effectiveJudgeId) {
      return assignments;
    }

    return assignments.filter((assignment) => assignment.judgeUserId === effectiveJudgeId);
  }, [assignments, effectiveJudgeId]);

  const handleCreateEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !newEventName.trim() ||
      !newEventPlace.trim() ||
      !newEventStartDate ||
      !newEventEndDate ||
      !newEventDescription.trim()
    ) {
      return;
    }

    await createEvent({
      name: newEventName,
      status: newEventStatus,
      place: newEventPlace,
      startDate: newEventStartDate,
      endDate: newEventEndDate,
      description: newEventDescription,
    });
    setNewEventName("");
    setNewEventPlace("");
    setNewEventStartDate("");
    setNewEventEndDate("");
    setNewEventDescription("");
  };

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newCategoryName.trim() || !effectiveNewCategoryEventId) {
      return;
    }

    await createCategory({
      eventId: effectiveNewCategoryEventId,
      name: newCategoryName,
    });
    setNewCategoryName("");
  };

  const handleCreateSubcategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newSubcategoryName.trim() || !effectiveNewSubcategoryCategoryId) {
      return;
    }

    await createSubcategory({
      categoryId: effectiveNewSubcategoryCategoryId,
      name: newSubcategoryName,
    });
    setNewSubcategoryName("");
  };

  const handleAssignScope = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!effectiveJudgeId || !effectiveEventId || !effectiveCategoryId || !effectiveSubcategoryId) {
      return;
    }

    await assignJudgeScope({
      judgeUserId: effectiveJudgeId,
      eventId: effectiveEventId,
      categoryId: effectiveCategoryId,
      subcategoryId: effectiveSubcategoryId,
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="relative flex min-h-screen flex-col xl:flex-row">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#1E1E1E] bg-[#000000] p-10 xl:flex">
          <div className="flex items-center gap-3">
            <ChevronDown className="h-5 w-5 text-white" />
            <span className="text-2xl font-bold tracking-[-0.5px] text-white">SicSemper</span>
          </div>

          <nav className="mt-16 flex flex-col gap-7">
            {sidebarItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="flex items-center gap-4">
                <item.icon className={`h-5 w-5 ${item.active ? "text-[#5B68F1]" : "text-[#AAAAAA]"}`} />
                <span
                  className={`text-base ${
                    item.active ? "font-semibold text-[#5B68F1]" : "font-medium text-[#AAAAAA] opacity-80"
                  }`}
                >
                  {item.label}
                </span>
              </a>
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
                  <a
                    key={`mobile-${item.id}`}
                    href={`#${item.id}`}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                      item.active
                        ? "border-[#5B68F1] bg-[rgba(91,104,241,0.15)] text-[#5B68F1]"
                        : "border-[#2A2A2A] bg-[#111111] text-[#AAAAAA]"
                    }`}
                  >
                    <item.icon className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <header id="inicio" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex flex-col gap-1">
                <h1 className={`${outfit.className} text-[30px] leading-none font-bold text-white md:text-[32px]`}>
                  Hola, Admin {user?.name?.split(" ")[0] ?? "SicSemper"}
                </h1>
                <p className="text-sm text-[#AAAAAA]">Centro de control operativo · Panel de gestión global</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
                <div className="rounded-full border border-[#10B981] bg-[rgba(16,185,129,0.1)] px-3 py-1.5 sm:px-4 sm:py-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Sistema estable
                  </span>
                </div>

                <div className="relative flex h-10 w-10 items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-[5px] bg-[#F15BB5]" />
                </div>

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

            <section className="flex w-full flex-col gap-6 rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:p-10">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold tracking-[2px] text-[#F15BB5]">RESUMEN EJECUTIVO</p>
                <h2
                  className={`${outfit.className} text-3xl leading-tight font-bold text-white sm:text-4xl xl:text-5xl xl:leading-none`}
                >
                  Monitoreo operativo del ecosistema SicSemper
                </h2>
                <p className="text-sm text-[#AAAAAA] sm:text-base">
                  Gestiona usuarios, jueces y catálogo de evaluación desde un único panel.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollToSection("eventos")}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#5B68F1] px-5 text-xs font-semibold text-white"
                >
                  Crear evento
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("jueces")}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#5B68F1]/60 bg-[#252B4A] px-5 text-xs font-semibold text-white"
                >
                  Invitar juez
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("categorias")}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#F15BB5]/60 bg-[#2A171D] px-5 text-xs font-semibold text-white"
                >
                  Gestionar categorías
                </button>
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

            <section id="participantes" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Participantes</h3>
                <span className="text-xs text-[#9C9C9C]">Promoción y democión de rol JUEZ</span>
              </div>

              <div className="space-y-3">
                {users.map((candidate) => {
                  const hasJudgeRole = candidate.roles.includes("JUEZ");
                  return (
                    <article
                      key={candidate.id}
                      className="flex flex-col gap-3 rounded-xl bg-[#1A1A1A] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{candidate.name}</p>
                        <p className="text-xs text-[#8D8D8D]">{candidate.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {candidate.roles.map((role) => (
                            <span
                              key={`${candidate.id}-${role}`}
                              className="rounded-full border border-[#2C2C2C] bg-[#151515] px-2 py-1 text-[11px] text-[#D7D7D7]"
                            >
                              {roleLabel[role]}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => void (hasJudgeRole ? demoteJudge(candidate.id) : promoteToJudge(candidate.id))}
                        className={`inline-flex h-9 w-[140px] items-center justify-center rounded-[18px] text-xs font-semibold text-white ${
                          hasJudgeRole ? "bg-[#4B1F2A]" : "bg-[#2D2D2D]"
                        }`}
                      >
                        {hasJudgeRole ? "Quitar juez" : "Hacer juez"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>

            <section id="eventos" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Eventos</h3>
                <span className="text-xs text-[#9C9C9C]">Crear y editar catálogo de eventos</span>
              </div>

              <form onSubmit={(event) => void handleCreateEvent(event)} className="grid gap-3 md:grid-cols-2">
                <input
                  value={newEventName}
                  onChange={(event) => setNewEventName(event.target.value)}
                  placeholder="Nombre del evento"
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                />
                <input
                  value={newEventPlace}
                  onChange={(event) => setNewEventPlace(event.target.value)}
                  placeholder="Lugar"
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                />
                <input
                  type="date"
                  value={newEventStartDate}
                  onChange={(event) => setNewEventStartDate(event.target.value)}
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                />
                <input
                  type="date"
                  value={newEventEndDate}
                  onChange={(event) => setNewEventEndDate(event.target.value)}
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                />
                <select
                  value={newEventStatus}
                  onChange={(event) => setNewEventStatus(event.target.value as CatalogEventStatus)}
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                >
                  {eventStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <textarea
                  value={newEventDescription}
                  onChange={(event) => setNewEventDescription(event.target.value)}
                  placeholder="Descripcion del evento"
                  className="min-h-[92px] rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-sm text-white outline-none md:col-span-2"
                />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white md:col-span-2"
                >
                  Crear evento
                </button>
              </form>

              <div className="mt-4 space-y-3">
                {catalog?.events.map((item) => (
                  <form
                    key={item.id}
                    onSubmit={(event) => {
                      event.preventDefault();
                      const data = new FormData(event.currentTarget);
                      const name = String(data.get("name") ?? "");
                      const place = String(data.get("place") ?? "");
                      const startDate = String(data.get("startDate") ?? "");
                      const endDate = String(data.get("endDate") ?? "");
                      const description = String(data.get("description") ?? "");
                      const status = String(data.get("status") ?? "BORRADOR") as CatalogEventStatus;
                      void updateEvent({ id: item.id, name, status, place, startDate, endDate, description });
                    }}
                    className="grid gap-3 rounded-xl bg-[#1A1A1A] p-4 md:grid-cols-2"
                  >
                    <input
                      name="name"
                      defaultValue={item.name}
                      className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                    />
                    <input
                      name="place"
                      defaultValue={item.place}
                      className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                    />
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={item.startDate}
                      className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                    />
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={item.endDate}
                      className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                    />
                    <select
                      name="status"
                      defaultValue={item.status}
                      className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                    >
                      {eventStatusOptions.map((status) => (
                        <option key={`${item.id}-${status}`} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <textarea
                      name="description"
                      defaultValue={item.description}
                      className="min-h-[92px] rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-sm text-white outline-none md:col-span-2"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2D2D2D] px-4 text-xs font-semibold text-white md:col-span-2"
                    >
                      Guardar
                    </button>
                  </form>
                ))}
              </div>
            </section>
            <section id="jueces" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Jueces</h3>
                <span className="text-xs text-[#9C9C9C]">Asignación por Evento · Categoría · Subcategoría</span>
              </div>

              <form onSubmit={(event) => void handleAssignScope(event)} className="grid gap-3 xl:grid-cols-5">
                <select
                  value={effectiveJudgeId}
                  onChange={(event) => setSelectedJudgeId(event.target.value)}
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                >
                  {judgeUsers.map((judge) => (
                    <option key={judge.id} value={judge.id}>
                      {judge.name}
                    </option>
                  ))}
                </select>

                <select
                  value={effectiveEventId}
                  onChange={(event) => setSelectedEventId(event.target.value)}
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                >
                  {catalog?.events.map((eventItem) => (
                    <option key={eventItem.id} value={eventItem.id}>
                      {eventItem.name}
                    </option>
                  ))}
                </select>

                <select
                  value={effectiveCategoryId}
                  onChange={(event) => setSelectedCategoryId(event.target.value)}
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                >
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={effectiveSubcategoryId}
                  onChange={(event) => setSelectedSubcategoryId(event.target.value)}
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                >
                  {subcategoryOptions.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white"
                >
                  Asignar
                </button>
              </form>

              <div className="mt-4 space-y-3">
                {filteredAssignments.map((assignment: JudgeAssignmentScope) => (
                  <article
                    key={assignment.id}
                    className="flex flex-col gap-3 rounded-xl bg-[#1A1A1A] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-sm text-[#E9E9E9]">
                      <p className="font-semibold text-white">
                        {userNameById.get(assignment.judgeUserId) ?? "Juez"}
                      </p>
                      <p>
                        {eventNameById.get(assignment.eventId) ?? "Evento"} ·{" "}
                        {categoryNameById.get(assignment.categoryId) ?? "Categoría"} ·{" "}
                        {subcategoryNameById.get(assignment.subcategoryId) ?? "Subcategoría"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void removeJudgeScope(assignment.id)}
                      className="inline-flex h-9 w-[120px] items-center justify-center rounded-[18px] bg-[#4B1F2A] text-xs font-semibold text-white"
                    >
                      Quitar
                    </button>
                  </article>
                ))}

                {filteredAssignments.length === 0 ? (
                  <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                    Este juez todavía no tiene alcances asignados.
                  </p>
                ) : null}
              </div>
            </section>

            <section id="clubes" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Clubes</h3>
                <span className="text-xs text-[#9C9C9C]">Vista operativa de organizaciones activas</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {clubData.map((club) => (
                  <article key={club.id} className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
                    <p className="text-sm font-semibold text-white">{club.name}</p>
                    <p className="mt-1 text-xs text-[#8D8D8D]">{club.city}</p>
                    <p className="mt-3 text-[13px] text-[#CFCFCF]">{club.members} miembros activos</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="categorias" className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-8">
              <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
                <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Categorías</h3>

                <form onSubmit={(event) => void handleCreateCategory(event)} className="mt-4 grid gap-3">
                  <input
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="Nombre de categoría"
                    className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                  />
                  <select
                    value={effectiveNewCategoryEventId}
                    onChange={(event) => setNewCategoryEventId(event.target.value)}
                    className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                  >
                    {catalog?.events.map((eventItem) => (
                      <option key={`new-cat-${eventItem.id}`} value={eventItem.id}>
                        {eventItem.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white"
                  >
                    Crear categoría
                  </button>
                </form>

                <div className="mt-4 space-y-3">
                  {catalog?.categories.map((item) => (
                    <form
                      key={item.id}
                      onSubmit={(event) => {
                        event.preventDefault();
                        const data = new FormData(event.currentTarget);
                        const eventId = String(data.get("eventId") ?? "");
                        const name = String(data.get("name") ?? "");
                        void updateCategory({ id: item.id, eventId, name });
                      }}
                      className="grid gap-3 rounded-xl bg-[#1A1A1A] p-4"
                    >
                      <input
                        name="name"
                        defaultValue={item.name}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      />
                      <select
                        name="eventId"
                        defaultValue={item.eventId}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      >
                        {catalog.events.map((eventItem) => (
                          <option key={`${item.id}-${eventItem.id}`} value={eventItem.id}>
                            {eventItem.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2D2D2D] px-4 text-xs font-semibold text-white"
                      >
                        Guardar
                      </button>
                    </form>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
                <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Subcategorías</h3>

                <form onSubmit={(event) => void handleCreateSubcategory(event)} className="mt-4 grid gap-3">
                  <input
                    value={newSubcategoryName}
                    onChange={(event) => setNewSubcategoryName(event.target.value)}
                    placeholder="Nombre de subcategoría"
                    className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                  />
                  <select
                    value={effectiveNewSubcategoryCategoryId}
                    onChange={(event) => setNewSubcategoryCategoryId(event.target.value)}
                    className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                  >
                    {catalog?.categories.map((category) => (
                      <option key={`new-sub-${category.id}`} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white"
                  >
                    Crear subcategoría
                  </button>
                </form>

                <div className="mt-4 space-y-3">
                  {catalog?.subcategories.map((item) => (
                    <form
                      key={item.id}
                      onSubmit={(event) => {
                        event.preventDefault();
                        const data = new FormData(event.currentTarget);
                        const categoryId = String(data.get("categoryId") ?? "");
                        const name = String(data.get("name") ?? "");
                        void updateSubcategory({ id: item.id, categoryId, name });
                      }}
                      className="grid gap-3 rounded-xl bg-[#1A1A1A] p-4"
                    >
                      <input
                        name="name"
                        defaultValue={item.name}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      />
                      <select
                        name="categoryId"
                        defaultValue={item.categoryId}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      >
                        {catalog.categories.map((category) => (
                          <option key={`${item.id}-${category.id}`} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2D2D2D] px-4 text-xs font-semibold text-white"
                      >
                        Guardar
                      </button>
                    </form>
                  ))}
                </div>
              </article>
            </section>

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
                    Alertas del sistema
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

            <footer className="pb-6 text-xs text-[#777777]">
              {loading ? "Actualizando panel..." : "Panel Admin v1 · Datos mock en memoria de sesión"}
              <span className="ml-2 inline-flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Sin integración backend en esta fase
              </span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
