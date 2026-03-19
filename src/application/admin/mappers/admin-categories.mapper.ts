import type {
  CategoryDeleteImpact,
  CreateCategoryPayload,
  CreateSubcategoryPayload,
  UpdateCategoryPayload,
  UpdateSubcategoryPayload,
} from '@/domain/admin/admin.types';
import type {
  ApiAdminCategory,
  ApiCategoryDeleteImpact,
  ApiCreateCategoryRequest,
  ApiCreateEventCategoryRequest,
  ApiUpdateCategoryRequest,
} from '../contracts/admin-categories.contract';

export const mapApiCategoryToCatalogCategory = (
  category: ApiAdminCategory,
  eventId?: string | null,
) => ({
  id: category.id,
  eventId: eventId ?? null,
  name: category.name,
  parentId: category.parentId,
});

export const mapApiCategoryDeleteImpact = (
  impact: ApiCategoryDeleteImpact,
): CategoryDeleteImpact => ({
  categoryId: impact.categoryId,
  categoryName: impact.categoryName,
  children: impact.children,
  eventCategories: impact.eventCategories,
  judgeAssignments: impact.judgeAssignments,
  registrations: impact.registrations,
  models: impact.models,
});

export const mapCreateCategoryPayloadToApiRequest = (
  payload: CreateCategoryPayload,
): ApiCreateCategoryRequest => ({
  name: payload.name,
});

export const mapUpdateCategoryPayloadToApiRequest = (
  payload: UpdateCategoryPayload,
): ApiUpdateCategoryRequest => ({
  name: payload.name,
});

export const mapCreateSubcategoryPayloadToApiRequest = (
  payload: CreateSubcategoryPayload,
): ApiCreateCategoryRequest => ({
  name: payload.name,
  parentId: payload.categoryId,
});

export const mapUpdateSubcategoryPayloadToApiRequest = (
  payload: UpdateSubcategoryPayload,
): ApiUpdateCategoryRequest => ({
  name: payload.name,
  parentId: payload.categoryId,
});

export const mapEventCategoryLinkToApiRequest = (
  eventId: string,
  categoryId: string,
): ApiCreateEventCategoryRequest => ({
  eventId,
  categoryId,
});
