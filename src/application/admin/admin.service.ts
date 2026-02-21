import type {
  AdminDashboardData,
  AssignJudgeScopePayload,
  CatalogCategory,
  CatalogEvent,
  CatalogSubcategory,
  CreateCategoryPayload,
  CreateEventPayload,
  CreateSubcategoryPayload,
  JudgeAssignmentScope,
  UpdateCategoryPayload,
  UpdateEventPayload,
  UpdateSubcategoryPayload,
} from "@/domain/admin/admin.types";
import type { User } from "@/domain/user/user.types";
import {
  createActivityId,
  createAssignmentId,
  createCategoryId,
  createCatalogEventId,
  createSubcategoryId,
  getClonedActivityLog,
  getClonedAdminCatalog,
  getClonedJudgeAssignments,
  getClonedSystemAlerts,
  mockActivityLog,
  mockCatalogCategories,
  mockCatalogEvents,
  mockCatalogSubcategories,
  mockJudgeAssignments,
} from "@/infrastructure/mock/mock-admin";
import { mockUsers } from "@/infrastructure/mock/mock-users";

const cloneUser = (user: User): User => ({
  ...user,
  roles: [...user.roles],
});

const ensureNonEmpty = (value: string, label: string) => {
  if (!value.trim()) {
    throw new Error(`El campo ${label} es obligatorio.`);
  }
};

const ensureDateString = (value: string, label: string) => {
  if (!value.trim()) {
    throw new Error(`El campo ${label} es obligatorio.`);
  }

  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`El campo ${label} debe tener una fecha valida.`);
  }
};

const appendActivity = (title: string, detail: string) => {
  mockActivityLog.unshift({
    id: createActivityId(),
    title,
    detail,
    createdAt: new Date().toISOString(),
  });
};

const findEvent = (eventId: string) => mockCatalogEvents.find((event) => event.id === eventId);
const findCategory = (categoryId: string) =>
  mockCatalogCategories.find((category) => category.id === categoryId);
const findSubcategory = (subcategoryId: string) =>
  mockCatalogSubcategories.find((subcategory) => subcategory.id === subcategoryId);

export interface AdminService {
  getDashboardData(): Promise<AdminDashboardData>;
  listUsers(): Promise<User[]>;
  promoteToJudge(userId: string): Promise<User>;
  demoteJudge(userId: string): Promise<User>;
  listCatalog(): Promise<{
    events: CatalogEvent[];
    categories: CatalogCategory[];
    subcategories: CatalogSubcategory[];
  }>;
  createEvent(payload: CreateEventPayload): Promise<CatalogEvent>;
  updateEvent(payload: UpdateEventPayload): Promise<CatalogEvent>;
  createCategory(payload: CreateCategoryPayload): Promise<CatalogCategory>;
  updateCategory(payload: UpdateCategoryPayload): Promise<CatalogCategory>;
  createSubcategory(payload: CreateSubcategoryPayload): Promise<CatalogSubcategory>;
  updateSubcategory(payload: UpdateSubcategoryPayload): Promise<CatalogSubcategory>;
  assignJudgeScope(payload: AssignJudgeScopePayload): Promise<JudgeAssignmentScope>;
  removeJudgeScope(assignmentId: string): Promise<void>;
}

