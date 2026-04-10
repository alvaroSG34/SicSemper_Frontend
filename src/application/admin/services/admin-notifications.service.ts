import {
  mapApiAdminNotificationsPage,
} from "@/application/admin/mappers/admin-notifications.mapper";
import type { AdminService } from "@/application/admin/admin.service.types";
import type {
  ApiAdminNotificationsMutationResult,
  ApiAdminNotificationsPage,
} from "@/application/admin/contracts/admin-notifications.contract";
import { apiRequest } from "@/infrastructure/api/http-client";
import { toErrorMessage } from "./admin-service.shared";

type BackendAdminNotificationsPage = ApiAdminNotificationsPage;
type BackendMutationResult = ApiAdminNotificationsMutationResult;

const buildNotificationsPath = (page?: number, pageSize?: number) => {
  const searchParams = new URLSearchParams();

  if (typeof page === "number") {
    searchParams.set("page", String(page));
  }

  if (typeof pageSize === "number") {
    searchParams.set("pageSize", String(pageSize));
  }

  const query = searchParams.toString();
  return query ? `/admin/notifications?${query}` : "/admin/notifications";
};

export const adminNotificationsService: Pick<
  AdminService,
  | "listNotifications"
  | "markNotificationAsRead"
  | "markAllNotificationsAsRead"
  | "deleteNotification"
> = {
  async listNotifications(page, pageSize) {
    try {
      const response = await apiRequest<BackendAdminNotificationsPage>(
        buildNotificationsPath(page, pageSize),
      );
      return mapApiAdminNotificationsPage(response);
    } catch (error) {
      throw new Error(
        toErrorMessage(error, "No se pudieron cargar las notificaciones del panel admin."),
      );
    }
  },
  async markNotificationAsRead(notificationId) {
    try {
      return await apiRequest<BackendMutationResult>(
        `/admin/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        },
      );
    } catch (error) {
      throw new Error(
        toErrorMessage(error, "No se pudo marcar la notificacion como leida."),
      );
    }
  },
  async markAllNotificationsAsRead() {
    try {
      return await apiRequest<BackendMutationResult>("/admin/notifications/read-all", {
        method: "PATCH",
      });
    } catch (error) {
      throw new Error(
        toErrorMessage(error, "No se pudieron marcar todas las notificaciones como leidas."),
      );
    }
  },
  async deleteNotification(notificationId) {
    try {
      return await apiRequest<BackendMutationResult>(`/admin/notifications/${notificationId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(
        toErrorMessage(error, "No se pudo eliminar la notificacion."),
      );
    }
  },
};
