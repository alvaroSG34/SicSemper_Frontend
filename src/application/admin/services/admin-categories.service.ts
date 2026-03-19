import type {
  ApiAdminCategory,
  ApiCategoryDeleteImpact,
  ApiEventCategoryLink,
} from "@/application/admin/contracts/admin-categories.contract";
import type { ApiDeleteResponse } from "@/application/admin/contracts/admin-clubs.contract";
import type { ApiAdminDashboardResponse } from "@/application/admin/contracts/admin-dashboard.contract";
import {
  mapApiCategoryDeleteImpact,
  mapApiCategoryToCatalogCategory,
  mapCreateCategoryPayloadToApiRequest,
  mapCreateSubcategoryPayloadToApiRequest,
  mapEventCategoryLinkToApiRequest,
  mapUpdateCategoryPayloadToApiRequest,
  mapUpdateSubcategoryPayloadToApiRequest,
} from "@/application/admin/mappers/admin-categories.mapper";
import type { AdminService } from "@/application/admin/admin.service.types";
import { apiRequest } from "@/infrastructure/api/http-client";
import { getDashboardSnapshot, toErrorMessage } from "./admin-service.shared";

type DashboardSnapshot = ApiAdminDashboardResponse;
type BackendCategory = ApiAdminCategory;
type BackendEventCategory = ApiEventCategoryLink;

const syncRootCategoryEventLinks = async (
  categoryId: string,
  targetEventId: string,
  snapshot?: DashboardSnapshot,
) => {
  const dashboard = snapshot ?? (await getDashboardSnapshot());
  const currentRootLinks = dashboard.catalog.eventCategories.filter(
    (entry) => entry.categoryId === categoryId && entry.categoryParentId === null,
  );

  if (!currentRootLinks.some((entry) => entry.eventId === targetEventId)) {
    await apiRequest<BackendEventCategory>("/admin/event-categories", {
      method: "POST",
      body: mapEventCategoryLinkToApiRequest(targetEventId, categoryId),
    });
  }

  await Promise.all(
    currentRootLinks
      .filter((entry) => entry.eventId !== targetEventId)
      .map((entry) =>
        apiRequest<ApiDeleteResponse>(`/admin/event-categories/${entry.id}`, {
          method: "DELETE",
        }),
      ),
  );
};

const clearRootCategoryEventLinks = async (categoryId: string, snapshot?: DashboardSnapshot) => {
  const dashboard = snapshot ?? (await getDashboardSnapshot());
  const currentRootLinks = dashboard.catalog.eventCategories.filter(
    (entry) => entry.categoryId === categoryId && entry.categoryParentId === null,
  );

  await Promise.all(
    currentRootLinks.map((entry) =>
      apiRequest<ApiDeleteResponse>(`/admin/event-categories/${entry.id}`, {
        method: "DELETE",
      }),
    ),
  );
};

const syncChildCategoryEventLinks = async (
  subcategoryId: string,
  parentCategoryId: string,
  snapshot?: DashboardSnapshot,
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
          body: mapEventCategoryLinkToApiRequest(entry.eventId, subcategoryId),
        }),
      ),
  );

  await Promise.all(
    currentChildLinks
      .filter((entry) => !targetEventIds.has(entry.eventId))
      .map((entry) =>
        apiRequest<ApiDeleteResponse>(`/admin/event-categories/${entry.id}`, {
          method: "DELETE",
        }),
      ),
  );
};

export const adminCategoriesService: Pick<
  AdminService,
  | "createCategory"
  | "updateCategory"
  | "getCategoryDeleteImpact"
  | "removeCategory"
  | "createSubcategory"
  | "updateSubcategory"
  | "removeSubcategory"
> = {
  async createCategory(payload) {
    try {
      const category = await apiRequest<BackendCategory>("/admin/categories", {
        method: "POST",
        body: mapCreateCategoryPayloadToApiRequest(payload),
      });

      if (payload.eventId) {
        await apiRequest<BackendEventCategory>("/admin/event-categories", {
          method: "POST",
          body: mapEventCategoryLinkToApiRequest(payload.eventId, category.id),
        });
      }

      return mapApiCategoryToCatalogCategory(category, payload.eventId ?? null);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo crear la categoria."));
    }
  },
  async updateCategory(payload) {
    try {
      const [category, snapshot] = await Promise.all([
        apiRequest<BackendCategory>(`/admin/categories/${payload.id}`, {
          method: "PUT",
          body: mapUpdateCategoryPayloadToApiRequest(payload),
        }),
        getDashboardSnapshot(),
      ]);

      if (payload.eventId) {
        await syncRootCategoryEventLinks(payload.id, payload.eventId, snapshot);
      } else {
        await clearRootCategoryEventLinks(payload.id, snapshot);
      }

      return mapApiCategoryToCatalogCategory(category, payload.eventId ?? null);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo actualizar la categoria."));
    }
  },
  async getCategoryDeleteImpact(categoryId) {
    try {
      const impact = await apiRequest<ApiCategoryDeleteImpact>(
        `/admin/categories/${categoryId}/delete-impact`,
      );
      return mapApiCategoryDeleteImpact(impact);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo calcular el impacto de eliminacion de la categoria."));
    }
  },
  async removeCategory(categoryId) {
    try {
      await apiRequest<ApiDeleteResponse>(`/admin/categories/${categoryId}`, {
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
          body: mapCreateSubcategoryPayloadToApiRequest(payload),
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
          method: "PUT",
          body: mapUpdateSubcategoryPayloadToApiRequest(payload),
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
      await apiRequest<ApiDeleteResponse>(`/admin/categories/${subcategoryId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo eliminar la subcategoria."));
    }
  },
};
