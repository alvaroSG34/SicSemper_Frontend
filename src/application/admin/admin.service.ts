"use client";

import type {
  ActivityLogItem,
  AdminClub,
  CategoryDeleteImpact,
  ClubDeleteImpact,
  AdminDashboardData,
  AdminDashboardSummary,
  AssignJudgeScopePayload,
  CatalogCategory,
  CatalogEvent,
  CatalogSubcategory,
  CreateClubPayload,
  CreateCategoryPayload,
  CreateEventPayload,
  CreateSubcategoryPayload,
  EventCategoryOption,
  EventDeleteImpact,
  JudgeAssignmentScope,
  JudgePermissionCode,
  JudgePermissionEntry,
  UpdateClubPayload,
  UpdateCategoryPayload,
  UpdateEventPayload,
  UpdateSubcategoryPayload,
} from "@/domain/admin/admin.types";
import type { User, UserRole } from "@/domain/user/user.types";
import { ApiError, apiRequest } from "@/infrastructure/api/http-client";

type BackendClub = {
  id: string;
  name: string;
  place: string;
  contactEmail: string;
  description: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type BackendAdminUser = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  verified: boolean;
  status: string;
  ci: string | null;
  country: string | null;
  city: string | null;
  phone: string | null;
  birthDate: string | null;
  club?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

type BackendEvent = {
  id: string;
  name: string;
  organizerClubId: string;
  place: string | null;
  startDate: string | null;
  endDate: string | null;
  status: CatalogEvent["status"];
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type BackendCategory = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

type BackendEventCategory = {
  id: string;
  eventId: string;
  categoryId: string;
  eventName: string;
  categoryName: string;
  categoryParentId: string | null;
  categoryParentName: string | null;
  createdAt: string;
  updatedAt: string;
};

type BackendJudgeAssignment = {
  id: string;
  judgeUserId: string;
  eventId: string;
  eventCategoryId: string;
  categoryId: string;
  categoryParentId: string | null;
  createdAt: string;
};

type BackendActivity = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
};

type BackendAlert = AdminDashboardData["alerts"][number];

type BackendAdminDashboard = {
  kpis: {
    activeUsers: number;
    activeEvents: number;
    openIncidents: number;
    registeredModels: number;
  };
  users: BackendAdminUser[];
  clubs: BackendClub[];
  catalog: {
    events: BackendEvent[];
    categories: BackendCategory[];
    eventCategories: BackendEventCategory[];
  };
  assignments: BackendJudgeAssignment[];
  alerts: BackendAlert[];
  activity: BackendActivity[];
};

type BackendAdminDashboardSummary = Pick<BackendAdminDashboard, "kpis" | "alerts" | "activity">;

type SyntheticCatalog = {
  events: CatalogEvent[];
  categories: CatalogCategory[];
  subcategories: CatalogSubcategory[];
  eventCategories: EventCategoryOption[];
};

const adminErrorMessages: Record<string, string> = {
  CLUB_CONTACT_EMAIL_ALREADY_IN_USE: "Ya existe un club con ese correo de contacto.",
  CLUB_HAS_EVENTS: "No puedes eliminar un club que todavía organiza eventos.",
  CATEGORY_HAS_CHILDREN: "No puedes eliminar una categoría que todavía tiene subcategorías.",
  EVENT_CATEGORY_ALREADY_EXISTS: "Esa categoria ya esta vinculada al evento.",
  JUDGE_ASSIGNMENT_ALREADY_EXISTS: "Ese alcance ya esta asignado para el juez seleccionado.",
  JUDGE_ROLE_REQUIRED: "Debes seleccionar un usuario con rol de juez.",
  USER_NOT_FOUND: "No se encontro el usuario solicitado.",
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    if (error.code && adminErrorMessages[error.code]) {
      return adminErrorMessages[error.code];
    }

    if (error.message && error.message !== `HTTP_${error.statusCode}`) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const mapEvent = (event: BackendEvent): CatalogEvent => ({
  id: event.id,
  name: event.name,
  organizerClubId: event.organizerClubId,
  status: event.status,
  place: event.place ?? "",
  startDate: event.startDate ?? "",
  endDate: event.endDate ?? "",
  description: event.description ?? "",
  imageUrl: event.imageUrl ?? "",
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
});

const mapActivity = (entry: BackendActivity): ActivityLogItem => ({
  id: entry.id,
  title: entry.title,
  detail: entry.detail,
  createdAt: entry.createdAt,
});

const mapClub = (club: BackendClub, dashboard: BackendAdminDashboard): AdminClub => ({
  id: club.id,
  name: club.name,
  place: club.place,
  contactEmail: club.contactEmail,
  description: club.description,
  logoUrl: club.logoUrl,
  members: dashboard.users.filter((user) => user.club?.id === club.id).length,
});

const mapAssignment = (assignment: BackendJudgeAssignment): JudgeAssignmentScope => ({
  id: assignment.id,
  judgeUserId: assignment.judgeUserId,
  eventId: assignment.eventId,
  eventCategoryId: assignment.eventCategoryId,
  createdAt: assignment.createdAt,
});

const mapUser = (user: BackendAdminUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roles: user.roles,
  verified: user.verified,
  status: user.status,
  ci: user.ci,
  country: user.country,
  city: user.city,
  phone: user.phone,
  birthDate: user.birthDate,
  club: user.club,
  createdAt: user.createdAt,
});

const buildCatalog = (dashboard: BackendAdminDashboard): SyntheticCatalog => {
  const categoriesById = new Map(dashboard.catalog.categories.map((entry) => [entry.id, entry]));
  const rootCategories = new Map<string, CatalogCategory>();
  const subcategories = new Map<string, CatalogSubcategory>();

  for (const entry of dashboard.catalog.eventCategories) {
    if (!entry.categoryParentId) {
      const current = rootCategories.get(entry.categoryId);

      if (!current) {
        rootCategories.set(entry.categoryId, {
          id: entry.categoryId,
          eventId: entry.eventId,
          name: entry.categoryName,
          parentId: null,
        });
      }

      continue;
    }

    const parentCategory = categoriesById.get(entry.categoryParentId);

    if (!rootCategories.has(entry.categoryParentId)) {
      rootCategories.set(entry.categoryParentId, {
        id: entry.categoryParentId,
        eventId: entry.eventId,
        name: entry.categoryParentName ?? parentCategory?.name ?? "Categoria",
        parentId: null,
      });
    }

    if (!subcategories.has(entry.categoryId)) {
      subcategories.set(entry.categoryId, {
        id: entry.categoryId,
        categoryId: entry.categoryParentId,
        name: entry.categoryName,
      });
    }
  }

  for (const category of dashboard.catalog.categories) {
    if (category.parentId !== null) {
      // Also register subcategories not covered by eventCategories
      if (!subcategories.has(category.id)) {
        subcategories.set(category.id, {
          id: category.id,
          categoryId: category.parentId,
          name: category.name,
        });
      }
      continue;
    }

    if (!rootCategories.has(category.id)) {
      rootCategories.set(category.id, {
        id: category.id,
        name: category.name,
        parentId: null,
      });
    }
  }

  const eventCategories: EventCategoryOption[] = dashboard.catalog.eventCategories.map((entry) => ({
    id: entry.id,
    eventId: entry.eventId,
    categoryId: entry.categoryId,
    name: entry.categoryParentName
      ? `${entry.categoryParentName} › ${entry.categoryName}`
      : entry.categoryName,
  }));

  return {
    events: dashboard.catalog.events.map(mapEvent),
    categories: Array.from(rootCategories.values()),
    subcategories: Array.from(subcategories.values()),
    eventCategories,
  };
};

const getDashboardSnapshot = () => apiRequest<BackendAdminDashboard>("/admin/dashboard");
const getDashboardSummarySnapshot = () =>
  apiRequest<BackendAdminDashboardSummary>("/admin/dashboard/summary");

const syncRootCategoryEventLinks = async (
  categoryId: string,
  targetEventId: string,
  snapshot?: BackendAdminDashboard,
) => {
  const dashboard = snapshot ?? (await getDashboardSnapshot());
  const currentRootLinks = dashboard.catalog.eventCategories.filter(
    (entry) => entry.categoryId === categoryId && entry.categoryParentId === null,
  );

  if (!currentRootLinks.some((entry) => entry.eventId === targetEventId)) {
    await apiRequest<BackendEventCategory>("/admin/event-categories", {
      method: "POST",
      body: {
        eventId: targetEventId,
        categoryId,
      },
    });
  }

  await Promise.all(
    currentRootLinks
      .filter((entry) => entry.eventId !== targetEventId)
      .map((entry) =>
        apiRequest<{ success: boolean }>(`/admin/event-categories/${entry.id}`, {
          method: "DELETE",
        }),
      ),
  );
};

const clearRootCategoryEventLinks = async (
  categoryId: string,
  snapshot?: BackendAdminDashboard,
) => {
  const dashboard = snapshot ?? (await getDashboardSnapshot());
  const currentRootLinks = dashboard.catalog.eventCategories.filter(
    (entry) => entry.categoryId === categoryId && entry.categoryParentId === null,
  );

  await Promise.all(
    currentRootLinks.map((entry) =>
      apiRequest<{ success: boolean }>(`/admin/event-categories/${entry.id}`, {
        method: "DELETE",
      }),
    ),
  );
};

const syncChildCategoryEventLinks = async (
  subcategoryId: string,
  parentCategoryId: string,
  snapshot?: BackendAdminDashboard,
) => {
  const dashboard = snapshot ?? (await getDashboardSnapshot());
  const currentChildLinks = dashboard.catalog.eventCategories.filter(
    (entry) => entry.categoryId === subcategoryId,
  );
  const targetParentLinks = dashboard.catalog.eventCategories.filter(
    (entry) => entry.categoryId === parentCategoryId && entry.categoryParentId === null,
  );
  const currentEventIds = new Set(currentChildLinks.map((entry) => entry.eventId));
  const targetEventIds = new Set(targetParentLinks.map((entry) => entry.eventId));

  await Promise.all(
    targetParentLinks
      .filter((entry) => !currentEventIds.has(entry.eventId))
      .map((entry) =>
        apiRequest<BackendEventCategory>("/admin/event-categories", {
          method: "POST",
          body: {
            eventId: entry.eventId,
            categoryId: subcategoryId,
          },
        }),
      ),
  );

  await Promise.all(
    currentChildLinks
      .filter((entry) => !targetEventIds.has(entry.eventId))
      .map((entry) =>
        apiRequest<{ success: boolean }>(`/admin/event-categories/${entry.id}`, {
          method: "DELETE",
        }),
      ),
  );
};

export interface AdminService {
  getDashboardSummaryData(): Promise<AdminDashboardSummary>;
  getDashboardData(): Promise<AdminDashboardData>;
  listUsers(): Promise<User[]>;
  createClub(payload: CreateClubPayload): Promise<AdminClub>;
  updateClub(payload: UpdateClubPayload): Promise<AdminClub>;
  getClubDeleteImpact(clubId: string): Promise<ClubDeleteImpact>;
  removeClub(clubId: string): Promise<void>;
  promoteToJudge(userId: string): Promise<User>;
  demoteJudge(userId: string): Promise<User>;
  banParticipant(userId: string): Promise<User>;
  unbanParticipant(userId: string): Promise<User>;
  listCatalog(): Promise<SyntheticCatalog>;
  createEvent(payload: CreateEventPayload): Promise<CatalogEvent>;
  createEventAndLinkCategories(payload: CreateEventPayload, categoryIds: string[]): Promise<CatalogEvent>;
  updateEvent(payload: UpdateEventPayload): Promise<CatalogEvent>;
  updateEventAndLinkCategories(payload: UpdateEventPayload, categoryIds: string[]): Promise<CatalogEvent>;
  getEventDeleteImpact(eventId: string): Promise<EventDeleteImpact>;
  removeEvent(eventId: string): Promise<void>;
  createCategory(payload: CreateCategoryPayload): Promise<CatalogCategory>;
  updateCategory(payload: UpdateCategoryPayload): Promise<CatalogCategory>;
  getCategoryDeleteImpact(categoryId: string): Promise<CategoryDeleteImpact>;
  removeCategory(categoryId: string): Promise<void>;
  createSubcategory(payload: CreateSubcategoryPayload): Promise<CatalogSubcategory>;
  updateSubcategory(payload: UpdateSubcategoryPayload): Promise<CatalogSubcategory>;
  removeSubcategory(subcategoryId: string): Promise<void>;
  assignJudgeScope(payload: AssignJudgeScopePayload): Promise<JudgeAssignmentScope>;
  removeJudgeScope(assignmentId: string): Promise<void>;
  listJudgePermissions(judgeUserId: string): Promise<JudgePermissionEntry[]>;
  grantJudgePermission(judgeUserId: string, permission: JudgePermissionCode): Promise<JudgePermissionEntry[]>;
  revokeJudgePermission(judgeUserId: string, permission: JudgePermissionCode): Promise<JudgePermissionEntry[]>;
}

export const adminService: AdminService = {
  async getDashboardSummaryData() {
    try {
      const summary = await getDashboardSummarySnapshot();
      return {
        kpis: {
          activeUsers: summary.kpis.activeUsers,
          activeEvents: summary.kpis.activeEvents,
          openIncidents: summary.kpis.openIncidents,
        },
        alerts: summary.alerts,
        activity: summary.activity.map(mapActivity),
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar el resumen del dashboard admin."));
    }
  },
  async getDashboardData() {
    try {
      const dashboard = await getDashboardSnapshot();
      const catalog = buildCatalog(dashboard);

      return {
        kpis: {
          activeUsers: dashboard.kpis.activeUsers,
          activeEvents: dashboard.kpis.activeEvents,
          openIncidents: dashboard.kpis.openIncidents,
        },
        users: dashboard.users.map(mapUser),
        activity: dashboard.activity.map(mapActivity),
        alerts: dashboard.alerts,
        assignments: dashboard.assignments.map(mapAssignment),
        clubs: dashboard.clubs.map((club) => mapClub(club, dashboard)),
        catalog,
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar el dashboard admin."));
    }
  },
  async listUsers() {
    try {
      const users = await apiRequest<BackendAdminUser[]>("/admin/users");
      return users.map(mapUser);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar la lista de usuarios."));
    }
  },
  async createClub(payload) {
    try {
      const club = await apiRequest<BackendClub>("/admin/clubs", {
        method: "POST",
        body: payload,
      });

      return {
        id: club.id,
        name: club.name,
        place: club.place,
        contactEmail: club.contactEmail,
        description: club.description,
        logoUrl: club.logoUrl,
        members: 0,
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo crear el club."));
    }
  },
  async updateClub(payload) {
    try {
      const club = await apiRequest<BackendClub>(`/admin/clubs/${payload.id}`, {
        method: "PATCH",
        body: {
          name: payload.name,
          place: payload.place,
          contactEmail: payload.contactEmail,
          description: payload.description,
          logoUrl: payload.logoUrl,
        },
      });

      return {
        id: club.id,
        name: club.name,
        place: club.place,
        contactEmail: club.contactEmail,
        description: club.description,
        logoUrl: club.logoUrl,
        members: 0,
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo actualizar el club."));
    }
  },
  async getClubDeleteImpact(clubId) {
    try {
      return await apiRequest<ClubDeleteImpact>(`/admin/clubs/${clubId}/delete-impact`);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo calcular el impacto de eliminacion del club."));
    }
  },
  async removeClub(clubId) {
    try {
      await apiRequest<{ success: boolean }>(`/admin/clubs/${clubId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo eliminar el club."));
    }
  },
  async promoteToJudge(userId) {
    try {
      return await apiRequest<User>(`/admin/users/${userId}/promote-judge`, {
        method: "PATCH",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo promover al usuario a juez."));
    }
  },
  async demoteJudge(userId) {
    try {
      return await apiRequest<User>(`/admin/users/${userId}/demote-judge`, {
        method: "PATCH",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo quitar el rol de juez."));
    }
  },
  async banParticipant(userId) {
    try {
      return await apiRequest<User>(`/admin/users/${userId}/ban`, {
        method: "PATCH",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo banear al participante."));
    }
  },
  async unbanParticipant(userId) {
    try {
      return await apiRequest<User>(`/admin/users/${userId}/unban`, {
        method: "PATCH",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo quitar la suspensión."));
    }
  },
  async listCatalog() {
    try {
      const dashboard = await getDashboardSnapshot();
      return buildCatalog(dashboard);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar el catalogo admin."));
    }
  },
  async createEvent(payload) {
    try {
      const event = await apiRequest<BackendEvent>("/admin/events", {
        method: "POST",
        body: payload,
      });

      return mapEvent(event);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo crear el evento."));
    }
  },
  async createEventAndLinkCategories(payload, categoryIds) {
    try {
      const event = await apiRequest<BackendEvent>("/admin/events", {
        method: "POST",
        body: payload,
      });

      if (categoryIds.length > 0) {
        await Promise.all(
          categoryIds.map((categoryId) =>
            apiRequest("/admin/event-categories", {
              method: "POST",
              body: { eventId: event.id, categoryId },
            }),
          ),
        );
      }

      return mapEvent(event);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo crear el evento."));
    }
  },
  async updateEvent(payload) {
    try {
      const event = await apiRequest<BackendEvent>(`/admin/events/${payload.id}`, {
        method: "PATCH",
        body: {
          organizerClubId: payload.organizerClubId,
          name: payload.name,
          status: payload.status,
          place: payload.place,
          startDate: payload.startDate,
          endDate: payload.endDate,
          description: payload.description,
          imageUrl: payload.imageUrl,
        },
      });

      return mapEvent(event);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo actualizar el evento."));
    }
  },
  async updateEventAndLinkCategories(payload, categoryIds) {
    try {
      const dashboard = await getDashboardSnapshot();
      const event = await apiRequest<BackendEvent>(`/admin/events/${payload.id}`, {
        method: "PATCH",
        body: {
          organizerClubId: payload.organizerClubId,
          name: payload.name,
          status: payload.status,
          place: payload.place,
          startDate: payload.startDate,
          endDate: payload.endDate,
          description: payload.description,
          imageUrl: payload.imageUrl,
        },
      });

      const currentLinks = dashboard.catalog.eventCategories.filter(
        (entry) => entry.eventId === payload.id,
      );
      const currentCategoryIds = new Set(currentLinks.map((entry) => entry.categoryId));
      const desiredCategoryIds = new Set(categoryIds);

      await Promise.all(
        categoryIds
          .filter((catId) => !currentCategoryIds.has(catId))
          .map((catId) =>
            apiRequest<BackendEventCategory>("/admin/event-categories", {
              method: "POST",
              body: { eventId: payload.id, categoryId: catId },
            }),
          ),
      );

      await Promise.all(
        currentLinks
          .filter((entry) => !desiredCategoryIds.has(entry.categoryId))
          .map((entry) =>
            apiRequest<{ success: boolean }>(`/admin/event-categories/${entry.id}`, {
              method: "DELETE",
            }),
          ),
      );

      return mapEvent(event);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo actualizar el evento."));
    }
  },
  async getEventDeleteImpact(eventId) {
    try {
      return await apiRequest<EventDeleteImpact>(`/admin/events/${eventId}/delete-impact`);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo calcular el impacto de eliminacion del evento."));
    }
  },
  async removeEvent(eventId) {
    try {
      await apiRequest<{ success: boolean }>(`/admin/events/${eventId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo eliminar el evento."));
    }
  },
  async createCategory(payload) {
    try {
      const category = await apiRequest<BackendCategory>("/admin/categories", {
        method: "POST",
        body: {
          name: payload.name,
        },
      });

      if (payload.eventId) {
        await apiRequest<BackendEventCategory>("/admin/event-categories", {
          method: "POST",
          body: {
            eventId: payload.eventId,
            categoryId: category.id,
          },
        });
      }

      return {
        id: category.id,
        eventId: payload.eventId ?? null,
        name: category.name,
        parentId: category.parentId,
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo crear la categoria."));
    }
  },
  async updateCategory(payload) {
    try {
      const [category, snapshot] = await Promise.all([
        apiRequest<BackendCategory>(`/admin/categories/${payload.id}`, {
          method: "PATCH",
          body: {
            name: payload.name,
          },
        }),
        getDashboardSnapshot(),
      ]);

      if (payload.eventId) {
        await syncRootCategoryEventLinks(payload.id, payload.eventId, snapshot);
      } else {
        await clearRootCategoryEventLinks(payload.id, snapshot);
      }

      return {
        id: category.id,
        eventId: payload.eventId ?? null,
        name: category.name,
        parentId: category.parentId,
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo actualizar la categoria."));
    }
  },
  async getCategoryDeleteImpact(categoryId) {
    try {
      return await apiRequest<CategoryDeleteImpact>(`/admin/categories/${categoryId}/delete-impact`);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo calcular el impacto de eliminacion de la categoria."));
    }
  },
  async removeCategory(categoryId) {
    try {
      await apiRequest<{ success: boolean }>(`/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo eliminar la categoria."));
    }
  },
  async createSubcategory(payload) {
    try {
      const [category, snapshot] = await Promise.all([
        apiRequest<BackendCategory>("/admin/categories", {
          method: "POST",
          body: {
            name: payload.name,
            parentId: payload.categoryId,
          },
        }),
        getDashboardSnapshot(),
      ]);

      await syncChildCategoryEventLinks(category.id, payload.categoryId, snapshot);

      return {
        id: category.id,
        categoryId: payload.categoryId,
        name: category.name,
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo crear la subcategoria."));
    }
  },
  async updateSubcategory(payload) {
    try {
      const [category, snapshot] = await Promise.all([
        apiRequest<BackendCategory>(`/admin/categories/${payload.id}`, {
          method: "PATCH",
          body: {
            name: payload.name,
            parentId: payload.categoryId,
          },
        }),
        getDashboardSnapshot(),
      ]);

      await syncChildCategoryEventLinks(payload.id, payload.categoryId, snapshot);

      return {
        id: category.id,
        categoryId: payload.categoryId,
        name: category.name,
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo actualizar la subcategoria."));
    }
  },
  async removeSubcategory(subcategoryId) {
    try {
      await apiRequest<{ success: boolean }>(`/admin/categories/${subcategoryId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo eliminar la subcategoria."));
    }
  },
  async assignJudgeScope(payload) {
    try {
      const assignment = await apiRequest<BackendJudgeAssignment>("/admin/judge-assignments", {
        method: "POST",
        body: {
          judgeUserId: payload.judgeUserId,
          eventId: payload.eventId,
          eventCategoryId: payload.eventCategoryId,
        },
      });

      return mapAssignment(assignment);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo asignar el alcance del juez."));
    }
  },
  async removeJudgeScope(assignmentId) {
    try {
      await apiRequest<{ success: boolean }>(`/admin/judge-assignments/${assignmentId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo remover la asignación del juez."));
    }
  },
  async listJudgePermissions(judgeUserId) {
    try {
      return await apiRequest<JudgePermissionEntry[]>(`/admin/judges/${judgeUserId}/permissions`);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudieron cargar los permisos del juez."));
    }
  },
  async grantJudgePermission(judgeUserId, permission) {
    try {
      return await apiRequest<JudgePermissionEntry[]>(`/admin/judges/${judgeUserId}/permissions`, {
        method: "POST",
        body: JSON.stringify({ permission }),
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo otorgar el permiso."));
    }
  },
  async revokeJudgePermission(judgeUserId, permission) {
    try {
      return await apiRequest<JudgePermissionEntry[]>(`/admin/judges/${judgeUserId}/permissions`, {
        method: "DELETE",
        body: JSON.stringify({ permission }),
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo revocar el permiso."));
    }
  },
};



