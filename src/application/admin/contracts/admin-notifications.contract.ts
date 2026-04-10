import type { components, operations } from "@/infrastructure/api/generated/backend-api.types";

export type ApiAdminNotificationType = components["schemas"]["AdminNotificationType"];
export type ApiAdminNotificationSeverity = components["schemas"]["AdminNotificationSeverity"];
export type ApiAdminNotificationItem = components["schemas"]["AdminNotificationItem"];
export type ApiAdminNotificationsPage =
  operations["adminListNotifications"]["responses"]["200"]["content"]["application/json"];
export type ApiAdminNotificationsMutationResult =
  operations["adminMarkNotificationAsRead"]["responses"]["200"]["content"]["application/json"];
export type ApiAdminNotificationsQuery = operations["adminListNotifications"]["parameters"]["query"];
