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

type CategoryTreeIndex = {
  categoryById: Map<string, { id: string; parentId: string | null }>;
  childrenByParent: Map<string, string[]>;
};

const buildCategoryTreeIndex = (snapshot: DashboardSnapshot): CategoryTreeIndex => {
  const categoryById = new Map(
    snapshot.catalog.categories.map((category) => [
      category.id,
      {
        id: category.id,
        parentId: category.parentId,
      },
    ]),
  );
  const childrenByParent = new Map<string, string[]>();

  for (const category of snapshot.catalog.categories) {
    if (!category.parentId) {
      continue;
    }

    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category.id);
    childrenByParent.set(category.parentId, siblings);
  }

  return { categoryById, childrenByParent };
};

const collectSubtreeCategoryIds = (
  rootCategoryId: string,
  index: CategoryTreeIndex,
): string[] => {
  const ids: string[] = [];
  const visited = new Set<string>();
  const queue = [rootCategoryId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);
    ids.push(currentId);

    const children = index.childrenByParent.get(currentId) ?? [];
    queue.push(...children);
  }

  return ids;
};

const collectLeafCategoryIds = (
  rootCategoryId: string,
  index: CategoryTreeIndex,
): string[] => {
  const subtreeIds = collectSubtreeCategoryIds(rootCategoryId, index);
  return subtreeIds.filter((categoryId) => {
    const children = index.childrenByParent.get(categoryId) ?? [];
    return children.length === 0;
  });
};

const deleteEventCategoryLinks = async (links: BackendEventCategory[]) => {
  await Promise.all(
    links.map((entry) =>
      apiRequest<ApiDeleteResponse>(`/admin/event-categories/${entry.id}`, {
        method: "DELETE",
      }),
    ),
  );
};

const ensureEventLinksForLeafCategories = async (
  leafCategoryIds: string[],
  targetEventId: string,
  snapshot: DashboardSnapshot,
) => {
  const currentLinks = snapshot.catalog.eventCategories.filter((entry) =>
    leafCategoryIds.includes(entry.categoryId),
  );

  const currentByLeafAndEvent = new Set(
    currentLinks.map((entry) => `${entry.categoryId}::${entry.eventId}`),
  );

  await Promise.all(
    leafCategoryIds
      .filter((categoryId) => !currentByLeafAndEvent.has(`${categoryId}::${targetEventId}`))
      .map((categoryId) =>
        apiRequest<BackendEventCategory>("/admin/event-categories", {
          method: "POST",
          body: mapEventCategoryLinkToApiRequest(targetEventId, categoryId),
        }),
      ),
  );

  await deleteEventCategoryLinks(
    currentLinks.filter((entry) => entry.eventId !== targetEventId),
  );
};

const clearLinksForSubtree = async (
  rootCategoryId: string,
  snapshot: DashboardSnapshot,
) => {
  const index = buildCategoryTreeIndex(snapshot);
  const subtreeIds = new Set(collectSubtreeCategoryIds(rootCategoryId, index));

  const links = snapshot.catalog.eventCategories.filter((entry) =>
    subtreeIds.has(entry.categoryId),
  );

  await deleteEventCategoryLinks(links);
};

const syncRootCategoryEventLinks = async (
  categoryId: string,
  targetEventId: string,
  snapshot?: DashboardSnapshot,
) => {
  const dashboard = snapshot ?? (await getDashboardSnapshot());
  const index = buildCategoryTreeIndex(dashboard);
  const leafCategoryIds = collectLeafCategoryIds(categoryId, index);

  await ensureEventLinksForLeafCategories(leafCategoryIds, targetEventId, dashboard);

  const nonLeafIds = new Set(
    collectSubtreeCategoryIds(categoryId, index).filter(
      (entryId) => (index.childrenByParent.get(entryId) ?? []).length > 0,
    ),
  );

  await deleteEventCategoryLinks(
    dashboard.catalog.eventCategories.filter((entry) => nonLeafIds.has(entry.categoryId)),
  );
};

const clearRootCategoryEventLinks = async (
  categoryId: string,
  snapshot?: DashboardSnapshot,
) => {
  const dashboard = snapshot ?? (await getDashboardSnapshot());
  await clearLinksForSubtree(categoryId, dashboard);
};

const syncChildCategoryEventLinks = async (
  childCategoryId: string,
  parentCategoryId: string,
  snapshot?: DashboardSnapshot,
) => {
  const dashboard = snapshot ?? (await getDashboardSnapshot());

  const parentLinks = dashboard.catalog.eventCategories.filter(
    (entry) => entry.categoryId === parentCategoryId,
  );
  const childLinks = dashboard.catalog.eventCategories.filter(
    (entry) => entry.categoryId === childCategoryId,
  );

  const parentEventIds = new Set(parentLinks.map((entry) => entry.eventId));
  const childEventIds = new Set(childLinks.map((entry) => entry.eventId));

  await Promise.all(
    [...parentEventIds]
      .filter((eventId) => !childEventIds.has(eventId))
      .map((eventId) =>
        apiRequest<BackendEventCategory>("/admin/event-categories", {
          method: "POST",
          body: mapEventCategoryLinkToApiRequest(eventId, childCategoryId),
        }),
      ),
  );

  await deleteEventCategoryLinks(
    childLinks.filter((entry) => !parentEventIds.has(entry.eventId)),
  );

  const parentHasChildren = dashboard.catalog.categories.some(
    (entry) => entry.parentId === parentCategoryId,
  );

  if (parentHasChildren) {
    await deleteEventCategoryLinks(parentLinks);
  }
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
      const category = await apiRequest<BackendCategory>(`/admin/categories/${payload.id}`, {
        method: "PUT",
        body: mapUpdateCategoryPayloadToApiRequest(payload),
      });

      const hasEventIdInPayload = Object.prototype.hasOwnProperty.call(
        payload,
        "eventId",
      );

      if (hasEventIdInPayload) {
        const snapshot = await getDashboardSnapshot();
        if (payload.eventId) {
          await syncRootCategoryEventLinks(payload.id, payload.eventId, snapshot);
        } else {
          await clearRootCategoryEventLinks(payload.id, snapshot);
        }
      }

      const mappedEventId = hasEventIdInPayload ? payload.eventId ?? null : undefined;
      return mapApiCategoryToCatalogCategory(category, mappedEventId);
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
      throw new Error(
        toErrorMessage(
          error,
          "No se pudo calcular el impacto de eliminacion de la categoria.",
        ),
      );
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
      const category = await apiRequest<BackendCategory>("/admin/categories", {
        method: "POST",
        body: mapCreateSubcategoryPayloadToApiRequest(payload),
      });

      const snapshot = await getDashboardSnapshot();
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
      const category = await apiRequest<BackendCategory>(`/admin/categories/${payload.id}`, {
        method: "PUT",
        body: mapUpdateSubcategoryPayloadToApiRequest(payload),
      });

      const snapshot = await getDashboardSnapshot();
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
