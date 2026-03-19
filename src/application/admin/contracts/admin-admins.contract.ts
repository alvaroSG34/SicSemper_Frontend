import type { operations } from '@/infrastructure/api/generated/backend-api.types';

export type ApiCreateAdminRequest =
  operations['adminCreateAdmin']['requestBody']['content']['application/json'];
export type ApiAdminManagedUser =
  operations['adminCreateAdmin']['responses']['201']['content']['application/json'];
export type ApiPromoteAdminUser =
  operations['adminPromoteToAdmin']['responses']['200']['content']['application/json'];
export type ApiDemoteAdminUser =
  operations['adminDemoteAdmin']['responses']['200']['content']['application/json'];
