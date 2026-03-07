"use client";

import { Outfit } from "next/font/google";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { useEffect, useMemo, useRef, useState, type ComponentType, type FormEvent } from "react";
import type {
  CategoryDeleteImpact,
  ClubDeleteImpact,
  CatalogEventStatus,
  EventDeleteImpact,
} from "@/domain/admin/admin.types";
import type { UserRole } from "@/domain/user/user.types";
import type { User } from "@/domain/user/user.types";
import { DashboardRoleSwitch } from "@/presentation/components/layout";
import { useAuthStore, useAdminStore } from "@/presentation/stores";
import { Skeleton } from "@/presentation/components/ui";

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

type AdminSectionId =
  | "inicio"
  | "participantes"
  | "eventos"
  | "jueces"
  | "clubes"
  | "categorias"
  | "ajustes";

const adminSectionIds: readonly AdminSectionId[] = [
  "inicio",
  "participantes",
  "eventos",
  "jueces",
  "clubes",
  "categorias",
  "ajustes",
];

const resolveAdminSection = (value: string | null): AdminSectionId =>
  value && adminSectionIds.includes(value as AdminSectionId) ? (value as AdminSectionId) : "inicio";

const sidebarItems: SidebarItem[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "participantes", label: "Participantes", icon: Users },
  { id: "eventos", label: "Eventos", icon: Trophy },
  { id: "jueces", label: "Jueces", icon: UserCog },
  { id: "clubes", label: "Clubes", icon: Shield },
  { id: "categorias", label: "Categorías", icon: FolderTree },
  { id: "ajustes", label: "Ajustes", icon: Settings },
];

const eventStatusOptions: CatalogEventStatus[] = ["ACTIVO", "PAUSADO", "BORRADOR"];

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const roleLabel: Record<"PARTICIPANTE" | "JUEZ" | "ADMIN", string> = {
  PARTICIPANTE: "Participante",
  JUEZ: "Juez",
  ADMIN: "Admin",
};

const participantStatusConfig: Record<string, { label: string; className: string }> = {
  ACTIVO: { label: "Activo", className: "bg-green-900/40 text-green-400" },
  INACTIVO: { label: "Inactivo", className: "bg-[#2D2D2D] text-[#9C9C9C]" },
  SUSPENDIDO: { label: "Suspendido", className: "bg-red-900/40 text-red-400" },
};

type EventModalMode = "create" | "edit";
type EventFormState = {
  name: string;
  place: string;
  startDate: string;
  endDate: string;
  status: CatalogEventStatus;
  description: string;
  imageUrl: string;
};
type ClubModalMode = "create" | "edit";
type ClubFormState = {
  name: string;
  place: string;
  contactEmail: string;
  description: string;
  logoUrl: string;
};
type CategoryModalMode = "create" | "edit";
type CategoryFormState = {
  name: string;
};
type SubcategoryModalMode = "create" | "edit";
type SubcategoryFormState = {
  name: string;
};

const emptyEventForm: EventFormState = {
  name: "",
  place: "",
  startDate: "",
  endDate: "",
  status: "BORRADOR",
  description: "",
  imageUrl: "",
};

const emptyClubForm: ClubFormState = {
  name: "",
  place: "",
  contactEmail: "",
  description: "",
  logoUrl: "",
};

const emptyCategoryForm: CategoryFormState = {
  name: "",
};
const emptySubcategoryForm: SubcategoryFormState = {
  name: "",
};

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
            <article key={`admin-kpi-skeleton-${index}`} className="rounded-[20px] border border-[#2D2D2D] bg-[#121212] p-6">
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
              <div key={`admin-list-skeleton-${index}`} className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
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

