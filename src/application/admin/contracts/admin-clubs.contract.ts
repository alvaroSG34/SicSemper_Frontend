import type { components, operations } from '@/infrastructure/api/generated/backend-api.types';

export type ApiAdminClub = components['schemas']['AdminClub'];
export type ApiClubDeleteImpact = components['schemas']['ClubDeleteImpact'];
export type ApiCreateClubRequest = operations['adminCreateClub']['requestBody']['content']['application/json'];
export type ApiUpdateClubRequest = operations['adminUpdateClub']['requestBody']['content']['application/json'];
export type ApiDeleteResponse = components['schemas']['DeleteResponse'];

