import type {
  ApiAdminEventControlModelDetail,
  ApiAdminEventControlModelRow,
  ApiAdminEventControlPage,
  ApiAdminEventControlParticipantDetail,
  ApiAdminEventControlParticipantRow,
  ApiAdminPodiumTieBreakGroupState,
  ApiAdminPodiumTieBreakState,
  ApiAdminEventControlSummary,
} from "@/application/admin/contracts/admin-event-control.contract";
import type { AdminTieBreakOption } from "@/domain/admin/admin.types";
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
  | "getEventPodiumTieBreakCandidates"
  | "getEventPodiumTieBreakGroupCandidates"
  | "setEventPodiumTieBreak"
  | "setEventPodiumTieBreakGroup"
  | "clearEventPodiumTieBreak"
  | "clearEventPodiumTieBreakGroup"
  | "getEventPodiumTieBreakOptions"
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

  async getEventPodiumTieBreakOptions(eventId) {
    try {
      return await apiRequest<AdminTieBreakOption[]>(
        `/admin/events/${eventId}/control/podium-tiebreak/options`,
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(error, "No se pudieron cargar las opciones de desempate."),
      );
    }
  },

  async getEventPodiumTieBreakCandidates(input) {
    try {
      const query = buildQueryString({
        finalCategoryId: input.finalCategoryId,
        scaleId: input.scaleId,
      });
      return await apiRequest<ApiAdminPodiumTieBreakState>(
        `/admin/events/${input.eventId}/control/podium-tiebreak/candidates${query}`,
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(error, "No se pudieron cargar los candidatos de desempate."),
      );
    }
  },
  async getEventPodiumTieBreakGroupCandidates(input) {
    try {
      const query = buildQueryString({
        groupId: input.groupId,
      });
      return await apiRequest<ApiAdminPodiumTieBreakGroupState>(
        `/admin/events/${input.eventId}/control/podium-tiebreak/groups/candidates${query}`,
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(error, "No se pudieron cargar los candidatos de desempate."),
      );
    }
  },

  async setEventPodiumTieBreak(input) {
    try {
      return await apiRequest<ApiAdminPodiumTieBreakState>(
        `/admin/events/${input.eventId}/control/podium-tiebreak`,
        {
          method: "PUT",
          body: {
            finalCategoryId: input.finalCategoryId,
            scaleId: input.scaleId,
            orderedModelIds: input.orderedModelIds,
          },
        },
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(error, "No se pudo guardar el desempate manual del podio."),
      );
    }
  },
  async setEventPodiumTieBreakGroup(input) {
    try {
      return await apiRequest<ApiAdminPodiumTieBreakGroupState>(
        `/admin/events/${input.eventId}/control/podium-tiebreak/groups`,
        {
          method: "PUT",
          body: {
            groupId: input.groupId,
            orderedModelIds: input.orderedModelIds,
          },
        },
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(error, "No se pudo guardar el desempate manual del podio."),
      );
    }
  },

  async clearEventPodiumTieBreak(input) {
    try {
      const query = buildQueryString({
        finalCategoryId: input.finalCategoryId,
        scaleId: input.scaleId,
      });
      return await apiRequest<ApiAdminPodiumTieBreakState>(
        `/admin/events/${input.eventId}/control/podium-tiebreak${query}`,
        {
          method: "DELETE",
        },
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(error, "No se pudo restaurar el ranking automatico del podio."),
      );
    }
  },
  async clearEventPodiumTieBreakGroup(input) {
    try {
      const query = buildQueryString({
        groupId: input.groupId,
      });
      return await apiRequest<ApiAdminPodiumTieBreakGroupState>(
        `/admin/events/${input.eventId}/control/podium-tiebreak/groups${query}`,
        {
          method: "DELETE",
        },
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(error, "No se pudo restaurar el ranking automatico del podio."),
      );
    }
  },
};
