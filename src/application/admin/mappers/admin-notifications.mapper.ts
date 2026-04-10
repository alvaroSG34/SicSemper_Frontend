import type {
  ApiAdminNotificationItem,
  ApiAdminNotificationsPage,
} from "@/application/admin/contracts/admin-notifications.contract";
import type {
  AdminNotificationItem,
  AdminNotificationsPageResponse,
} from "@/domain/admin/admin.types";

export const mapApiAdminNotificationItem = (
  item: ApiAdminNotificationItem,
): AdminNotificationItem => ({
  id: item.id,
  type: item.type,
  severity: item.severity,
  title: item.title,
  detail: item.detail,
  targetPath: item.targetPath,
  metadata: item.metadata,
  createdAt: item.createdAt,
  isRead: item.isRead,
  readAt: item.readAt,
});

export const mapApiAdminNotificationsPage = (
  page: ApiAdminNotificationsPage,
): AdminNotificationsPageResponse => ({
  items: page.items.map(mapApiAdminNotificationItem),
  page: page.page,
  pageSize: page.pageSize,
  total: page.total,
  hasMore: page.hasMore,
  unreadCount: page.unreadCount,
});
