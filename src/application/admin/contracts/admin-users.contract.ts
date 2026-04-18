import type { components, operations } from '@/infrastructure/api/generated/backend-api.types';

export type ApiAdminDashboardUser = components['schemas']['AdminUser'];
export type ApiListUsersResponse =
  operations['adminListUsers']['responses']['200']['content']['application/json'];
export type ApiBanParticipantResponse =
  operations['adminBanUser']['responses']['200']['content']['application/json'];
export type ApiUnbanParticipantResponse =
  operations['adminUnbanUser']['responses']['200']['content']['application/json'];
export type ApiSetParticipantVerifiedRequest =
  operations['adminSetUserVerified']['requestBody']['content']['application/json'];
export type ApiSetParticipantVerifiedResponse =
  operations['adminSetUserVerified']['responses']['200']['content']['application/json'];
