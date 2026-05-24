import type {
  ApiAdminEventControlModelDetail,
  ApiAdminEventControlModelRow,
  ApiAdminEventControlPage,
  ApiAdminEventControlParticipantDetail,
  ApiAdminEventControlParticipantRow,
  ApiAdminEventControlSummary,
} from "@/application/admin/contracts/admin-event-control.contract";
import type { AdminService } from "@/application/admin/admin.service.types";
import { apiRequest } from "@/infrastructure/api/http-client";
import { toErrorMessage } from "./admin-service.shared";

const buildQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    query.set(key, String(value));
  }
  const encoded = query.toString();
  return encoded ? `?${encoded}` : "";
};

export const adminEventControlService: Pick<
  AdminService,
  | "getEventControlSummary"
  | "listEventControlParticipants"
  | "getEventControlParticipantDetail"
  | "listEventControlModels"
  | "getEventControlModelDetail"
> = {
  async getEventControlSummary(eventId) {
    try {
      return await apiRequest<ApiAdminEventControlSummary>(
        `/admin/events/${eventId}/control/summary`,
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(
          error,
          "No se pudo cargar el resumen operativo del evento.",
        ),
      );
    }
  },

  async listEventControlParticipants(input) {
    try {
      const query = buildQueryString({
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 20,
        search: input.search,
        userStatus: input.userStatus,
        registrationStatus: input.registrationStatus,
        verified: input.verified,
      });
      return await apiRequest<ApiAdminEventControlPage<ApiAdminEventControlParticipantRow>>(
        `/admin/events/${input.eventId}/control/participants${query}`,
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(
          error,
          "No se pudo cargar la lista de participantes del evento.",
        ),
      );
    }
  },

  async getEventControlParticipantDetail(eventId, userId) {
    try {
      return await apiRequest<ApiAdminEventControlParticipantDetail>(
        `/admin/events/${eventId}/control/participants/${userId}`,
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(
          error,
          "No se pudo cargar el detalle del participante.",
        ),
      );
    }
  },

  async listEventControlModels(input) {
    try {
      const query = buildQueryString({
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 20,
        search: input.search,
        status: input.status,
        sort: input.sort ?? "SCORE_DESC",
      });
      return await apiRequest<ApiAdminEventControlPage<ApiAdminEventControlModelRow>>(
        `/admin/events/${input.eventId}/control/models${query}`,
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(
          error,
          "No se pudo cargar la lista de maquetas del evento.",
        ),
      );
    }
  },

  async getEventControlModelDetail(eventId, modelId) {
    try {
      return await apiRequest<ApiAdminEventControlModelDetail>(
        `/admin/events/${eventId}/control/models/${modelId}`,
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(
          error,
          "No se pudo cargar el detalle de la maqueta.",
        ),
      );
    }
  },
};

