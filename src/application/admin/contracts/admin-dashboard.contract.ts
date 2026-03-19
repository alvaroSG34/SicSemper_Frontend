import type { components, operations } from '@/infrastructure/api/generated/backend-api.types';

export type ApiAdminDashboardResponse =
  operations['adminGetDashboard']['responses']['200']['content']['application/json'];
export type ApiAdminDashboardSummaryResponse =
  operations['adminGetDashboardSummary']['responses']['200']['content']['application/json'];
export type ApiAdminDashboardActivityItem = components['schemas']['AdminActivityItem'];
