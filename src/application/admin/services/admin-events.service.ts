import type {
  ApiAdminEvent,
  ApiEventDeleteImpact,
} from "@/application/admin/contracts/admin-events.contract";
import type { ApiDeleteResponse } from "@/application/admin/contracts/admin-clubs.contract";
import type { ApiEventCategoryLink } from "@/application/admin/contracts/admin-categories.contract";
import {
  mapApiEventDeleteImpact,
  mapApiEventToCatalogEvent,
  mapCreateEventPayloadToApiRequest,
  mapUpdateEventPayloadToApiRequest,
} from "@/application/admin/mappers/admin-events.mapper";
import type { AdminService } from "@/application/admin/admin.service.types";
import { apiRequest } from "@/infrastructure/api/http-client";
import { getDashboardSnapshot, toErrorMessage } from "./admin-service.shared";

type BackendEvent = ApiAdminEvent;
type BackendEventCategory = ApiEventCategoryLink;

const mapEvent = (event: BackendEvent) => mapApiEventToCatalogEvent(event);

export const adminEventsService: Pick<
  AdminService,
  | "createEvent"
  | "createEventAndLinkCategories"
  | "updateEvent"
  | "updateEventAndLinkCategories"
  | "getEventDeleteImpact"
  | "removeEvent"
> = {
  async createEvent(payload) {
    try {
      const event = await apiRequest<BackendEvent>("/admin/events", {
        method: "POST",
        body: mapCreateEventPayloadToApiRequest(payload),
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
        body: mapCreateEventPayloadToApiRequest(payload),
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
        method: "PUT",
        body: mapUpdateEventPayloadToApiRequest(payload),
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
        method: "PUT",
        body: mapUpdateEventPayloadToApiRequest(payload),
      });

      const currentLinks = dashboard.catalog.eventCategories.filter(
        (entry) => entry.eventId === payload.id,
      );
      const currentCategoryIds = new Set(currentLinks.map((entry) => entry.categoryId));
      const desiredCategoryIds = new Set(categoryIds);

      await Promise.all(
        categoryIds
          .filter((categoryId) => !currentCategoryIds.has(categoryId))
          .map((categoryId) =>
            apiRequest<BackendEventCategory>("/admin/event-categories", {
              method: "POST",
              body: { eventId: payload.id, categoryId },
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
      const impact = await apiRequest<ApiEventDeleteImpact>(`/admin/events/${eventId}/delete-impact`);
      return mapApiEventDeleteImpact(impact);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo calcular el impacto de eliminacion del evento."));
    }
  },
  async removeEvent(eventId) {
    try {
      await apiRequest<ApiDeleteResponse>(`/admin/events/${eventId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo eliminar el evento."));
    }
  },
};