export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const searchParamsString = searchParams.toString();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const users = useAdminStore((state) => state.users);
  const dashboard = useAdminStore((state) => state.dashboard);
  const loading = useAdminStore((state) => state.loading);
  const error = useAdminStore((state) => state.error);

  const loadDashboard = useAdminStore((state) => state.loadDashboard);
  const clearError = useAdminStore((state) => state.clearError);
  const createClub = useAdminStore((state) => state.createClub);
  const updateClub = useAdminStore((state) => state.updateClub);
  const getClubDeleteImpact = useAdminStore((state) => state.getClubDeleteImpact);
  const removeClub = useAdminStore((state) => state.removeClub);
  const promoteToJudge = useAdminStore((state) => state.promoteToJudge);
  const demoteJudge = useAdminStore((state) => state.demoteJudge);
  const banParticipant = useAdminStore((state) => state.banParticipant);
  const unbanParticipant = useAdminStore((state) => state.unbanParticipant);
  const createEventAndLinkCategories = useAdminStore((state) => state.createEventAndLinkCategories);
  const updateEvent = useAdminStore((state) => state.updateEvent);
  const updateEventAndLinkCategories = useAdminStore((state) => state.updateEventAndLinkCategories);
  const getEventDeleteImpact = useAdminStore((state) => state.getEventDeleteImpact);
  const removeEvent = useAdminStore((state) => state.removeEvent);
  const createCategory = useAdminStore((state) => state.createCategory);
  const updateCategory = useAdminStore((state) => state.updateCategory);
  const getCategoryDeleteImpact = useAdminStore((state) => state.getCategoryDeleteImpact);
  const removeCategory = useAdminStore((state) => state.removeCategory);
  const createSubcategory = useAdminStore((state) => state.createSubcategory);
  const updateSubcategory = useAdminStore((state) => state.updateSubcategory);
  const removeSubcategory = useAdminStore((state) => state.removeSubcategory);

  const [eventModalMode, setEventModalMode] = useState<EventModalMode | null>(null);
  const [eventModalStep, setEventModalStep] = useState<1 | 2>(1);
  const [eventModalSelectedCategoryIds, setEventModalSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [eventModalTargetId, setEventModalTargetId] = useState<string | null>(null);
  const [eventModalError, setEventModalError] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>(emptyEventForm);
  const [isEventImageUploading, setIsEventImageUploading] = useState(false);
  const eventImageFileInputRef = useRef<HTMLInputElement | null>(null);
  const [clubModalMode, setClubModalMode] = useState<ClubModalMode | null>(null);
  const [clubModalTargetId, setClubModalTargetId] = useState<string | null>(null);
  const [clubForm, setClubForm] = useState<ClubFormState>(emptyClubForm);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [categoryModalMode, setCategoryModalMode] = useState<CategoryModalMode | null>(null);
  const [categoryModalTargetId, setCategoryModalTargetId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [subcategoryModalMode, setSubcategoryModalMode] = useState<SubcategoryModalMode | null>(null);
  const [subcategoryModalTargetId, setSubcategoryModalTargetId] = useState<string | null>(null);
  const [subcategoryModalCategoryId, setSubcategoryModalCategoryId] = useState<string | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState<SubcategoryFormState>(emptySubcategoryForm);
  const [subcategoryDeleteModal, setSubcategoryDeleteModal] = useState<{
    subcategoryId: string;
    subcategoryName: string;
    categoryId: string;
  } | null>(null);

  const [judgeSearch, setJudgeSearch] = useState("");
  const [addJudgeModalOpen, setAddJudgeModalOpen] = useState(false);
  const [addJudgeSearch, setAddJudgeSearch] = useState("");
  const [addJudgeSelectedUserId, setAddJudgeSelectedUserId] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState<"TODOS" | CatalogEventStatus>("TODOS");
  const [clubSearch, setClubSearch] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [eventDeleteImpactModal, setEventDeleteImpactModal] = useState<{
    eventId: string;
    eventName: string;
    impact: EventDeleteImpact | null;
    loading: boolean;
    error: string | null;
  } | null>(null);
  const [clubDeleteImpactModal, setClubDeleteImpactModal] = useState<{
    clubId: string;
    clubName: string;
    impact: ClubDeleteImpact | null;
    loading: boolean;
    error: string | null;
  } | null>(null);
  const [categoryDeleteImpactModal, setCategoryDeleteImpactModal] = useState<{
    categoryId: string;
    categoryName: string;
    impact: CategoryDeleteImpact | null;
    loading: boolean;
    error: string | null;
  } | null>(null);
  const [categoryDeleteConfirmText, setCategoryDeleteConfirmText] = useState("");
  const [participantDetailModal, setParticipantDetailModal] = useState<User | null>(null);
  const activeSection = resolveAdminSection(tabParam);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const setActiveSection = (section: AdminSectionId) => {
    if (section === activeSection) {
      return;
    }

    const params = new URLSearchParams(searchParamsString);
    params.set("tab", section);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const catalog = dashboard?.catalog;
  const assignments = useMemo(() => dashboard?.assignments ?? [], [dashboard?.assignments]);
  const alerts = dashboard?.alerts ?? [];
  const activity = dashboard?.activity ?? [];
  const clubs = useMemo(() => dashboard?.clubs ?? [], [dashboard?.clubs]);
  const kpis = dashboard?.kpis;

  const judgeUsers = useMemo(
    () => users.filter((candidate) => candidate.roles.includes("JUEZ")),
    [users],
  );


  const filteredJudgeUsers = useMemo(() => {
    const query = judgeSearch.trim().toLowerCase();
    if (!query) return judgeUsers;
    return judgeUsers.filter((j) => `${j.name} ${j.email}`.toLowerCase().includes(query));
  }, [judgeUsers, judgeSearch]);

  const judgeAssignmentCount = useMemo(() => {
    const counts = new Map<string, number>();
    assignments.forEach((a) => {
      counts.set(a.judgeUserId, (counts.get(a.judgeUserId) ?? 0) + 1);
    });
    return counts;
  }, [assignments]);

  const nonJudgeUsers = useMemo(
    () => users.filter((u) => !u.roles.includes("JUEZ")),
    [users],
  );

  const filteredNonJudgeUsers = useMemo(() => {
    const query = addJudgeSearch.trim().toLowerCase();
    if (!query) return nonJudgeUsers;
    return nonJudgeUsers.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(query));
  }, [nonJudgeUsers, addJudgeSearch]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = participantSearch.trim().toLowerCase();

    return users.filter((candidate) => {
      if (!candidate.roles.includes("PARTICIPANTE")) return false;
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : `${candidate.name} ${candidate.email} ${candidate.roles.join(" ")}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesSearch;
    });
  }, [users, participantSearch]);

  const participantKpis = useMemo(() => {
    const all = users.filter((u) => u.roles.includes("PARTICIPANTE"));
    return {
      total: all.length,
      verified: all.filter((u) => u.verified).length,
      active: all.filter((u) => u.status === "ACTIVO").length,
    };
  }, [users]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = eventSearch.trim().toLowerCase();

    return (catalog?.events ?? []).filter((eventItem) => {
      const matchesStatus = eventStatusFilter === "TODOS" ? true : eventItem.status === eventStatusFilter;
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : `${eventItem.name} ${eventItem.place ?? ""} ${eventItem.description ?? ""}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [catalog?.events, eventSearch, eventStatusFilter]);

  const filteredClubs = useMemo(() => {
    const normalizedQuery = clubSearch.trim().toLowerCase();

    return clubs.filter((club) => {
      if (normalizedQuery.length === 0) {
        return true;
      }

      return `${club.name} ${club.place} ${club.contactEmail} ${club.description ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [clubSearch, clubs]);

  const categoryItems = catalog?.categories ?? [];
  const subcategoriesByCategoryId = useMemo(() => {
    const map = new Map<string, Array<{ id: string; categoryId: string; name: string }>>();

    (catalog?.subcategories ?? []).forEach((subcategory) => {
      const current = map.get(subcategory.categoryId) ?? [];
      current.push(subcategory);
      map.set(subcategory.categoryId, current);
    });

    return map;
  }, [catalog?.subcategories]);

  const visibleSidebarItems = useMemo(
    () =>
      sidebarItems.map((item) => ({
        ...item,
        active: item.id === activeSection,
      })),
    [activeSection],
  );

  const runAdminAction = async ({
    actionKey,
    successMessage,
    action,
  }: {
    actionKey: string;
    successMessage: string;
    action: () => Promise<void>;
  }) => {
    setPendingAction(actionKey);
    setActionFeedback(null);
    clearError();
    await action();
    const latestError = useAdminStore.getState().error;
    setPendingAction(null);

    if (latestError) {
      setActionFeedback({
        type: "error",
        message: latestError,
      });
      return false;
    }

    setActionFeedback({
      type: "success",
      message: successMessage,
    });
    return true;
  };

  const handleBanParticipant = async (userId: string, isBanned: boolean) => {
    const success = await runAdminAction({
      actionKey: `user:ban:${userId}`,
      successMessage: isBanned ? "Suspensión levantada." : "Participante suspendido.",
      action: () => (isBanned ? unbanParticipant(userId) : banParticipant(userId)),
    });
    if (success) setParticipantDetailModal(null);
  };

  const openCreateEventModal = () => {
    setActionFeedback(null);
    clearError();
    setEventModalMode("create");
    setEventModalTargetId(null);
    setEventForm(emptyEventForm);
    setEventModalStep(1);
    setEventModalSelectedCategoryIds(new Set());
    setEventModalError(null);
  };

  const openEditEventModal = (eventItem: {
    id: string;
    name: string;
    place?: string;
    startDate?: string;
    endDate?: string;
    status: CatalogEventStatus;
    description?: string;
    imageUrl?: string;
  }) => {
    setActionFeedback(null);
    clearError();
    setEventModalError(null);
    setEventModalMode("edit");
    setEventModalTargetId(eventItem.id);
    setEventModalStep(1);
    setEventForm({
      name: eventItem.name,
      place: eventItem.place ?? "",
      startDate: eventItem.startDate ?? "",
      endDate: eventItem.endDate ?? "",
      status: eventItem.status,
      description: eventItem.description ?? "",
      imageUrl: eventItem.imageUrl ?? "",
    });

    const rootCategoryIds = new Set((catalog?.categories ?? []).map((c) => c.id));
    const linkedRootIds = new Set(
      (catalog?.eventCategories ?? [])
        .filter((ec) => ec.eventId === eventItem.id && rootCategoryIds.has(ec.categoryId))
        .map((ec) => ec.categoryId),
    );
    setEventModalSelectedCategoryIds(linkedRootIds);
  };

  const closeEventModal = () => {
    if (pendingAction === "event:create") {
      return;
    }
    if (eventModalTargetId && pendingAction === `event:update:${eventModalTargetId}`) {
      return;
    }

    setEventModalMode(null);
    setEventModalTargetId(null);
    setEventForm(emptyEventForm);
    setEventModalStep(1);
    setEventModalSelectedCategoryIds(new Set());
    setEventModalError(null);
    if (eventImageFileInputRef.current) {
      eventImageFileInputRef.current.value = "";
    }
  };

  const handleEventImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsEventImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/event-image", { method: "POST", body: fd });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setEventModalError(data.error ?? "No se pudo subir la imagen del evento.");
        return;
      }

      const data = (await res.json()) as { url: string };
      setEventForm((prev) => ({ ...prev, imageUrl: data.url }));
      setEventModalError(null);
    } catch {
      setEventModalError("No se pudo subir la imagen del evento.");
    } finally {
      setIsEventImageUploading(false);
      if (eventImageFileInputRef.current) {
        eventImageFileInputRef.current.value = "";
      }
    }
  };

  const handleSubmitEventModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !eventForm.name.trim() ||
      !eventForm.place.trim() ||
      !eventForm.startDate ||
      !eventForm.endDate ||
      !eventForm.description.trim()
    ) {
      setEventModalError("Completa todos los campos requeridos para guardar el evento.");
      return;
    }

    if (eventForm.startDate > eventForm.endDate) {
      setEventModalError("La fecha de inicio no puede ser mayor que la fecha de fin.");
      return;
    }

    setEventModalError(null);

    if (eventModalMode === "create" || eventModalMode === "edit") {
      setEventModalStep(2);
      return;
    }
  };

  const handleConfirmCreateEvent = async () => {
    const allCategoryIds: string[] = [];
    for (const rootId of eventModalSelectedCategoryIds) {
      allCategoryIds.push(rootId);
      (subcategoriesByCategoryId.get(rootId) ?? []).forEach((s) => allCategoryIds.push(s.id));
    }

    const success = await runAdminAction({
      actionKey: "event:create",
      successMessage: "Evento creado correctamente.",
      action: () =>
        createEventAndLinkCategories(
          {
            name: eventForm.name,
            status: eventForm.status,
            place: eventForm.place,
            startDate: eventForm.startDate,
            endDate: eventForm.endDate,
            description: eventForm.description,
            imageUrl: eventForm.imageUrl || undefined,
          },
          allCategoryIds,
        ),
    });

    if (success) {
      closeEventModal();
    }
  };

  const handleConfirmUpdateEvent = async () => {
    if (!eventModalTargetId) return;

    const allCategoryIds: string[] = [];
    for (const rootId of eventModalSelectedCategoryIds) {
      allCategoryIds.push(rootId);
      (subcategoriesByCategoryId.get(rootId) ?? []).forEach((s) => allCategoryIds.push(s.id));
    }

    const success = await runAdminAction({
      actionKey: `event:update:${eventModalTargetId}`,
      successMessage: "Evento actualizado correctamente.",
      action: () =>
        updateEventAndLinkCategories(
          {
            id: eventModalTargetId,
            name: eventForm.name,
            status: eventForm.status,
            place: eventForm.place,
            startDate: eventForm.startDate,
            endDate: eventForm.endDate,
            description: eventForm.description,
            imageUrl: eventForm.imageUrl || undefined,
          },
          allCategoryIds,
        ),
    });

    if (success) {
      closeEventModal();
    }
  };

  const openCreateCategoryModal = () => {
    setActionFeedback(null);
    clearError();
    setCategoryModalMode("create");
    setCategoryModalTargetId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const openEditCategoryModal = (category: { id: string; name: string; eventId?: string | null }) => {
    setActionFeedback(null);
    clearError();
    setCategoryModalMode("edit");
    setCategoryModalTargetId(category.id);
    setCategoryForm({
      name: category.name,
    });
  };

  const closeCategoryModal = () => {
    if (pendingAction === "category:create") {
      return;
    }
    if (categoryModalTargetId && pendingAction === `category:update:${categoryModalTargetId}`) {
      return;
    }

    setCategoryModalMode(null);
    setCategoryModalTargetId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const handleSubmitCategoryModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      setActionFeedback({
        type: "error",
        message: "Completa el nombre de la categoría.",
      });
      return;
    }

    if (categoryModalMode === "create") {
      const success = await runAdminAction({
        actionKey: "category:create",
        successMessage: "Categoría creada correctamente.",
        action: () =>
          createCategory({
            name: categoryForm.name,
          }),
      });

      if (success) {
        closeCategoryModal();
      }
      return;
    }

    if (categoryModalMode === "edit" && categoryModalTargetId) {
      const success = await runAdminAction({
        actionKey: `category:update:${categoryModalTargetId}`,
        successMessage: "Categoría actualizada correctamente.",
        action: () =>
          updateCategory({
            id: categoryModalTargetId,
            name: categoryForm.name,
          }),
      });

      if (success) {
        closeCategoryModal();
      }
    }
  };

  const openCreateSubcategoryModal = (categoryId: string) => {
    setActionFeedback(null);
    clearError();
    setSubcategoryModalMode("create");
    setSubcategoryModalTargetId(null);
    setSubcategoryModalCategoryId(categoryId);
    setSubcategoryForm(emptySubcategoryForm);
  };

  const openEditSubcategoryModal = (subcategory: { id: string; categoryId: string; name: string }) => {
    setActionFeedback(null);
    clearError();
    setSubcategoryModalMode("edit");
    setSubcategoryModalTargetId(subcategory.id);
    setSubcategoryModalCategoryId(subcategory.categoryId);
    setSubcategoryForm({ name: subcategory.name });
  };

  const closeSubcategoryModal = () => {
    if (pendingAction === "subcategory:create") return;
    if (subcategoryModalTargetId && pendingAction === `subcategory:update:${subcategoryModalTargetId}`) return;
    setSubcategoryModalMode(null);
    setSubcategoryModalTargetId(null);
    setSubcategoryModalCategoryId(null);
    setSubcategoryForm(emptySubcategoryForm);
  };

  const handleSubmitSubcategoryModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subcategoryForm.name.trim()) {
      setActionFeedback({ type: "error", message: "Completa el nombre de la subcategoría." });
      return;
    }
    if (subcategoryModalMode === "create" && subcategoryModalCategoryId) {
      const success = await runAdminAction({
        actionKey: "subcategory:create",
        successMessage: "Subcategoría creada correctamente.",
        action: () => createSubcategory({ categoryId: subcategoryModalCategoryId, name: subcategoryForm.name }),
      });
      if (success) closeSubcategoryModal();
      return;
    }
    if (subcategoryModalMode === "edit" && subcategoryModalTargetId && subcategoryModalCategoryId) {
      const success = await runAdminAction({
        actionKey: `subcategory:update:${subcategoryModalTargetId}`,
        successMessage: "Subcategoría actualizada correctamente.",
        action: () =>
          updateSubcategory({ id: subcategoryModalTargetId, categoryId: subcategoryModalCategoryId, name: subcategoryForm.name }),
      });
      if (success) closeSubcategoryModal();
    }
  };

  const openSubcategoryDeleteModal = (subcategoryId: string, subcategoryName: string, categoryId: string) => {
    setActionFeedback(null);
    clearError();
    setSubcategoryDeleteModal({ subcategoryId, subcategoryName, categoryId });
  };

  const closeSubcategoryDeleteModal = () => {
    if (subcategoryDeleteModal && pendingAction === `subcategory:delete:${subcategoryDeleteModal.subcategoryId}`) return;
    setSubcategoryDeleteModal(null);
  };

  const confirmDeleteSubcategory = async () => {
    if (!subcategoryDeleteModal) return;
    const { subcategoryId } = subcategoryDeleteModal;
    const success = await runAdminAction({
      actionKey: `subcategory:delete:${subcategoryId}`,
      successMessage: "Subcategoría eliminada correctamente.",
      action: () => removeSubcategory(subcategoryId),
    });
    if (success) setSubcategoryDeleteModal(null);
  };


  const handleAddJudge = async () => {
    if (!addJudgeSelectedUserId) return;
    const success = await runAdminAction({
      actionKey: `judge:promote:${addJudgeSelectedUserId}`,
      successMessage: "Usuario promovido a juez correctamente.",
      action: () => promoteToJudge(addJudgeSelectedUserId),
    });
    if (success) {
      setAddJudgeModalOpen(false);
      setAddJudgeSearch("");
      setAddJudgeSelectedUserId("");
    }
  };

  const openEventDeleteImpactModal = async (eventId: string, eventName: string) => {
    setActionFeedback(null);
    clearError();
    setEventDeleteImpactModal({
      eventId,
      eventName,
      impact: null,
      loading: true,
      error: null,
    });

    try {
      const impact = await getEventDeleteImpact(eventId);
      setEventDeleteImpactModal((prev) =>
        prev && prev.eventId === eventId
          ? {
              ...prev,
              impact,
              loading: false,
            }
          : prev,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo calcular el impacto de eliminación para este evento.";
      setEventDeleteImpactModal((prev) =>
        prev && prev.eventId === eventId
          ? {
              ...prev,
              loading: false,
              error: message,
            }
          : prev,
      );
    }
  };

  const closeEventDeleteImpactModal = () => {
    if (eventDeleteImpactModal && pendingAction === `event:delete:${eventDeleteImpactModal.eventId}`) {
      return;
    }
    setEventDeleteImpactModal(null);
  };

  const confirmDeleteEvent = async () => {
    if (!eventDeleteImpactModal) {
      return;
    }

    const { eventId } = eventDeleteImpactModal;
    const success = await runAdminAction({
      actionKey: `event:delete:${eventId}`,
      successMessage: "Evento eliminado correctamente.",
      action: () => removeEvent(eventId),
    });

    if (success) {
      if (eventModalMode === "edit" && eventModalTargetId === eventId) {
        closeEventModal();
      }
      setEventDeleteImpactModal(null);
    }
  };

  const openCreateClubModal = () => {
    setActionFeedback(null);
    clearError();
    setClubModalMode("create");
    setClubModalTargetId(null);
    setClubForm(emptyClubForm);
  };

  const openEditClubModal = (club: {
    id: string;
    name: string;
    place: string;
    contactEmail: string;
    description?: string | null;
    logoUrl?: string | null;
  }) => {
    setActionFeedback(null);
    clearError();
    setClubModalMode("edit");
    setClubModalTargetId(club.id);
    setClubForm({
      name: club.name,
      place: club.place,
      contactEmail: club.contactEmail,
      description: club.description ?? "",
      logoUrl: club.logoUrl ?? "",
    });
  };;

  const closeClubModal = () => {
    if (pendingAction === "club:create") {
      return;
    }
    if (clubModalTargetId && pendingAction === `club:update:${clubModalTargetId}`) {
      return;
    }

    setClubModalMode(null);
    setClubModalTargetId(null);
    setClubForm(emptyClubForm);
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/club-logo", { method: "POST", body: fd });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setActionFeedback({ type: "error", message: data.error ?? "No se pudo subir el logotipo." });
        return;
      }
      const data = (await res.json()) as { url: string };
      setClubForm((prev) => ({ ...prev, logoUrl: data.url }));
    } catch {
      setActionFeedback({ type: "error", message: "No se pudo subir el logotipo." });
    } finally {
      setIsLogoUploading(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    }
  };

  const handleSubmitClubModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!clubForm.name.trim() || !clubForm.place.trim() || !clubForm.contactEmail.trim()) {
      setActionFeedback({
        type: "error",
        message: "Completa nombre, lugar y correo de contacto del club.",
      });
      return;
    }

    const normalizedEmail = clubForm.contactEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setActionFeedback({
        type: "error",
        message: "Ingresa un correo de contacto valido.",
      });
      return;
    }

    if (clubModalMode === "create") {
      const success = await runAdminAction({
        actionKey: "club:create",
        successMessage: "Club creado correctamente.",
        action: () =>
          createClub({
            name: clubForm.name,
            place: clubForm.place,
            contactEmail: normalizedEmail,
            description: clubForm.description || undefined,
            logoUrl: clubForm.logoUrl || undefined,
          }),
      });

      if (success) {
        closeClubModal();
      }
      return;
    }

    if (clubModalMode === "edit" && clubModalTargetId) {
      const success = await runAdminAction({
        actionKey: `club:update:${clubModalTargetId}`,
        successMessage: "Club actualizado correctamente.",
        action: () =>
          updateClub({
            id: clubModalTargetId,
            name: clubForm.name,
            place: clubForm.place,
            contactEmail: normalizedEmail,
            description: clubForm.description || undefined,
            logoUrl: clubForm.logoUrl || undefined,
          }),
      });

      if (success) {
        closeClubModal();
      }
    }
  };

  const openClubDeleteImpactModal = async (clubId: string, clubName: string) => {
    setActionFeedback(null);
    clearError();
    setClubDeleteImpactModal({
      clubId,
      clubName,
      impact: null,
      loading: true,
      error: null,
    });

    try {
      const impact = await getClubDeleteImpact(clubId);
      setClubDeleteImpactModal((prev) =>
        prev && prev.clubId === clubId
          ? {
              ...prev,
              impact,
              loading: false,
            }
          : prev,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo calcular el impacto de eliminación del club.";
      setClubDeleteImpactModal((prev) =>
        prev && prev.clubId === clubId
          ? {
              ...prev,
              loading: false,
              error: message,
            }
          : prev,
      );
    }
  };

  const closeClubDeleteImpactModal = () => {
    if (clubDeleteImpactModal && pendingAction === `club:delete:${clubDeleteImpactModal.clubId}`) {
      return;
    }
    setClubDeleteImpactModal(null);
  };

  const confirmDeleteClub = async () => {
    if (!clubDeleteImpactModal) {
      return;
    }

    const { clubId } = clubDeleteImpactModal;
    const success = await runAdminAction({
      actionKey: `club:delete:${clubId}`,
      successMessage: "Club eliminado correctamente.",
      action: () => removeClub(clubId),
    });

    if (success) {
      if (clubModalMode === "edit" && clubModalTargetId === clubId) {
        closeClubModal();
      }
      setClubDeleteImpactModal(null);
    }
  };

  const openCategoryDeleteImpactModal = async (categoryId: string, categoryName: string) => {
    setActionFeedback(null);
    clearError();
    setCategoryDeleteImpactModal({
      categoryId,
      categoryName,
      impact: null,
      loading: true,
      error: null,
    });

    try {
      const impact = await getCategoryDeleteImpact(categoryId);
      setCategoryDeleteImpactModal((prev) =>
        prev && prev.categoryId === categoryId
          ? {
              ...prev,
              impact,
              loading: false,
            }
          : prev,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo calcular el impacto de eliminación de la categoría.";
      setCategoryDeleteImpactModal((prev) =>
        prev && prev.categoryId === categoryId
          ? {
              ...prev,
              loading: false,
              error: message,
            }
          : prev,
      );
    }
  };

  const closeCategoryDeleteImpactModal = () => {
    if (categoryDeleteImpactModal && pendingAction === `category:delete:${categoryDeleteImpactModal.categoryId}`) {
      return;
    }
    setCategoryDeleteImpactModal(null);
    setCategoryDeleteConfirmText("");
  };

  const confirmDeleteCategory = async () => {
    if (!categoryDeleteImpactModal) {
      return;
    }

    const { categoryId } = categoryDeleteImpactModal;
    const success = await runAdminAction({
      actionKey: `category:delete:${categoryId}`,
      successMessage: "Categoría eliminada correctamente.",
      action: () => removeCategory(categoryId),
    });

    if (success) {
      if (categoryModalMode === "edit" && categoryModalTargetId === categoryId) {
        closeCategoryModal();
      }
      if (expandedCategoryId === categoryId) {
        setExpandedCategoryId(null);
      }
      setCategoryDeleteImpactModal(null);
      setCategoryDeleteConfirmText("");
    }
  };


  const handleToggleJudgeRole = async (userId: string, hasJudgeRole: boolean) => {
    if (hasJudgeRole) {
      const confirmed = window.confirm("¿Seguro que deseas quitar el rol de juez a este usuario?");
      if (!confirmed) {
        return;
      }
    }

    await runAdminAction({
      actionKey: `user:judge:${userId}`,
      successMessage: hasJudgeRole
        ? "Rol de juez removido correctamente."
        : "Usuario promovido a juez correctamente.",
      action: () => (hasJudgeRole ? demoteJudge(userId) : promoteToJudge(userId)),
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isEventModalPending =
    pendingAction === "event:create" ||
    (eventModalTargetId ? pendingAction === `event:update:${eventModalTargetId}` : false);
  const isClubModalPending =
    pendingAction === "club:create" ||
    (clubModalTargetId ? pendingAction === `club:update:${clubModalTargetId}` : false);

  if (loading && !dashboard) {
    return <AdminDashboardLoading />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      <div className="relative flex min-h-screen flex-col xl:flex-row">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#1E1E1E] bg-[#000000] p-10 xl:flex">
          <div className="flex items-center gap-3">
            <ChevronDown className="h-5 w-5 text-white" />
            <span className="text-2xl font-bold tracking-[-0.5px] text-white">SicSemper</span>
          </div>

          <nav className="mt-16 flex flex-col gap-7">
            {visibleSidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
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
              </button>
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
                <span className="text-lg font-bold tracking-[-0.3px] text-white">SicSemper</span>
              </div>
              <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {visibleSidebarItems.map((item) => (
                  <button
                    key={`mobile-${item.id}`}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
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

            <header id="inicio" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex flex-col gap-1">
                <h1 className={`${outfit.className} text-[30px] leading-none font-bold text-white md:text-[32px]`}>
                  Hola, Admin {user?.name?.split(" ")[0] ?? "SicSemper"}
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
            {actionFeedback ? (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  actionFeedback.type === "success"
                    ? "border-[#14532d] bg-[#052e16]/40 text-[#86efac]"
                    : "border-[#7f1d1d] bg-[#7f1d1d]/20 text-[#fca5a5]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p>{actionFeedback.message}</p>
                  <button
                    type="button"
                    onClick={() => setActionFeedback(null)}
                    className="rounded-md border border-current/40 px-2 py-1 text-xs font-semibold text-current"
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
                    <button
                      type="button"
                      onClick={() => setActiveSection("eventos")}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-[#5B68F1] px-5 text-xs font-semibold text-white"
                    >
                      Crear evento
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("jueces")}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-[#5B68F1]/60 bg-[#252B4A] px-5 text-xs font-semibold text-white"
                    >
                      Invitar juez
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("categorias")}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-[#F15BB5]/60 bg-[#2A171D] px-5 text-xs font-semibold text-white"
                    >
                      Gestionar categorias
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
              </>
            ) : null}

            {activeSection === "participantes" ? (
              <section
                id="participantes"
                className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8"
              >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Participantes</h3>
                <span className="text-xs text-[#9C9C9C]">Gestión de participantes registrados</span>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Total</p>
                  <p className="text-2xl font-semibold text-white">{participantKpis.total}</p>
                </div>
                <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Verificados</p>
                  <p className="text-2xl font-semibold text-green-400">{participantKpis.verified}</p>
                </div>
                <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                  <p className="text-[11px] text-[#9C9C9C]">Activos</p>
                  <p className="text-2xl font-semibold text-[#A8AFFF]">{participantKpis.active}</p>
                </div>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-2">
                <input
                  value={participantSearch}
                  onChange={(event) => setParticipantSearch(event.target.value)}
                  placeholder="Buscar por nombre o correo"
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                />
                <p className="flex h-10 items-center rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 text-xs text-[#9C9C9C]">
                  {filteredUsers.length} participante(s) visibles
                </p>
              </div>

              <div className="space-y-3">
                {filteredUsers.map((candidate) => {
                  const statusCfg = participantStatusConfig[candidate.status ?? ""] ?? participantStatusConfig["INACTIVO"];
                  return (
                    <article
                      key={candidate.id}
                      className="flex flex-col gap-3 rounded-xl bg-[#1A1A1A] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">{candidate.name}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusCfg.className}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#8D8D8D]">{candidate.email}</p>
                        {candidate.club ? (
                          <p className="mt-1 text-[11px] text-[#9C9C9C]">
                            Club: <span className="text-[#D1D1D1]">{candidate.club.name}</span>
                          </p>
                        ) : (
                          <p className="mt-1 text-[11px] text-[#9C9C9C]">Sin club asignado</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setParticipantDetailModal(candidate)}
                        className="inline-flex h-9 shrink-0 items-center justify-center rounded-[18px] border border-[#2D2D2D] bg-[#1E1E1E] px-4 text-xs font-semibold text-[#D1D1D1]"
                      >
                        Ver más detalles
                      </button>
                    </article>
                  );
                })}
                {filteredUsers.length === 0 ? (
                  <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                    No se encontraron participantes con los filtros seleccionados.
                  </p>
                ) : null}
              </div>
              </section>
            ) : null}

            {participantDetailModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                <div className="w-full max-w-lg rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h4 className={`${outfit.className} text-[20px] font-semibold text-white`}>
                        {participantDetailModal.name}
                      </h4>
                      <p className="mt-0.5 text-xs text-[#9C9C9C]">{participantDetailModal.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setParticipantDetailModal(null)}
                      className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
                    >
                      Cerrar
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {/* Estado y verificación */}
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const s = participantStatusConfig[participantDetailModal.status ?? ""] ?? participantStatusConfig["INACTIVO"];
                        return (
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.className}`}>
                            {s.label}
                          </span>
                        );
                      })()}
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${participantDetailModal.verified ? "bg-green-900/40 text-green-400" : "bg-yellow-900/40 text-yellow-400"}`}>
                        {participantDetailModal.verified ? "Cuenta verificada" : "Sin verificar"}
                      </span>
                      {participantDetailModal.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full border border-[#2C2C2C] bg-[#1E1E1E] px-2.5 py-1 text-[11px] text-[#D7D7D7]"
                        >
                          {roleLabel[role as keyof typeof roleLabel] ?? role}
                        </span>
                      ))}
                    </div>

                    {/* Datos personales */}
                    <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9C9C9C]">Datos personales</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] text-[#9C9C9C]">CI / Documento</p>
                          <p className="text-sm text-white">{participantDetailModal.ci ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9C9C9C]">Teléfono</p>
                          <p className="text-sm text-white">{participantDetailModal.phone ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9C9C9C]">País</p>
                          <p className="text-sm text-white">{participantDetailModal.country ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9C9C9C]">Ciudad</p>
                          <p className="text-sm text-white">{participantDetailModal.city ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9C9C9C]">Fecha de nacimiento</p>
                          <p className="text-sm text-white">
                            {participantDetailModal.birthDate
                              ? new Date(participantDetailModal.birthDate).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9C9C9C]">Miembro desde</p>
                          <p className="text-sm text-white">
                            {participantDetailModal.createdAt
                              ? new Date(participantDetailModal.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Club */}
                    <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#9C9C9C]">Club</p>
                      {participantDetailModal.club ? (
                        <p className="text-sm font-semibold text-white">{participantDetailModal.club.name}</p>
                      ) : (
                        <p className="text-sm text-[#9C9C9C]">Sin club asignado</p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="pt-1">
                      {participantDetailModal.status === "SUSPENDIDO" ? (
                        <button
                          type="button"
                          disabled={pendingAction === `user:ban:${participantDetailModal.id}`}
                          onClick={() => handleBanParticipant(participantDetailModal.id, true)}
                          className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-[#2D2D2D] bg-[#121212] text-xs font-semibold text-[#D1D1D1] disabled:opacity-50"
                        >
                          {pendingAction === `user:ban:${participantDetailModal.id}` ? "Procesando…" : "Quitar suspensión"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={pendingAction === `user:ban:${participantDetailModal.id}`}
                          onClick={() => handleBanParticipant(participantDetailModal.id, false)}
                          className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-red-600/20 text-xs font-semibold text-red-400 hover:bg-red-600/30 disabled:opacity-50"
                        >
                          {pendingAction === `user:ban:${participantDetailModal.id}` ? "Procesando…" : "Banear participante"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {activeSection === "eventos" ? (
              <section id="eventos" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Eventos</h3>
                  <span className="text-xs text-[#9C9C9C]">Catálogo de eventos con edición y eliminación</span>
                </div>
                <button
                  type="button"
                  onClick={openCreateEventModal}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white"
                >
                  Crear evento
                </button>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-3">
                <input
                  value={eventSearch}
                  onChange={(event) => setEventSearch(event.target.value)}
                  placeholder="Buscar por nombre, lugar o descripción"
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                />
                <select
                  value={eventStatusFilter}
                  onChange={(event) => setEventStatusFilter(event.target.value as "TODOS" | CatalogEventStatus)}
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                >
                  <option value="TODOS">Todos los estados</option>
                  {eventStatusOptions.map((status) => (
                    <option key={`filter-${status}`} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <p className="flex h-10 items-center rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 text-xs text-[#9C9C9C]">
                  {filteredEvents.length} evento(s) visibles
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {filteredEvents.map((item) => {
                  const isDeleting = pendingAction === `event:delete:${item.id}`;
                  return (
                    <article
                      key={item.id}
                      className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4 md:flex md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md border border-[#2D2D2D] bg-[#0B0B0B]">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={`Imagen de ${item.name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-[#7F7F7F]">Sin imagen</div>
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-white">{item.name}</p>
                            <span className="rounded-full border border-[#2D2D2D] bg-[#101010] px-2 py-0.5 text-[11px] text-[#B8B8B8]">
                              {item.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#9C9C9C]">{item.place || "Sin lugar definido"}</p>
                          <p className="mt-1 text-xs text-[#9C9C9C]">
                            {formatDate(item.startDate)} · {formatDate(item.endDate)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2 md:mt-0">
                        <button
                          type="button"
                          disabled={loading || isDeleting}
                          onClick={() => openEditEventModal(item)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={loading || isDeleting}
                          onClick={() => void openEventDeleteImpactModal(item.id, item.name)}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4B1F2A] px-3 text-xs font-semibold text-white"
                        >
                          {isDeleting ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </article>
                  );
                })}
                {filteredEvents.length === 0 ? (
                  <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                    No se encontraron eventos con los filtros seleccionados.
                  </p>
                ) : null}
              </div>
              </section>
            ) : null}
            {activeSection === "jueces" ? (
              <section id="jueces" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
              {/* Header */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Jueces</h3>
                  <span className="text-xs text-[#9C9C9C]">{judgeUsers.length} juez/jueces registrado(s)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActionFeedback(null);
                    clearError();
                    setAddJudgeModalOpen(true);
                    setAddJudgeSearch("");
                    setAddJudgeSelectedUserId("");
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white"
                >
                  + Agregar juez
                </button>
              </div>

              {/* Judge list */}
              <div className="mb-6">
                <input
                  value={judgeSearch}
                  onChange={(e) => setJudgeSearch(e.target.value)}
                  placeholder="Buscar juez por nombre o correo"
                  className="mb-3 h-10 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none md:w-1/2"
                />
                <div className="space-y-2">
                  {filteredJudgeUsers.map((judge) => {
                    const isDemoting = pendingAction === `user:judge:${judge.id}`;
                    const count = judgeAssignmentCount.get(judge.id) ?? 0;
                    return (
                      <article
                        key={judge.id}
                        className="flex flex-col gap-3 rounded-xl bg-[#1A1A1A] p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{judge.name}</p>
                          <p className="text-xs text-[#8D8D8D]">{judge.email}</p>
                          <p className="mt-1 text-xs text-[#9C9C9C]">{count} alcance(s) asignado(s)</p>
                        </div>
                        <button
                          type="button"
                          disabled={loading || isDemoting}
                          onClick={() => void handleToggleJudgeRole(judge.id, true)}
                          className="inline-flex h-9 w-[130px] items-center justify-center rounded-[18px] bg-[#4B1F2A] text-xs font-semibold text-white"
                        >
                          {isDemoting ? "Guardando..." : "Quitar rol juez"}
                        </button>
                      </article>
                    );
                  })}
                  {filteredJudgeUsers.length === 0 ? (
                    <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                      {judgeSearch ? "No se encontraron jueces con esa búsqueda." : "No hay jueces registrados aún."}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Add judge modal */}
              {addJudgeModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                  <div className="w-full max-w-md rounded-2xl border border-[#2D2D2D] bg-[#111111] p-6">
                    <h3 className={`${outfit.className} mb-4 text-[18px] font-semibold text-white`}>
                      Agregar juez
                    </h3>
                    <input
                      value={addJudgeSearch}
                      onChange={(e) => setAddJudgeSearch(e.target.value)}
                      placeholder="Buscar usuario por nombre o correo"
                      className="mb-3 h-10 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                    />
                    <div className="max-h-60 space-y-2 overflow-y-auto">
                      {filteredNonJudgeUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setAddJudgeSelectedUserId(u.id)}
                          className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                            addJudgeSelectedUserId === u.id
                              ? "border border-[#5B68F1] bg-[rgba(91,104,241,0.15)]"
                              : "border border-[#2D2D2D] bg-[#1A1A1A]"
                          }`}
                        >
                          <p className="text-sm font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-[#8D8D8D]">{u.email}</p>
                        </button>
                      ))}
                      {filteredNonJudgeUsers.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-[#9C9C9C]">
                          {addJudgeSearch ? "No se encontraron usuarios." : "Todos los usuarios ya son jueces."}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={!addJudgeSelectedUserId || !!pendingAction}
                        onClick={() => void handleAddJudge()}
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#5B68F1] text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {pendingAction?.startsWith("judge:promote:") ? "Guardando..." : "Confirmar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddJudgeModalOpen(false);
                          setAddJudgeSearch("");
                          setAddJudgeSelectedUserId("");
                        }}
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-[#2D2D2D] text-xs font-semibold text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              </section>
            ) : null}

            {activeSection === "clubes" ? (
              <section id="clubes" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Clubes</h3>
                  <span className="text-xs text-[#9C9C9C]">Gestión de clubes organizadores</span>
                </div>
                <button
                  type="button"
                  onClick={openCreateClubModal}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white"
                >
                  Crear club
                </button>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-2">
                <input
                  value={clubSearch}
                  onChange={(event) => setClubSearch(event.target.value)}
                  placeholder="Buscar por nombre, lugar o correo"
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                />
                <p className="flex h-10 items-center rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 text-xs text-[#9C9C9C]">
                  {filteredClubs.length} club(es) visibles
                </p>
              </div>

              <div className="space-y-3">
                {filteredClubs.map((club) => {
                  const isDeleting = pendingAction === `club:delete:${club.id}`;
                  return (
                    <article
                      key={club.id}
                      className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4 md:flex md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        {club.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={club.logoUrl}
                            alt={`Logo ${club.name}`}
                            className="h-12 w-12 rounded-lg border border-[#2D2D2D] bg-[#101010] object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-[#2D2D2D] bg-[#101010] text-sm font-semibold text-[#7A7A7A]">
                            {(club.name.trim().charAt(0) || "C").toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{club.name}</p>
                          <p className="mt-1 text-xs text-[#8D8D8D]">{club.place}</p>
                          <p className="mt-1 text-xs text-[#8D8D8D]">{club.contactEmail}</p>
                          <p className="mt-3 text-[13px] text-[#CFCFCF]">{club.members} miembros activos</p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2 md:mt-0">
                        <button
                          type="button"
                          disabled={loading || isDeleting}
                          onClick={() => openEditClubModal(club)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={loading || isDeleting}
                          onClick={() => void openClubDeleteImpactModal(club.id, club.name)}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4B1F2A] px-3 text-xs font-semibold text-white"
                        >
                          {isDeleting ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </article>
                  );
                })}

                {filteredClubs.length === 0 ? (
                  <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                    Aun no hay clubes registrados en la base de datos.
                  </p>
                ) : null}
              </div>
              </section>
            ) : null}

            {activeSection === "categorias" ? (
              <section id="categorias" className="grid w-full grid-cols-1 gap-5">
                <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Categorías</h3>
                    <button
                      type="button"
                      onClick={openCreateCategoryModal}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white"
                    >
                      Crear categoría
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {categoryItems.map((item) => {
                      const isDeleting = pendingAction === `category:delete:${item.id}`;
                      const isExpanded = expandedCategoryId === item.id;
                      const subcategories = subcategoriesByCategoryId.get(item.id) ?? [];

                      return (
                        <article key={item.id} className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
                          <div className="md:flex md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-white">{item.name}</p>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedCategoryId((prev) => (prev === item.id ? null : item.id))
                                }
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                              >
                                {isExpanded ? "Ocultar subcategorías" : `Ver subcategorías (${subcategories.length})`}
                              </button>
                              <button
                                type="button"
                                disabled={loading || isDeleting}
                                onClick={() => openEditCategoryModal(item)}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                disabled={loading || isDeleting}
                                onClick={() => void openCategoryDeleteImpactModal(item.id, item.name)}
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4B1F2A] px-3 text-xs font-semibold text-white"
                              >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                              </button>
                            </div>
                          </div>

                          {isExpanded ? (
                            <div className="mt-3 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-[#A8A8A8]">Subcategorías</p>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => openCreateSubcategoryModal(item.id)}
                                  className="inline-flex h-7 items-center justify-center rounded-lg bg-[#5B68F1] px-3 text-[11px] font-semibold text-white"
                                >
                                  + Agregar
                                </button>
                              </div>
                              {subcategories.length > 0 ? (
                                <ul className="mt-2 space-y-2">
                                  {subcategories.map((subcategory) => {
                                    const isDeletingSub = pendingAction === `subcategory:delete:${subcategory.id}`;
                                    return (
                                      <li
                                        key={subcategory.id}
                                        className="flex items-center justify-between gap-2 rounded-md border border-[#2D2D2D] bg-[#121212] px-3 py-2"
                                      >
                                        <span className="text-sm text-white">{subcategory.name}</span>
                                        <div className="flex shrink-0 gap-1">
                                          <button
                                            type="button"
                                            disabled={loading || isDeletingSub}
                                            onClick={() => openEditSubcategoryModal(subcategory)}
                                            className="inline-flex h-7 items-center justify-center rounded-md border border-[#2D2D2D] px-2 text-[11px] font-semibold text-white"
                                          >
                                            Editar
                                          </button>
                                          <button
                                            type="button"
                                            disabled={loading || isDeletingSub}
                                            onClick={() => openSubcategoryDeleteModal(subcategory.id, subcategory.name, item.id)}
                                            className="inline-flex h-7 items-center justify-center rounded-md bg-[#4B1F2A] px-2 text-[11px] font-semibold text-white"
                                          >
                                            {isDeletingSub ? "..." : "Eliminar"}
                                          </button>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p className="mt-2 text-sm text-[#9C9C9C]">
                                  Esta categoría no tiene subcategorías. Agrega una con el botón de arriba.
                                </p>
                              )}
                            </div>
                          ) : null}
                        </article>
                      );
                    })}

                    {categoryItems.length === 0 ? (
                      <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                        No hay categorías registradas.
                      </p>
                    ) : null}
                  </div>
                </article>
              </section>
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

            {eventModalMode ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                <div className="w-full max-w-2xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h4 className={`${outfit.className} text-[20px] font-semibold text-white`}>
                        {eventModalMode === "create" ? "Crear evento" : "Editar evento"}
                      </h4>
                      <p className="mt-0.5 text-xs text-[#9C9C9C]">Paso {eventModalStep} de 2</p>
                    </div>
                    <button
                      type="button"
                      onClick={closeEventModal}
                      disabled={isEventModalPending}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
                    >
                      Cerrar
                    </button>
                  </div>

                  {eventModalStep === 1 ? (
                  <form onSubmit={(event) => void handleSubmitEventModal(event)} className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                      Nombre
                      <input
                        value={eventForm.name}
                        onChange={(event) => setEventForm((prev) => ({ ...prev, name: event.target.value }))}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                      Lugar
                      <input
                        value={eventForm.place}
                        onChange={(event) => setEventForm((prev) => ({ ...prev, place: event.target.value }))}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                      Fecha inicio
                      <input
                        type="date"
                        value={eventForm.startDate}
                        onChange={(event) => setEventForm((prev) => ({ ...prev, startDate: event.target.value }))}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                      Fecha fin
                      <input
                        type="date"
                        value={eventForm.endDate}
                        onChange={(event) => setEventForm((prev) => ({ ...prev, endDate: event.target.value }))}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8] md:col-span-2">
                      Estado
                      <select
                        value={eventForm.status}
                        onChange={(event) =>
                          setEventForm((prev) => ({
                            ...prev,
                            status: event.target.value as CatalogEventStatus,
                          }))
                        }
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      >
                        {eventStatusOptions.map((status) => (
                          <option key={`modal-${status}`} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="md:col-span-2">
                      <p className="text-xs text-[#A8A8A8]">Imagen del evento (opcional)</p>
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-[#2D2D2D] bg-[#101010] p-3">
                        <div className="h-16 w-24 overflow-hidden rounded-md border border-[#2D2D2D] bg-[#0B0B0B]">
                          {eventForm.imageUrl ? (
                            <img
                              src={eventForm.imageUrl}
                              alt="Imagen del evento"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-[#7F7F7F]">Sin imagen</div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => eventImageFileInputRef.current?.click()}
                            disabled={isEventImageUploading || isEventModalPending}
                            className="inline-flex h-9 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                          >
                            {isEventImageUploading ? "Subiendo..." : "Seleccionar imagen"}
                          </button>
                          {eventForm.imageUrl ? (
                            <button
                              type="button"
                              onClick={() => setEventForm((prev) => ({ ...prev, imageUrl: "" }))}
                              disabled={isEventImageUploading || isEventModalPending}
                              className="inline-flex h-9 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#B8B8B8]"
                            >
                              Quitar imagen
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <input
                        ref={eventImageFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => void handleEventImageFileChange(e)}
                        className="hidden"
                      />
                    </div>

                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8] md:col-span-2">
                      Descripción
                      <textarea
                        value={eventForm.description}
                        onChange={(event) => setEventForm((prev) => ({ ...prev, description: event.target.value }))}
                        className="min-h-[96px] rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>

                    {eventModalError ? (
                      <p className="rounded-lg border border-[#7f1d1d] bg-[#7f1d1d]/20 px-3 py-2 text-xs text-[#fca5a5] md:col-span-2">
                        {eventModalError}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isEventModalPending}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white md:col-span-2"
                    >
                      {isEventModalPending ? "Guardando..." : "Siguiente →"}
                    </button>
                  </form>
                  ) : null}

                  {eventModalStep === 2 ? (
                    <div>
                      <p className="mb-4 text-sm text-[#AAAAAA]">
                        Selecciona las categorías disponibles en este evento. Las subcategorías se incluyen automáticamente.
                      </p>
                      {categoryItems.length === 0 ? (
                        <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                          No hay categorías creadas aún. Puedes vincularlas después en la sección Categorías.
                        </p>
                      ) : (
                        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                          {categoryItems.map((cat) => {
                            const isSelected = eventModalSelectedCategoryIds.has(cat.id);
                            const subs = subcategoriesByCategoryId.get(cat.id) ?? [];
                            return (
                              <label
                                key={cat.id}
                                className={`block cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                                  isSelected
                                    ? "border-[#5B68F1] bg-[rgba(91,104,241,0.12)]"
                                    : "border-[#2D2D2D] bg-[#121212]"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      setEventModalSelectedCategoryIds((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(cat.id)) next.delete(cat.id);
                                        else next.add(cat.id);
                                        return next;
                                      })
                                    }
                                    className="h-4 w-4 accent-[#5B68F1]"
                                  />
                                  <span className="text-sm font-semibold text-white">{cat.name}</span>
                                  {subs.length > 0 ? (
                                    <span className="text-xs text-[#9C9C9C]">{subs.length} subcategoría(s)</span>
                                  ) : null}
                                </div>
                                {isSelected && subs.length > 0 ? (
                                  <div className="mt-2 flex flex-wrap gap-1.5 pl-7">
                                    {subs.map((sub) => (
                                      <span
                                        key={sub.id}
                                        className="rounded-full border border-[#5B68F1]/40 bg-[rgba(91,104,241,0.15)] px-2 py-0.5 text-[11px] text-[#A8AFFF]"
                                      >
                                        {sub.name}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                              </label>
                            );
                          })}
                        </div>
                      )}
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          disabled={isEventModalPending}
                          onClick={() => setEventModalStep(1)}
                          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-[#2D2D2D] text-sm font-semibold text-white"
                        >
                          ← Atrás
                        </button>
                        <button
                          type="button"
                          disabled={isEventModalPending}
                          onClick={() =>
                            eventModalMode === "create"
                              ? void handleConfirmCreateEvent()
                              : void handleConfirmUpdateEvent()
                          }
                          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#5B68F1] text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {isEventModalPending
                            ? eventModalMode === "create"
                              ? "Creando..."
                              : "Guardando..."
                            : eventModalMode === "create"
                              ? "Crear evento"
                              : "Guardar cambios"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {eventDeleteImpactModal ? (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
                <div className="w-full max-w-xl rounded-2xl border border-[#4B1F2A] bg-[#161616] p-5 sm:p-6">
                  <div className="mb-3">
                    <p className="text-xs font-semibold tracking-[1.4px] text-[#FCA5A5]">CONFIRMACIÓN DE BORRADO</p>
                    <h4 className={`${outfit.className} mt-1 text-[20px] font-semibold text-white`}>
                      Eliminar evento
                    </h4>
                    <p className="mt-1 text-sm text-[#BFBFBF]">{eventDeleteImpactModal.eventName}</p>
                  </div>

                  {eventDeleteImpactModal.loading ? (
                    <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                      Calculando impacto...
                    </p>
                  ) : null}

                  {eventDeleteImpactModal.error ? (
                    <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
                      {eventDeleteImpactModal.error}
                    </p>
                  ) : null}

                  {eventDeleteImpactModal.impact ? (
                    <div className="space-y-3">
                      <p className="text-sm text-[#D5D5D5]">
                        Si continúas, también se eliminarán los siguientes datos relacionados:
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                          <p className="text-[11px] text-[#9C9C9C]">Vínculos evento-categoría</p>
                          <p className="text-lg font-semibold text-white">
                            {eventDeleteImpactModal.impact.eventCategories}
                          </p>
                        </div>
                        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                          <p className="text-[11px] text-[#9C9C9C]">Asignaciones de jueces</p>
                          <p className="text-lg font-semibold text-white">
                            {eventDeleteImpactModal.impact.judgeAssignments}
                          </p>
                        </div>
                        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                          <p className="text-[11px] text-[#9C9C9C]">Inscripciones</p>
                          <p className="text-lg font-semibold text-white">
                            {eventDeleteImpactModal.impact.registrations}
                          </p>
                        </div>
                        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                          <p className="text-[11px] text-[#9C9C9C]">Maquetas registradas</p>
                          <p className="text-lg font-semibold text-white">{eventDeleteImpactModal.impact.models}</p>
                        </div>
                      </div>
                      {(eventDeleteImpactModal.impact.registrations > 0 ||
                        eventDeleteImpactModal.impact.models > 0) ? (
                        <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
                          Advertencia: esta acción puede eliminar inscripciones y maquetas ya cargadas.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={closeEventDeleteImpactModal}
                      disabled={pendingAction === `event:delete:${eventDeleteImpactModal.eventId}`}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => void confirmDeleteEvent()}
                      disabled={
                        eventDeleteImpactModal.loading ||
                        !!eventDeleteImpactModal.error ||
                        pendingAction === `event:delete:${eventDeleteImpactModal.eventId}`
                      }
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7f1d1d] px-4 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {pendingAction === `event:delete:${eventDeleteImpactModal.eventId}`
                        ? "Eliminando..."
                        : "Eliminar definitivamente"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {clubModalMode ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                <div className="w-full max-w-2xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4 className={`${outfit.className} text-[20px] font-semibold text-white`}>
                      {clubModalMode === "create" ? "Crear club" : "Editar club"}
                    </h4>
                    <button
                      type="button"
                      onClick={closeClubModal}
                      disabled={isClubModalPending}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
                    >
                      Cerrar
                    </button>
                  </div>

                  <form onSubmit={(event) => void handleSubmitClubModal(event)} className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                      Nombre
                      <input
                        value={clubForm.name}
                        onChange={(event) => setClubForm((prev) => ({ ...prev, name: event.target.value }))}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                      Lugar
                      <input
                        value={clubForm.place}
                        onChange={(event) => setClubForm((prev) => ({ ...prev, place: event.target.value }))}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8] md:col-span-2">
                      Correo de contacto
                      <input
                        type="email"
                        value={clubForm.contactEmail}
                        onChange={(event) =>
                          setClubForm((prev) => ({ ...prev, contactEmail: event.target.value }))
                        }
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      />
                    </label>

                    <div className="md:col-span-2">
                      <p className="text-xs text-[#A8A8A8]">Imagen del evento (opcional)</p>
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-[#2D2D2D] bg-[#101010] p-3">
                        <div className="h-16 w-24 overflow-hidden rounded-md border border-[#2D2D2D] bg-[#0B0B0B]">
                          {eventForm.imageUrl ? (
                            <img
                              src={eventForm.imageUrl}
                              alt="Imagen del evento"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-[#7F7F7F]">Sin imagen</div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => eventImageFileInputRef.current?.click()}
                            disabled={isEventImageUploading || isEventModalPending}
                            className="inline-flex h-9 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                          >
                            {isEventImageUploading ? "Subiendo..." : "Seleccionar imagen"}
                          </button>
                          {eventForm.imageUrl ? (
                            <button
                              type="button"
                              onClick={() => setEventForm((prev) => ({ ...prev, imageUrl: "" }))}
                              disabled={isEventImageUploading || isEventModalPending}
                              className="inline-flex h-9 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#B8B8B8]"
                            >
                              Quitar imagen
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <input
                        ref={eventImageFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => void handleEventImageFileChange(e)}
                        className="hidden"
                      />
                    </div>

                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8] md:col-span-2">
                      Descripción
                      <textarea
                        value={clubForm.description}
                        onChange={(event) => setClubForm((prev) => ({ ...prev, description: event.target.value }))}
                        className="min-h-[96px] rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-xs text-[#A8A8A8]">Logotipo del club</span>
                      <div className="flex items-center gap-3">
                        {clubForm.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={clubForm.logoUrl}
                            alt="Logo"
                            className="h-14 w-14 rounded-lg border border-[#2D2D2D] object-contain bg-[#101010] p-1"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-[#2D2D2D] bg-[#101010] text-[10px] text-[#555]">
                            Sin logo
                          </div>
                        )}
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            disabled={isLogoUploading || isClubModalPending}
                            onClick={() => logoFileInputRef.current?.click()}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1] disabled:opacity-50"
                          >
                            {isLogoUploading ? "Subiendo..." : "Seleccionar imagen"}
                          </button>
                          {clubForm.logoUrl ? (
                            <button
                              type="button"
                              onClick={() => setClubForm((prev) => ({ ...prev, logoUrl: "" }))}
                              className="text-left text-[11px] text-[#fca5a5] hover:underline"
                            >
                              Quitar logotipo
                            </button>
                          ) : null}
                          <p className="text-[10px] text-[#666]">JPEG, PNG, WebP · máx. 2 MB</p>
                        </div>
                      </div>
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => void handleLogoFileChange(e)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isClubModalPending}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white md:col-span-2"
                    >
                      {isClubModalPending
                        ? "Guardando..."
                        : clubModalMode === "create"
                          ? "Crear club"
                          : "Guardar cambios"}
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {clubDeleteImpactModal ? (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
                <div className="w-full max-w-xl rounded-2xl border border-[#4B1F2A] bg-[#161616] p-5 sm:p-6">
                  <div className="mb-3">
                    <p className="text-xs font-semibold tracking-[1.4px] text-[#FCA5A5]">CONFIRMACIÓN DE BORRADO</p>
                    <h4 className={`${outfit.className} mt-1 text-[20px] font-semibold text-white`}>
                      Eliminar club
                    </h4>
                    <p className="mt-1 text-sm text-[#BFBFBF]">{clubDeleteImpactModal.clubName}</p>
                  </div>

                  {clubDeleteImpactModal.loading ? (
                    <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                      Calculando impacto...
                    </p>
                  ) : null}

                  {clubDeleteImpactModal.error ? (
                    <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
                      {clubDeleteImpactModal.error}
                    </p>
                  ) : null}

                  {clubDeleteImpactModal.impact ? (
                    <div className="space-y-3">
                      <p className="text-sm text-[#D5D5D5]">
                        Si continúas, se aplicarán los siguientes cambios:
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                          <p className="text-[11px] text-[#9C9C9C]">Miembros asociados</p>
                          <p className="text-lg font-semibold text-white">{clubDeleteImpactModal.impact.members}</p>
                        </div>
                        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                          <p className="text-[11px] text-[#9C9C9C]">Eventos organizados</p>
                          <p className="text-lg font-semibold text-white">{clubDeleteImpactModal.impact.events}</p>
                        </div>
                      </div>
                      {clubDeleteImpactModal.impact.members > 0 ? (
                        <p className="rounded-xl border border-[#2A2F3A] bg-[#1A1E2B] px-4 py-3 text-sm text-[#C9D3FF]">
                          Los miembros quedarán sin club asignado.
                        </p>
                      ) : null}
                      {clubDeleteImpactModal.impact.events > 0 ? (
                        <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
                          Este club organiza eventos y no se puede eliminar hasta reasignarlos.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={closeClubDeleteImpactModal}
                      disabled={pendingAction === `club:delete:${clubDeleteImpactModal.clubId}`}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => void confirmDeleteClub()}
                      disabled={
                        clubDeleteImpactModal.loading ||
                        !!clubDeleteImpactModal.error ||
                        (clubDeleteImpactModal.impact ? clubDeleteImpactModal.impact.events > 0 : false) ||
                        pendingAction === `club:delete:${clubDeleteImpactModal.clubId}`
                      }
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7f1d1d] px-4 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {pendingAction === `club:delete:${clubDeleteImpactModal.clubId}`
                        ? "Eliminando..."
                        : "Eliminar definitivamente"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {categoryModalMode ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                <div className="w-full max-w-xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4 className={`${outfit.className} text-[20px] font-semibold text-white`}>
                      {categoryModalMode === "create" ? "Crear categoría" : "Editar categoría"}
                    </h4>
                    <button
                      type="button"
                      onClick={closeCategoryModal}
                      disabled={
                        pendingAction === "category:create" ||
                        (categoryModalTargetId
                          ? pendingAction === `category:update:${categoryModalTargetId}`
                          : false)
                      }
                      className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
                    >
                      Cerrar
                    </button>
                  </div>

                  <form onSubmit={(event) => void handleSubmitCategoryModal(event)} className="grid gap-3">
                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                      Nombre
                      <input
                        value={categoryForm.name}
                        onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={
                        pendingAction === "category:create" ||
                        (categoryModalTargetId
                          ? pendingAction === `category:update:${categoryModalTargetId}`
                          : false)
                      }
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white"
                    >
                      {pendingAction === "category:create" ||
                      (categoryModalTargetId ? pendingAction === `category:update:${categoryModalTargetId}` : false)
                        ? "Guardando..."
                        : categoryModalMode === "create"
                          ? "Crear categoría"
                          : "Guardar cambios"}
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {categoryDeleteImpactModal ? (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
                <div className="w-full max-w-xl rounded-2xl border border-[#4B1F2A] bg-[#161616] p-5 sm:p-6">
                  <div className="mb-3">
                    <p className="text-xs font-semibold tracking-[1.4px] text-[#FCA5A5]">CONFIRMACIÓN DE BORRADO</p>
                    <h4 className={`${outfit.className} mt-1 text-[20px] font-semibold text-white`}>
                      Eliminar categoría
                    </h4>
                    <p className="mt-1 text-sm text-[#BFBFBF]">{categoryDeleteImpactModal.categoryName}</p>
                  </div>

                  {categoryDeleteImpactModal.loading ? (
                    <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                      Calculando impacto...
                    </p>
                  ) : null}

                  {categoryDeleteImpactModal.error ? (
                    <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
                      {categoryDeleteImpactModal.error}
                    </p>
                  ) : null}

                  {categoryDeleteImpactModal.impact ? (
                    <div className="space-y-3">
                      <p className="text-sm text-[#D5D5D5]">
                        Si continúas, también se eliminarán los siguientes datos relacionados:
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                          <p className="text-[11px] text-[#9C9C9C]">Subcategorías hijas</p>
                          <p className="text-lg font-semibold text-white">{categoryDeleteImpactModal.impact.children}</p>
                        </div>
                        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                          <p className="text-[11px] text-[#9C9C9C]">Vínculos evento-categoría</p>
                          <p className="text-lg font-semibold text-white">
                            {categoryDeleteImpactModal.impact.eventCategories}
                          </p>
                        </div>
                        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                          <p className="text-[11px] text-[#9C9C9C]">Asignaciones de jueces</p>
                          <p className="text-lg font-semibold text-white">
                            {categoryDeleteImpactModal.impact.judgeAssignments}
                          </p>
                        </div>
                        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                          <p className="text-[11px] text-[#9C9C9C]">Inscripciones</p>
                          <p className="text-lg font-semibold text-white">
                            {categoryDeleteImpactModal.impact.registrations}
                          </p>
                        </div>
                        <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3 sm:col-span-2">
                          <p className="text-[11px] text-[#9C9C9C]">Maquetas registradas</p>
                          <p className="text-lg font-semibold text-white">{categoryDeleteImpactModal.impact.models}</p>
                        </div>
                      </div>
                      {categoryDeleteImpactModal.impact.children > 0 ? (
                        <p className="rounded-xl border border-[#78350f] bg-[#78350f]/20 px-4 py-3 text-sm text-[#fcd34d]">
                          Las {categoryDeleteImpactModal.impact.children} subcategoría(s) y sus datos asociados también serán eliminados.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-3">
                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                      Escribe{" "}
                      <span className="inline font-semibold tracking-widest text-white">CONFIRMAR</span>{" "}
                      para continuar
                      <input
                        type="text"
                        value={categoryDeleteConfirmText}
                        onChange={(e) => setCategoryDeleteConfirmText(e.target.value)}
                        placeholder="CONFIRMAR"
                        disabled={pendingAction === `category:delete:${categoryDeleteImpactModal.categoryId}`}
                        className="mt-1 h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none placeholder:text-[#555]"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={closeCategoryDeleteImpactModal}
                        disabled={pendingAction === `category:delete:${categoryDeleteImpactModal.categoryId}`}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => void confirmDeleteCategory()}
                        disabled={
                          categoryDeleteImpactModal.loading ||
                          !!categoryDeleteImpactModal.error ||
                          categoryDeleteConfirmText !== "CONFIRMAR" ||
                          pendingAction === `category:delete:${categoryDeleteImpactModal.categoryId}`
                        }
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7f1d1d] px-4 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {pendingAction === `category:delete:${categoryDeleteImpactModal.categoryId}`
                          ? "Eliminando..."
                          : "Eliminar definitivamente"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {subcategoryModalMode ? (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
                <div className="w-full max-w-md rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4 className={`${outfit.className} text-[20px] font-semibold text-white`}>
                      {subcategoryModalMode === "create" ? "Crear subcategoría" : "Editar subcategoría"}
                    </h4>
                    <button
                      type="button"
                      onClick={closeSubcategoryModal}
                      disabled={
                        pendingAction === "subcategory:create" ||
                        (subcategoryModalTargetId
                          ? pendingAction === `subcategory:update:${subcategoryModalTargetId}`
                          : false)
                      }
                      className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
                    >
                      Cerrar
                    </button>
                  </div>
                  <form onSubmit={(event) => void handleSubmitSubcategoryModal(event)} className="grid gap-3">
                    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                      Nombre
                      <input
                        value={subcategoryForm.name}
                        onChange={(event) => setSubcategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                        autoFocus
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={
                        pendingAction === "subcategory:create" ||
                        (subcategoryModalTargetId
                          ? pendingAction === `subcategory:update:${subcategoryModalTargetId}`
                          : false)
                      }
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white"
                    >
                      {pendingAction === "subcategory:create" ||
                      (subcategoryModalTargetId
                        ? pendingAction === `subcategory:update:${subcategoryModalTargetId}`
                        : false)
                        ? "Guardando..."
                        : subcategoryModalMode === "create"
                          ? "Crear subcategoría"
                          : "Guardar cambios"}
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {subcategoryDeleteModal ? (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
                <div className="w-full max-w-md rounded-2xl border border-[#4B1F2A] bg-[#161616] p-5 sm:p-6">
                  <div className="mb-3">
                    <p className="text-xs font-semibold tracking-[1.4px] text-[#FCA5A5]">CONFIRMACIÓN DE BORRADO</p>
                    <h4 className={`${outfit.className} mt-1 text-[20px] font-semibold text-white`}>
                      Eliminar subcategoría
                    </h4>
                    <p className="mt-1 text-sm text-[#BFBFBF]">{subcategoryDeleteModal.subcategoryName}</p>
                  </div>
                  <p className="text-sm text-[#D5D5D5]">
                    Esta acción eliminará la subcategoría y todos sus datos asociados permanentemente.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={closeSubcategoryDeleteModal}
                      disabled={pendingAction === `subcategory:delete:${subcategoryDeleteModal.subcategoryId}`}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => void confirmDeleteSubcategory()}
                      disabled={pendingAction === `subcategory:delete:${subcategoryDeleteModal.subcategoryId}`}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7f1d1d] px-4 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {pendingAction === `subcategory:delete:${subcategoryDeleteModal.subcategoryId}`
                        ? "Eliminando..."
                        : "Eliminar definitivamente"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <footer className="pb-6 text-xs text-[#777777]">
              {loading ? "Actualizando panel..." : "Panel Admin v1 · Datos de demostracion en memoria de sesion"}
              <span className="ml-2 inline-flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Modo demostracion sin conexion a servicios externos
              </span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}















