import type { components, operations } from '@/infrastructure/api/generated/backend-api.types';

export type ApiSystemPermission = components['schemas']['SystemPermission'];
export type ApiAdminPermissionEntry = components['schemas']['AdminPermissionEntry'];
export type ApiAdminPermissionActionRequest =
  operations['adminGrantAdminPermission']['requestBody']['content']['application/json'];
