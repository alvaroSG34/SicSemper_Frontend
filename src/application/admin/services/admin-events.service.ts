import type {
  ApiAdminEvent,
  ApiAdminEventCategoryScalesResponse,
  ApiAdminSyncEventCategoryScalesRequest,
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
const mapEventCategoryLink = (entry: BackendEventCategory) => ({
  id: entry.id,
  eventId: entry.eventId,
  categoryId: entry.categoryId,
  name: entry.categoryName,
});

export const adminEventsService: Pick<
  AdminService,
  | "createEvent"
  | "createEventAndLinkCategories"
  | "updateEvent"
  | "updateEventAndLinkCategories"
  | "listEventCategoryScales"
  | "syncEventCategoryScales"
  | "createEventCategoryLink"
  | "removeEventCategoryLink"
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
  async createEventAndLinkCategories(payload, categoryIds, scalesByCategoryId) {
    try {
      const event = await apiRequest<BackendEvent>("/admin/events", {
        method: "POST",
        body: mapCreateEventPayloadToApiRequest(payload),
      });

      const createdLinks =
        categoryIds.length > 0
          ? await Promise.all(
              categoryIds.map((categoryId) =>
                apiRequest<BackendEventCategory>("/admin/event-categories", {
                  method: "POST",
                  body: { eventId: event.id, categoryId },
                }),
              ),
            )
          : [];

      if (categoryIds.length > 0) {
        const syncItems: ApiAdminSyncEventCategoryScalesRequest["items"] = createdLinks.map((entry) => ({
          eventCategoryId: entry.id,
          scaleIds: scalesByCategoryId[entry.categoryId] ?? [],
        }));
        await apiRequest<ApiAdminEventCategoryScalesResponse>(
          `/admin/events/${event.id}/category-scales`,
          {
            method: "PUT",
            body: {
              items: syncItems,
            },
          },
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
  async updateEventAndLinkCategories(payload, categoryIds, scalesByCategoryId) {
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

      const createdLinks = await Promise.all(
        categoryIds
          .filter((categoryId) => !currentCategoryIds.has(categoryId))
          .map((categoryId) =>
            apiRequest<BackendEventCategory>("/admin/event-categories", {
              method: "POST",
              body: { eventId: payload.id, categoryId },
            }),
          ),
      );

      const removedLinks = currentLinks.filter(
        (entry) => !desiredCategoryIds.has(entry.categoryId),
      );

      await Promise.all(
        removedLinks
          .map((entry) =>
            apiRequest<{ success: boolean }>(`/admin/event-categories/${entry.id}`, {
              method: "DELETE",
            }),
          ),
      );

      const removedLinkIds = new Set(removedLinks.map((entry) => entry.id));
      const retainedLinks = currentLinks.filter(
        (entry) => !removedLinkIds.has(entry.id),
      );
      const effectiveLinks = [...retainedLinks, ...createdLinks];
      const syncItems: ApiAdminSyncEventCategoryScalesRequest["items"] = effectiveLinks.map(
        (entry) => ({
          eventCategoryId: entry.id,
          scaleIds: scalesByCategoryId[entry.categoryId] ?? [],
        }),
      );

      if (effectiveLinks.length > 0) {
        await apiRequest<ApiAdminEventCategoryScalesResponse>(
          `/admin/events/${payload.id}/category-scales`,
          {
            method: "PUT",
            body: {
              items: syncItems,
            },
          },
        );
      }

      return mapEvent(event);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo actualizar el evento."));
    }
  },
  async createEventCategoryLink(payload) {
    try {
      const created = await apiRequest<BackendEventCategory>("/admin/event-categories", {
        method: "POST",
        body: payload,
      });
      return mapEventCategoryLink(created);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo vincular la categoria al evento."));
    }
  },
  async removeEventCategoryLink(eventCategoryId) {
    try {
      await apiRequest<ApiDeleteResponse>(`/admin/event-categories/${eventCategoryId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo remover el vinculo evento-categoria."));
    }
  },
  async listEventCategoryScales(eventId) {
    try {
      return await apiRequest<ApiAdminEventCategoryScalesResponse>(
        `/admin/events/${eventId}/category-scales`,
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(
          error,
          "No se pudieron cargar las escalas por categoria del evento.",
        ),
      );
    }
  },
  async syncEventCategoryScales(eventId, items) {
    try {
      await apiRequest<ApiAdminEventCategoryScalesResponse>(
        `/admin/events/${eventId}/category-scales`,
        {
          method: "PUT",
          body: {
            items,
          },
        },
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(
          error,
          "No se pudieron guardar las escalas por categoria del evento.",
        ),
      );
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