export const adminService: AdminService = {
  async getDashboardData() {
    const catalog = getClonedAdminCatalog();
    const alerts = getClonedSystemAlerts();

    return {
      kpis: {
        activeUsers: mockUsers.filter((user) => user.verified).length,
        activeEvents: catalog.events.filter((event) => event.status === "ACTIVO").length,
        openIncidents: alerts.filter((alert) => alert.status !== "RESUELTA").length,
      },
      activity: getClonedActivityLog(),
      alerts,
      assignments: getClonedJudgeAssignments(),
      catalog,
    };
  },
  async listUsers() {
    return mockUsers.map(cloneUser);
  },
  async promoteToJudge(userId) {
    const user = mockUsers.find((candidate) => candidate.id === userId);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    if (!user.roles.includes("JUEZ")) {
      user.roles = [...user.roles, "JUEZ"];
      appendActivity(
        "Rol actualizado",
        `${user.name} ahora puede actuar como juez en las evaluaciones.`,
      );
    }

    return cloneUser(user);
  },
  async demoteJudge(userId) {
    const user = mockUsers.find((candidate) => candidate.id === userId);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    if (!user.roles.includes("JUEZ")) {
      return cloneUser(user);
    }

    const nextRoles = user.roles.filter((role) => role !== "JUEZ");
    user.roles = nextRoles.length > 0 ? nextRoles : ["PARTICIPANTE"];

    for (let index = mockJudgeAssignments.length - 1; index >= 0; index -= 1) {
      if (mockJudgeAssignments[index].judgeUserId === user.id) {
        mockJudgeAssignments.splice(index, 1);
      }
    }

    appendActivity(
      "Rol actualizado",
      `Se removió rol JUEZ a ${user.name} y se limpiaron sus asignaciones.`,
    );

    return cloneUser(user);
  },
  async listCatalog() {
    return getClonedAdminCatalog();
  },
  async createEvent(payload) {
    ensureNonEmpty(payload.name, "nombre del evento");
    ensureNonEmpty(payload.place, "lugar del evento");
    ensureDateString(payload.startDate, "fecha de inicio");
    ensureDateString(payload.endDate, "fecha de fin");
    ensureNonEmpty(payload.description, "descripcion del evento");

    const now = new Date().toISOString();

    const event: CatalogEvent = {
      id: createCatalogEventId(),
      name: payload.name.trim(),
      place: payload.place.trim(),
      startDate: payload.startDate,
      endDate: payload.endDate,
      description: payload.description.trim(),
      status: payload.status ?? "BORRADOR",
      createdAt: now,
      updatedAt: now,
    };

    mockCatalogEvents.unshift(event);
    appendActivity("Evento creado", `Se registró el evento ${event.name}.`);
    return { ...event };
  },
  async updateEvent(payload) {
    ensureNonEmpty(payload.name, "nombre del evento");
    ensureNonEmpty(payload.place, "lugar del evento");
    ensureDateString(payload.startDate, "fecha de inicio");
    ensureDateString(payload.endDate, "fecha de fin");
    ensureNonEmpty(payload.description, "descripcion del evento");

    const event = findEvent(payload.id);
    if (!event) {
      throw new Error("Evento no encontrado.");
    }

    event.name = payload.name.trim();
    event.place = payload.place.trim();
    event.startDate = payload.startDate;
    event.endDate = payload.endDate;
    event.description = payload.description.trim();
    event.status = payload.status;
    event.updatedAt = new Date().toISOString();

    appendActivity("Evento actualizado", `Se actualizó ${event.name} (${event.status}).`);
    return { ...event };
  },
  async createCategory(payload) {
    ensureNonEmpty(payload.name, "nombre de categoría");
    const event = findEvent(payload.eventId);
    if (!event) {
      throw new Error("No existe el evento seleccionado.");
    }

    const category: CatalogCategory = {
      id: createCategoryId(),
      eventId: payload.eventId,
      name: payload.name.trim(),
      parentId: null,
    };

    mockCatalogCategories.unshift(category);
    appendActivity("Categoría creada", `Nueva categoría ${category.name} en ${event.name}.`);
    return { ...category };
  },
  async updateCategory(payload) {
    ensureNonEmpty(payload.name, "nombre de categoría");
    const category = findCategory(payload.id);
    if (!category) {
      throw new Error("Categoría no encontrada.");
    }

    const event = findEvent(payload.eventId);
    if (!event) {
      throw new Error("No existe el evento seleccionado.");
    }

    category.eventId = payload.eventId;
    category.name = payload.name.trim();

    appendActivity("Categoría actualizada", `Se actualizó ${category.name}.`);
    return { ...category };
  },
  async createSubcategory(payload) {
    ensureNonEmpty(payload.name, "nombre de subcategoría");
    const category = findCategory(payload.categoryId);
    if (!category) {
      throw new Error("No existe la categoría seleccionada.");
    }

    const subcategory: CatalogSubcategory = {
      id: createSubcategoryId(),
      categoryId: payload.categoryId,
      name: payload.name.trim(),
    };

    mockCatalogSubcategories.unshift(subcategory);
    appendActivity("Subcategoría creada", `Nueva subcategoría ${subcategory.name}.`);
    return { ...subcategory };
  },
  async updateSubcategory(payload) {
    ensureNonEmpty(payload.name, "nombre de subcategoría");

    const subcategory = findSubcategory(payload.id);
    if (!subcategory) {
      throw new Error("Subcategoría no encontrada.");
    }

    const category = findCategory(payload.categoryId);
    if (!category) {
      throw new Error("No existe la categoría seleccionada.");
    }

    subcategory.categoryId = payload.categoryId;
    subcategory.name = payload.name.trim();

    appendActivity("Subcategoría actualizada", `Se actualizó ${subcategory.name}.`);
    return { ...subcategory };
  },
  async assignJudgeScope(payload) {
    const judge = mockUsers.find((user) => user.id === payload.judgeUserId);
    if (!judge || !judge.roles.includes("JUEZ")) {
      throw new Error("Debes seleccionar un usuario con rol JUEZ.");
    }

    const event = findEvent(payload.eventId);
    const category = findCategory(payload.categoryId);
    const subcategory = findSubcategory(payload.subcategoryId);

    if (!event || !category || !subcategory) {
      throw new Error("La combinación seleccionada no es válida.");
    }

    if (category.eventId !== event.id) {
      throw new Error("La categoría no pertenece al evento seleccionado.");
    }

    if (subcategory.categoryId !== category.id) {
      throw new Error("La subcategoría no pertenece a la categoría seleccionada.");
    }

    const duplicate = mockJudgeAssignments.some(
      (assignment) =>
        assignment.judgeUserId === payload.judgeUserId &&
        assignment.eventId === payload.eventId &&
        assignment.categoryId === payload.categoryId &&
        assignment.subcategoryId === payload.subcategoryId,
    );

    if (duplicate) {
      throw new Error("Esa asignación ya existe para el juez seleccionado.");
    }

    const assignment: JudgeAssignmentScope = {
      id: createAssignmentId(),
      judgeUserId: payload.judgeUserId,
      eventId: payload.eventId,
      categoryId: payload.categoryId,
      subcategoryId: payload.subcategoryId,
      createdAt: new Date().toISOString(),
    };

    mockJudgeAssignments.unshift(assignment);
    appendActivity(
      "Asignación de juez",
      `${judge.name} asignado a ${event.name} · ${category.name} · ${subcategory.name}.`,
    );

    return { ...assignment };
  },
  async removeJudgeScope(assignmentId) {
    const index = mockJudgeAssignments.findIndex((assignment) => assignment.id === assignmentId);
    if (index === -1) {
      throw new Error("Asignación no encontrada.");
    }

    const [removed] = mockJudgeAssignments.splice(index, 1);
    const judge = mockUsers.find((user) => user.id === removed.judgeUserId);
    const event = findEvent(removed.eventId);
    const category = findCategory(removed.categoryId);
    const subcategory = findSubcategory(removed.subcategoryId);

    appendActivity(
      "Asignación removida",
      `${judge?.name ?? "Juez"}: ${event?.name ?? "Evento"} · ${category?.name ?? "Categoría"} · ${subcategory?.name ?? "Subcategoría"}.`,
    );
  },
};
