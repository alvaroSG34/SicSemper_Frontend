import type {
  CreateParticipantModelPayload,
  ParticipantCategoryOption,
  ParticipantDashboardData,
  ParticipantEnrollment,
  ParticipantEventDetail,
  ParticipantModel,
  ParticipantScale,
  ParticipantSubcategoryOption,
} from "@/domain/participant/participant.types";
import type { CatalogEvent } from "@/domain/admin/admin.types";
import {
  mockCatalogCategories,
  mockCatalogEvents,
  mockCatalogSubcategories,
} from "@/infrastructure/mock/mock-admin";
import {
  getClonedParticipantModels,
  getClonedParticipantScales,
  mockParticipantEnrollments,
  mockParticipantModels,
  mockParticipantScales,
  toParticipantImageFromUpload,
  createParticipantModelId,
} from "@/infrastructure/mock/mock-participant-models";
import { mockUsers } from "@/infrastructure/mock/mock-users";
import { getClonedParticipantDashboardData } from "@/infrastructure/mock/mock-participant";

export interface ParticipantService {
  getDashboardData(userId?: string): Promise<ParticipantDashboardData>;
  getUpcomingEvents(): Promise<ParticipantEventDetail[]>;
  getEventDetailForParticipant(eventId: string): Promise<ParticipantEventDetail | null>;
  getCategoriesForEvent(eventId: string): Promise<ParticipantCategoryOption[]>;
  getSubcategoriesForCategory(categoryId: string): Promise<ParticipantSubcategoryOption[]>;
  getScales(): Promise<ParticipantScale[]>;
  getEnrollmentContext(
    userId: string,
    eventId: string,
    categoryId: string,
  ): Promise<ParticipantEnrollment | null>;
  createModelSubmission(payload: CreateParticipantModelPayload): Promise<ParticipantModel>;
  getMyModels(userId: string): Promise<ParticipantModel[]>;
}

const toInitials = (name: string): string => {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase());

  return letters.join("") || "PA";
};

const getDisplayName = (name: string): string => {
  const [firstName] = name.trim().split(/\s+/).filter(Boolean);
  return firstName || name;
};

const normalizeCode = (value: string) => value.trim().toLowerCase();

const ensureNonEmpty = (value: string, label: string) => {
  if (!value.trim()) {
    throw new Error(`El campo ${label} es obligatorio.`);
  }
};

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSizeBytes = 5 * 1024 * 1024;

const toEventDetail = (event: CatalogEvent): ParticipantEventDetail => ({
  id: event.id,
  name: event.name,
  status: event.status,
  place: event.place ?? "Por definir",
  startDate: event.startDate ?? "",
  endDate: event.endDate ?? event.startDate ?? "",
  description: event.description ?? "Sin descripcion registrada.",
  createdAt: event.createdAt ?? new Date().toISOString(),
  updatedAt: event.updatedAt ?? event.createdAt ?? new Date().toISOString(),
});

const ensureCategoryBelongsEvent = (eventId: string, categoryId: string) => {
  const category = mockCatalogCategories.find((item) => item.id === categoryId);
  if (!category || category.eventId !== eventId) {
    throw new Error("La categoria no pertenece al evento seleccionado.");
  }
  return category;
};

const ensureSubcategoryBelongsCategory = (categoryId: string, subcategoryId: string) => {
  const subcategory = mockCatalogSubcategories.find((item) => item.id === subcategoryId);
  if (!subcategory || subcategory.categoryId !== categoryId) {
    throw new Error("La subcategoria no pertenece a la categoria seleccionada.");
  }
  return subcategory;
};

const ensureScaleExists = (scaleId: string) => {
  const scale = mockParticipantScales.find((item) => item.id === scaleId);
  if (!scale) {
    throw new Error("La escala seleccionada no existe.");
  }
  return scale;
};

const randomCodeChunk = (length: number) => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let output = "";
  for (let index = 0; index < length; index += 1) {
    const charIndex = Math.floor(Math.random() * alphabet.length);
    output += alphabet[charIndex];
  }
  return output;
};

const buildEventCodePrefix = (eventId: string) => {
  const safeId = eventId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = safeId.slice(-3).padStart(3, "X");
  return `MQ-${suffix}`;
};

const generateUniqueModelCodeForEvent = (eventId: string) => {
  const prefix = buildEventCodePrefix(eventId);
  const maxAttempts = 200;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = `${prefix}-${randomCodeChunk(6)}`;
    const exists = mockParticipantModels.some(
      (model) =>
        model.eventId === eventId && normalizeCode(model.codigo) === normalizeCode(candidate),
    );
    if (!exists) {
      return candidate;
    }
  }

  throw new Error("No se pudo generar un codigo unico para la maqueta.");
};

