import type {
  CreateParticipantModelPayload,
  ParticipantCategoryOption,
  ParticipantDashboardData,
  ParticipantEnrollment,
  ParticipantEventDetail,
  ParticipantProfileDetails,
  ParticipantModel,
  ParticipantScale,
  ParticipantSubcategoryOption,
  UpdateParticipantProfilePayload,
} from "@/domain/participant/participant.types";
import { ApiError, apiRequest } from "@/infrastructure/api/http-client";

type BackendParticipantDashboard = ParticipantDashboardData;

type BackendParticipantEventDetail = ParticipantEventDetail;

type BackendParticipantScale = ParticipantScale;

type BackendParticipantProfile = ParticipantProfileDetails;

type BackendParticipantEnrollment = {
  id: string;
  userId: string;
  eventId: string;
  eventCategoryId: string;
  status: ParticipantEnrollment["status"];
  registrationDate: string;
  registrationCode: string;
  createdAt: string;
  updatedAt: string;
};

type BackendParticipantModel = {
  id: string;
  userId: string;
  eventId: string;
  categoryId: string;
  subcategoryId: string | null;
  escalaId: string;
  usuarioEventoCategoriaId: string;
  nombreModelo: string;
  marca: string;
  descripcion: string;
  codigo: string;
  status: ParticipantModel["status"];
  createdAt: string;
  updatedAt: string;
  eventName: string;
  categoryName: string;
  subcategoryName: string | null;
  escalaValue: string;
  files: Array<{
    id: string;
    modelId: string;
    publicUrl: string | null;
    order: number;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
    updatedAt: string;
  }>;
};

export interface ParticipantService {
  getDashboardData(userId?: string): Promise<ParticipantDashboardData>;
  getProfile(): Promise<ParticipantProfileDetails>;
  updateProfile(payload: UpdateParticipantProfilePayload): Promise<ParticipantProfileDetails>;
  uploadProfilePhoto(file: File): Promise<{ url: string }>;
  getUpcomingEvents(): Promise<ParticipantEventDetail[]>;
  getEventDetailForParticipant(eventId: string): Promise<ParticipantEventDetail | null>;
  getCategoriesForEvent(eventId: string): Promise<ParticipantCategoryOption[]>;
  getSubcategoriesForCategory(
    categoryId: string,
    eventId?: string,
  ): Promise<ParticipantSubcategoryOption[]>;
  getScales(): Promise<ParticipantScale[]>;
  getEnrollmentContext(
    userId: string,
    eventId: string,
    categoryId: string,
  ): Promise<ParticipantEnrollment | null>;
  uploadModelFile(file: File): Promise<{
    name: string;
    type: string;
    size: number;
    publicUrl?: string | null;
    storageKey?: string | null;
  }>;
  createModelSubmission(payload: CreateParticipantModelPayload): Promise<ParticipantModel>;
  getMyModels(userId: string): Promise<ParticipantModel[]>;
}

