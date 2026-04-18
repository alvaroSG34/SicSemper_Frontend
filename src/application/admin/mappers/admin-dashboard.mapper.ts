import type {
  ActivityLogItem,
  AdminClub,
  AdminDashboardData,
  CatalogCategory,
  CatalogSubcategory,
  EventCategoryOption,
} from '@/domain/admin/admin.types';
import type {
  ApiAdminDashboardActivityItem,
  ApiAdminDashboardResponse,
} from '../contracts/admin-dashboard.contract';
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
  const categoriesById = new Map(
    dashboard.catalog.categories.map((entry) => [entry.id, entry]),
  );

  const rootCategories = new Map<string, CatalogCategory>(
    dashboard.catalog.categories
      .filter((category) => category.parentId === null)
      .map((category) => [
        category.id,
        mapApiCategoryToCatalogCategory(category, null),
      ]),
  );

  const subcategories = new Map<string, CatalogSubcategory>(
    dashboard.catalog.categories
      .filter((category) => category.parentId !== null)
      .map((category) => [
        category.id,
        {
          id: category.id,
          categoryId: category.parentId as string,
          name: category.name,
        },
      ]),
  );

  const buildCategoryPath = (categoryId: string) => {
    const chain: string[] = [];
    const visited = new Set<string>();
    let cursorId: string | null = categoryId;

    while (cursorId && !visited.has(cursorId)) {
      visited.add(cursorId);
      const category = categoriesById.get(cursorId);
      if (!category) {
        break;
      }
      chain.push(category.name);
      cursorId = category.parentId;
    }

    return chain.reverse().join(' > ');
  };

  const eventCategories: EventCategoryOption[] =
    dashboard.catalog.eventCategories.map((entry) => ({
      id: entry.id,
      eventId: entry.eventId,
      categoryId: entry.categoryId,
      name: buildCategoryPath(entry.categoryId) || entry.categoryName,
    }));

  return {
    events: dashboard.catalog.events.map(mapApiEventToCatalogEvent),
    categories: Array.from(rootCategories.values()),
    subcategories: Array.from(subcategories.values()),
    eventCategories,
  };
};