export const participantService: ParticipantService = {
  async getDashboardData(userId) {
    const dashboard = getClonedParticipantDashboardData();

    if (!userId) {
      return dashboard;
    }

    const user = mockUsers.find((candidate) => candidate.id === userId);
    if (!user) {
      return dashboard;
    }

    dashboard.profile.userId = user.id;
    dashboard.profile.displayName = getDisplayName(user.name);
    dashboard.profile.initials = toInitials(user.name);
    dashboard.profile.verified = user.verified;

    return dashboard;
  },
  async getUpcomingEvents() {
    const now = new Date();
    return mockCatalogEvents
      .filter((event) => event.status === "ACTIVO")
      .filter((event) => {
        if (!event.endDate) {
          return true;
        }
        const endDate = new Date(event.endDate);
        return !Number.isNaN(endDate.getTime()) && endDate >= now;
      })
      .map(toEventDetail)
      .sort((left, right) => left.startDate.localeCompare(right.startDate));
  },
  async getEventDetailForParticipant(eventId) {
    const event = mockCatalogEvents.find((item) => item.id === eventId);
    return event ? toEventDetail(event) : null;
  },
  async getCategoriesForEvent(eventId) {
    return mockCatalogCategories
      .filter((category) => category.eventId === eventId)
      .map((category) => ({ ...category }));
  },
  async getSubcategoriesForCategory(categoryId) {
    return mockCatalogSubcategories
      .filter((subcategory) => subcategory.categoryId === categoryId)
      .map((subcategory) => ({ ...subcategory }));
  },
  async getScales() {
    return getClonedParticipantScales();
  },
  async getEnrollmentContext(userId, eventId, categoryId) {
    const enrollment = mockParticipantEnrollments.find(
      (item) =>
        item.userId === userId &&
        item.eventId === eventId &&
        item.categoryId === categoryId &&
        item.status === "ACTIVA",
    );

    return enrollment ? { ...enrollment } : null;
  },
  async createModelSubmission(payload) {
    ensureNonEmpty(payload.userId, "usuario");
    ensureNonEmpty(payload.eventId, "evento");
    ensureNonEmpty(payload.categoryId, "categoria");
    ensureNonEmpty(payload.subcategoryId, "subcategoria");
    ensureNonEmpty(payload.usuarioEventoCategoriaId, "inscripcion");
    ensureNonEmpty(payload.nombre, "nombre");
    ensureNonEmpty(payload.modelo, "modelo");
    ensureNonEmpty(payload.marca, "marca");

    const event = mockCatalogEvents.find((item) => item.id === payload.eventId);
    if (!event) {
      throw new Error("No existe el evento seleccionado.");
    }

    const category = ensureCategoryBelongsEvent(payload.eventId, payload.categoryId);
    const subcategory = ensureSubcategoryBelongsCategory(payload.categoryId, payload.subcategoryId);
    const scale = ensureScaleExists(payload.escalaId);

    const generatedCode = generateUniqueModelCodeForEvent(payload.eventId);

    const sanitizedImages = payload.images.map((image) => {
      if (!allowedImageTypes.has(image.type)) {
        throw new Error("Solo se permiten imagenes JPG, PNG o WEBP.");
      }
      if (image.size > maxImageSizeBytes) {
        throw new Error("Cada imagen debe ser menor o igual a 5MB.");
      }
      return image;
    });

    const now = new Date().toISOString();
    const modelId = createParticipantModelId();

    const model: ParticipantModel = {
      id: modelId,
      userId: payload.userId,
      eventId: payload.eventId,
      categoryId: payload.categoryId,
      subcategoryId: payload.subcategoryId,
      escalaId: payload.escalaId,
      usuarioEventoCategoriaId: payload.usuarioEventoCategoriaId,
      nombre: payload.nombre.trim(),
      modelo: payload.modelo.trim(),
      marca: payload.marca.trim(),
      descripcion: payload.descripcion?.trim() ?? "",
      codigo: generatedCode,
      status: "ENVIADA",
      createdAt: now,
      updatedAt: now,
      eventName: event.name,
      categoryName: category.name,
      subcategoryName: subcategory.name,
      escalaValue: scale.value,
      images: sanitizedImages.map((image, index) => toParticipantImageFromUpload(modelId, image, index)),
    };

    mockParticipantModels.unshift(model);
    return {
      ...model,
      images: model.images.map((image) => ({ ...image })),
    };
  },
  async getMyModels(userId) {
    if (!userId.trim()) {
      return [];
    }
    return getClonedParticipantModels().filter((model) => model.userId === userId);
  },
};
