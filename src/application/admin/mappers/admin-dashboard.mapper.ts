import type {
  ActivityLogItem,
  AdminClub,
  AdminDashboardData,
  CatalogCategory,
  CatalogSubcategory,
  EventCategoryOption,
} from '@/domain/admin/admin.types';
import type { ApiAdminDashboardActivityItem, ApiAdminDashboardResponse } from '../contracts/admin-dashboard.contract';
import { mapApiCategoryToCatalogCategory } from './admin-categories.mapper';
import { mapApiClubToAdminClub } from './admin-clubs.mapper';
import { mapApiEventToCatalogEvent } from './admin-events.mapper';

export const mapApiAdminDashboardActivityToActivityLogItem = (
  entry: ApiAdminDashboardActivityItem,
): ActivityLogItem => ({
  id: entry.id,
  title: entry.title,
  detail: entry.detail,
  createdAt: entry.createdAt,
});

export const mapApiAdminDashboardClubToAdminClub = (
  club: ApiAdminDashboardResponse['clubs'][number],
  dashboardUsers: ApiAdminDashboardResponse['users'],
): AdminClub =>
  mapApiClubToAdminClub(
    club,
    dashboardUsers.filter((user) => user.club?.id === club.id).length,
  );

export const buildCatalogFromApiAdminDashboard = (
  dashboard: ApiAdminDashboardResponse,
): AdminDashboardData['catalog'] => {
  const categoriesById = new Map(dashboard.catalog.categories.map((entry) => [entry.id, entry]));
  const rootCategories = new Map<string, CatalogCategory>();
  const subcategories = new Map<string, CatalogSubcategory>();

  for (const entry of dashboard.catalog.eventCategories) {
    if (!entry.categoryParentId) {
      const current = rootCategories.get(entry.categoryId);

      if (!current) {
        rootCategories.set(entry.categoryId, {
          id: entry.categoryId,
          eventId: entry.eventId,
          name: entry.categoryName,
          parentId: null,
        });
      }

      continue;
    }

    const parentCategory = categoriesById.get(entry.categoryParentId);

    if (!rootCategories.has(entry.categoryParentId)) {
      rootCategories.set(entry.categoryParentId, {
        id: entry.categoryParentId,
        eventId: entry.eventId,
        name: entry.categoryParentName ?? parentCategory?.name ?? 'Categoria',
        parentId: null,
      });
    }

    if (!subcategories.has(entry.categoryId)) {
      subcategories.set(entry.categoryId, {
        id: entry.categoryId,
        categoryId: entry.categoryParentId,
        name: entry.categoryName,
      });
    }
  }

  for (const category of dashboard.catalog.categories) {
    if (category.parentId !== null) {
      if (!subcategories.has(category.id)) {
        subcategories.set(category.id, {
          id: category.id,
          categoryId: category.parentId,
          name: category.name,
        });
      }
      continue;
    }

    if (!rootCategories.has(category.id)) {
      rootCategories.set(category.id, mapApiCategoryToCatalogCategory(category, null));
    }
  }

  const eventCategories: EventCategoryOption[] = dashboard.catalog.eventCategories.map((entry) => ({
    id: entry.id,
    eventId: entry.eventId,
    categoryId: entry.categoryId,
    name: entry.categoryParentName ? `${entry.categoryParentName} › ${entry.categoryName}` : entry.categoryName,
  }));

  return {
    events: dashboard.catalog.events.map(mapApiEventToCatalogEvent),
    categories: Array.from(rootCategories.values()),
    subcategories: Array.from(subcategories.values()),
    eventCategories,
  };
};