const participantErrorMessages: Record<string, string> = {
  CATEGORY_NOT_FOUND: "La categoria seleccionada no existe.",
  CI_ALREADY_IN_USE: "Ese CI ya esta registrado.",
  CLUB_NOT_FOUND: "El club seleccionado ya no esta disponible.",
  EVENT_CATEGORY_NOT_AVAILABLE: "La categoria seleccionada no esta disponible para ese evento.",
  EVENT_NOT_FOUND: "No se encontro el evento seleccionado.",
  FILE_TYPE_INVALID: "Solo se permiten imagenes JPG, PNG, WEBP o PDF.",
  IMAGE_LIMIT_EXCEEDED: "Solo puedes adjuntar hasta 5 imagenes.",
  IMAGE_SIZE_INVALID: "Cada imagen debe ser menor o igual a 5MB.",
  PDF_LIMIT_EXCEEDED: "Solo puedes adjuntar hasta 2 archivos PDF.",
  PDF_SIZE_INVALID: "Cada PDF debe ser menor o igual a 10MB.",
  PHOTO_FILE_REQUIRED: "Debes seleccionar una imagen para continuar.",
  PHOTO_FILE_SIZE_INVALID: "La foto de perfil debe pesar maximo 2MB.",
  PHOTO_FILE_TYPE_INVALID: "Solo se permiten imagenes JPG, PNG o WEBP.",
  PHOTO_REQUIRED: "Debes subir una foto de perfil para guardar tus datos.",
  SCALE_NOT_FOUND: "La escala seleccionada no existe.",
  SUBCATEGORY_CATEGORY_MISMATCH: "La subcategoria no pertenece a la categoria seleccionada.",
  SUBCATEGORY_REQUIRED: "Debes seleccionar una subcategoria para continuar.",
  USER_NOT_FOUND: "No se encontro el participante actual.",
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    if (error.code && participantErrorMessages[error.code]) {
      return participantErrorMessages[error.code];
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

const mapEnrollment = (
  enrollment: BackendParticipantEnrollment,
  categoryId: string,
): ParticipantEnrollment => ({
  id: enrollment.id,
  userId: enrollment.userId,
  eventId: enrollment.eventId,
  categoryId,
  status: enrollment.status,
  registrationDate: enrollment.registrationDate,
  registrationCode: enrollment.registrationCode,
  createdAt: enrollment.createdAt,
  updatedAt: enrollment.updatedAt,
});

const mapModel = (model: BackendParticipantModel): ParticipantModel => ({
  ...model,
  subcategoryId: model.subcategoryId ?? model.categoryId,
  subcategoryName: model.subcategoryName ?? model.categoryName,
  files: model.files.map((file) => ({
    ...file,
    publicUrl: file.publicUrl ?? "",
  })),
});

export const participantService: ParticipantService = {
  async getDashboardData() {
    try {
      return await apiRequest<BackendParticipantDashboard>("/participant/dashboard");
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar el dashboard del participante."));
    }
  },
  async getProfile() {
    try {
      return await apiRequest<BackendParticipantProfile>("/participant/profile");
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar tu perfil."));
    }
  },
  async updateProfile(payload) {
    try {
      return await apiRequest<BackendParticipantProfile>("/participant/profile", {
        method: "PATCH",
        body: payload,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo actualizar tu perfil."));
    }
  },
  async uploadProfilePhoto(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      return await apiRequest<{ url: string }>("/participant/uploads/profile-photo", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo subir la foto de perfil."));
    }
  },
  async getUpcomingEvents() {
    try {
      return await apiRequest<BackendParticipantEventDetail[]>("/participant/events/upcoming");
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudieron cargar los eventos disponibles."));
    }
  },
  async getEventDetailForParticipant(eventId) {
    try {
      return await apiRequest<BackendParticipantEventDetail>(`/participant/events/${eventId}`);
    } catch (error) {
      if (error instanceof ApiError && error.code === "EVENT_NOT_FOUND") {
        return null;
      }

      throw new Error(toErrorMessage(error, "No se pudo cargar el evento seleccionado."));
    }
  },
  async getCategoriesForEvent(eventId) {
    try {
      return await apiRequest<ParticipantCategoryOption[]>(`/participant/events/${eventId}/categories`);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudieron cargar las categorias del evento."));
    }
  },
  async getSubcategoriesForCategory(categoryId, eventId) {
    try {
      const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
      return await apiRequest<ParticipantSubcategoryOption[]>(
        `/participant/categories/${categoryId}/subcategories${query}`,
      );
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudieron cargar las subcategorias."));
    }
  },
  async getScales() {
    try {
      return await apiRequest<BackendParticipantScale[]>("/participant/scales");
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudieron cargar las escalas."));
    }
  },
  async getEnrollmentContext(_userId, eventId, categoryId) {
    try {
      void _userId;

      const enrollment = await apiRequest<BackendParticipantEnrollment | null>(
        `/participant/registrations/context?eventId=${encodeURIComponent(eventId)}&categoryId=${encodeURIComponent(categoryId)}`,
      );

      return enrollment ? mapEnrollment(enrollment, categoryId) : null;
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo recuperar el contexto de inscripcion."));
    }
  },
  async uploadModelFile(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      return await apiRequest<{
        name: string;
        type: string;
        size: number;
        publicUrl?: string | null;
        storageKey?: string | null;
      }>("/participant/uploads/model-file", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo subir el archivo de la maqueta."));
    }
  },
  async createModelSubmission(payload) {
    try {
      const model = await apiRequest<BackendParticipantModel>("/participant/models", {
        method: "POST",
        body: {
          eventId: payload.eventId,
          categoryId: payload.categoryId,
          subcategoryId: payload.subcategoryId,
          scaleId: payload.escalaId,
          nombreModelo: payload.nombreModelo,
          brand: payload.marca,
          description: payload.descripcion,
          files: payload.files,
        },
      });

      return mapModel(model);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo registrar la maqueta."));
    }
  },
  async getMyModels(_userId) {
    try {
      void _userId;

      const models = await apiRequest<BackendParticipantModel[]>("/participant/models/my");
      return models.map(mapModel);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar tu historial de maquetas."));
    }
  },
};
