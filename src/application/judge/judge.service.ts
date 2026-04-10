import type {
  JudgeDashboardData,
  JudgeModelDetail,
  JudgeModelListResponse,
  JudgeNotificationsMutationResult,
  JudgeNotificationsPageResponse,
  JudgeQueueItem,
  JudgeReviewMutationResult,
  JudgeSaveDraftPayload,
  JudgeSubmitReviewPayload,
} from "@/domain/judge/judge.types";
import { ApiError, apiRequest } from "@/infrastructure/api/http-client";

const judgeErrorMessages: Record<string, string> = {
  MODEL_NOT_ASSIGNED_TO_JUDGE: "La maqueta no esta asignada a este juez.",
  ROLE_FORBIDDEN: "Tu rol activo no tiene acceso al panel de juez.",
  USER_NOT_FOUND: "No se encontro al juez actual.",
  REVIEW_ALREADY_SUBMITTED: "La evaluacion ya fue enviada y esta bloqueada.",
  REVIEW_CRITERIA_INCOMPLETE: "Completa los 5 criterios antes de enviar.",
  REVIEW_CRITERIA_OUT_OF_RANGE: "Cada criterio debe estar entre 0 y 10.",
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    if (error.code && judgeErrorMessages[error.code]) {
      return judgeErrorMessages[error.code];
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

export interface JudgeService {
  getDashboardData(): Promise<JudgeDashboardData>;
  listModels(input: {
    status?: "ENVIADA" | "EN_REVISION" | "CALIFICADA";
    eventId?: string;
    priority?: "Alta" | "Media" | "Baja";
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<JudgeModelListResponse>;
  getModelDetail(modelId: string): Promise<JudgeModelDetail>;
  startReview(modelId: string): Promise<JudgeQueueItem>;
  saveDraft(modelId: string, payload: JudgeSaveDraftPayload): Promise<JudgeReviewMutationResult>;
  submitReview(modelId: string, payload: JudgeSubmitReviewPayload): Promise<JudgeReviewMutationResult>;
  completeReview(modelId: string, payload: JudgeSubmitReviewPayload): Promise<JudgeReviewMutationResult>;
  listNotifications(page?: number, pageSize?: number): Promise<JudgeNotificationsPageResponse>;
  markNotificationAsRead(notificationId: string): Promise<JudgeNotificationsMutationResult>;
  markAllNotificationsAsRead(): Promise<JudgeNotificationsMutationResult>;
  deleteNotification(notificationId: string): Promise<JudgeNotificationsMutationResult>;
}

export const judgeService: JudgeService = {
  async getDashboardData() {
    try {
      return await apiRequest<JudgeDashboardData>("/judge/dashboard");
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar el dashboard de juez."));
    }
  },
  async listModels(input) {
    try {
      const searchParams = new URLSearchParams();
      if (input.status) {
        searchParams.set("status", input.status);
      }
      if (input.eventId) {
        searchParams.set("eventId", input.eventId);
      }
      if (input.priority) {
        searchParams.set("priority", input.priority);
      }
      if (input.search?.trim()) {
        searchParams.set("search", input.search.trim());
      }
      searchParams.set("page", String(input.page ?? 1));
      searchParams.set("pageSize", String(input.pageSize ?? 12));

      return await apiRequest<JudgeModelListResponse>(`/judge/models?${searchParams.toString()}`);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar la lista de maquetas asignadas."));
    }
  },
  async getModelDetail(modelId) {
    try {
      return await apiRequest<JudgeModelDetail>(`/judge/models/${modelId}`);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar el detalle de la maqueta."));
    }
  },
  async startReview(modelId) {
    try {
      return await apiRequest<JudgeQueueItem>(`/judge/models/${modelId}/start-review`, {
        method: "PATCH",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo iniciar la revision."));
    }
  },
  async saveDraft(modelId, payload) {
    try {
      return await apiRequest<JudgeReviewMutationResult>(`/judge/models/${modelId}/save-draft`, {
        method: "PATCH",
        body: payload,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo guardar el borrador de revision."));
    }
  },
  async submitReview(modelId, payload) {
    try {
      return await apiRequest<JudgeReviewMutationResult>(`/judge/models/${modelId}/submit-review`, {
        method: "PATCH",
        body: payload,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo enviar la revision."));
    }
  },
  async completeReview(modelId, payload) {
    try {
      return await apiRequest<JudgeReviewMutationResult>(`/judge/models/${modelId}/complete-review`, {
        method: "PATCH",
        body: payload,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo enviar la revision."));
    }
  },
  async listNotifications(page, pageSize) {
    try {
      const searchParams = new URLSearchParams();
      if (typeof page === "number") {
        searchParams.set("page", String(page));
      }
      if (typeof pageSize === "number") {
        searchParams.set("pageSize", String(pageSize));
      }
      const query = searchParams.toString();
      const path = query ? `/judge/notifications?${query}` : "/judge/notifications";
      return await apiRequest<JudgeNotificationsPageResponse>(path);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudieron cargar las notificaciones del juez."));
    }
  },
  async markNotificationAsRead(notificationId) {
    try {
      return await apiRequest<JudgeNotificationsMutationResult>(
        `/judge/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        },
      );
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo marcar la notificacion como leida."));
    }
  },
  async markAllNotificationsAsRead() {
    try {
      return await apiRequest<JudgeNotificationsMutationResult>("/judge/notifications/read-all", {
        method: "PATCH",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudieron marcar todas las notificaciones como leidas."));
    }
  },
  async deleteNotification(notificationId) {
    try {
      return await apiRequest<JudgeNotificationsMutationResult>(`/judge/notifications/${notificationId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo eliminar la notificacion."));
    }
  },
};
