import type { components, operations } from '@/infrastructure/api/generated/backend-api.types';

export type ApiAdminEvent = components['schemas']['AdminEvent'];
export type ApiEventDeleteImpact = components['schemas']['EventDeleteImpact'];
export type ApiCreateEventRequest =
  operations['adminCreateEvent']['requestBody']['content']['application/json'];
export type ApiUpdateEventRequest =
  operations['adminUpdateEvent']['requestBody']['content']['application/json'];

export type ApiAdminEventCategoryScalesResponse = {
  eventId: string;
  availableScales: Array<{
    id: string;
    value: string;
    createdAt: string;
    updatedAt: string;
  }>;
  items: Array<{
    eventCategoryId: string;
    categoryId: string;
    categoryName: string;
    categoryParentId: string | null;
    categoryParentName: string | null;
    scaleIds: string[];
    scaleValues: string[];
  }>;
};

export type ApiAdminSyncEventCategoryScalesRequest = {
  items: Array<{
    eventCategoryId: string;
    scaleIds: string[];
  }>;
};
