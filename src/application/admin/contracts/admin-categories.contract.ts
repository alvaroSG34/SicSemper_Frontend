import type { components, operations } from '@/infrastructure/api/generated/backend-api.types';

export type ApiAdminCategory = components['schemas']['AdminCategory'];
export type ApiCategoryDeleteImpact = components['schemas']['CategoryDeleteImpact'];
export type ApiCreateCategoryRequest =
  operations['adminCreateCategory']['requestBody']['content']['application/json'];
export type ApiUpdateCategoryRequest =
  operations['adminUpdateCategory']['requestBody']['content']['application/json'];
export type ApiEventCategoryLink = components['schemas']['EventCategoryLink'];
export type ApiCreateEventCategoryRequest =
  operations['adminCreateEventCategory']['requestBody']['content']['application/json'];
