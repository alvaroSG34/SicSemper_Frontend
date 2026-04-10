import { describe, expect, it } from "vitest";
import {
  mapApiAdminNotificationItem,
  mapApiAdminNotificationsPage,
} from "./admin-notifications.mapper";

describe("admin-notifications.mapper", () => {
  it("maps notification item preserving read state and metadata", () => {
    const mapped = mapApiAdminNotificationItem({
      id: "notification-1",
      type: "EVENTO_CREADO_ACTUALIZADO_ELIMINADO",
      severity: "MEDIA",
      title: "Evento actualizado",
      detail: "Se actualizo el evento prueba.",
      targetPath: "/admin/eventos",
      metadata: { actorUserId: "user-1" },
      createdAt: "2026-04-09T12:00:00.000Z",
      isRead: false,
      readAt: null,
    });

    expect(mapped).toEqual({
      id: "notification-1",
      type: "EVENTO_CREADO_ACTUALIZADO_ELIMINADO",
      severity: "MEDIA",
      title: "Evento actualizado",
      detail: "Se actualizo el evento prueba.",
      targetPath: "/admin/eventos",
      metadata: { actorUserId: "user-1" },
      createdAt: "2026-04-09T12:00:00.000Z",
      isRead: false,
      readAt: null,
    });
  });

  it("maps paginated response including unread count", () => {
    const mapped = mapApiAdminNotificationsPage({
      items: [
        {
          id: "notification-1",
          type: "ALERTA_SISTEMA",
          severity: "ALTA",
          title: "Alerta",
          detail: "Detalle",
          targetPath: "/admin/ajustes",
          metadata: null,
          createdAt: "2026-04-09T12:00:00.000Z",
          isRead: true,
          readAt: "2026-04-09T13:00:00.000Z",
        },
      ],
      page: 1,
      pageSize: 10,
      total: 1,
      hasMore: false,
      unreadCount: 0,
    });

    expect(mapped.items).toHaveLength(1);
    expect(mapped.unreadCount).toBe(0);
    expect(mapped.hasMore).toBe(false);
  });
});
