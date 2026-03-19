import type { components, operations } from '@/infrastructure/api/generated/backend-api.types';

export type ApiAdminEvent = components['schemas']['AdminEvent'];
export type ApiEventDeleteImpact = components['schemas']['EventDeleteImpact'];
export type ApiCreateEventRequest =
  operations['adminCreateEvent']['requestBody']['content']['application/json'];
export type ApiUpdateEventRequest =
  operations['adminUpdateEvent']['requestBody']['content']['application/json'];
