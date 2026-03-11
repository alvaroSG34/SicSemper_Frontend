import type {
  JudgeDashboardData,
  JudgeQueueItem,
  JudgeRecentReview,
} from "@/domain/judge/judge.types";
import { ApiError, apiRequest } from "@/infrastructure/api/http-client";

const judgeErrorMessages: Record<string, string> = {
  MODEL_NOT_ASSIGNED_TO_JUDGE: "La maqueta no esta asignada a este juez.",
  ROLE_FORBIDDEN: "Tu rol activo no tiene acceso al panel de juez.",
  USER_NOT_FOUND: "No se encontro al juez actual.",
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
  startReview(modelId: string): Promise<JudgeQueueItem>;
  completeReview(modelId: string): Promise<JudgeRecentReview>;
}

export const judgeService: JudgeService = {
  async getDashboardData() {
    try {
      return await apiRequest<JudgeDashboardData>("/judge/dashboard");
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar el dashboard de juez."));
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
  async completeReview(modelId) {
    try {
      return await apiRequest<JudgeRecentReview>(`/judge/models/${modelId}/complete-review`, {
        method: "PATCH",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo completar la revision."));
    }
  },
};
