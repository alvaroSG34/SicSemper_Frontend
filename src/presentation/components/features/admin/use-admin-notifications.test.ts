import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { adminNotificationsService } from "@/application/admin/services/admin-notifications.service";
import { useAdminNotifications } from "./use-admin-notifications";

vi.mock("@/application/admin/services/admin-notifications.service", () => ({
  adminNotificationsService: {
    listNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
    deleteNotification: vi.fn(),
  },
}));

const listNotificationsMock = vi.mocked(adminNotificationsService.listNotifications);
const markNotificationAsReadMock = vi.mocked(adminNotificationsService.markNotificationAsRead);
const markAllNotificationsAsReadMock = vi.mocked(adminNotificationsService.markAllNotificationsAsRead);
const deleteNotificationMock = vi.mocked(adminNotificationsService.deleteNotification);

const makePage = (
  overrides?: Partial<Awaited<ReturnType<typeof adminNotificationsService.listNotifications>>>,
) => ({
  items: [
    {
      id: "notification-1",
      type: "EVENTO_CREADO_ACTUALIZADO_ELIMINADO" as const,
      severity: "MEDIA" as const,
      title: "Evento actualizado",
      detail: "Se actualizo el evento principal.",
      targetPath: "/admin/eventos",
      metadata: null,
      createdAt: "2026-04-09T14:00:00.000Z",
      isRead: false,
      readAt: null,
    },
  ],
  page: 1,
  pageSize: 10,
  total: 1,
  hasMore: false,
  unreadCount: 1,
  ...overrides,
});

describe("useAdminNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listNotificationsMock.mockResolvedValue(makePage());
    markNotificationAsReadMock.mockResolvedValue({ success: true });
    markAllNotificationsAsReadMock.mockResolvedValue({ success: true, marked: 1 });
    deleteNotificationMock.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads notifications and updates read state per item", async () => {
    const { result } = renderHook(() => useAdminNotifications());

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1);
    });

    await act(async () => {
      await result.current.markAsRead("notification-1");
    });

    expect(markNotificationAsReadMock).toHaveBeenCalledWith("notification-1");
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.items[0]?.isRead).toBe(true);
  });

  it("marks all notifications as read", async () => {
    const { result } = renderHook(() => useAdminNotifications());

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1);
    });

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(markAllNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.items.every((item) => item.isRead)).toBe(true);
  });

  it("does not refresh notifications automatically after 60 seconds", async () => {
    vi.useFakeTimers();
    renderHook(() => useAdminNotifications());

    await act(async () => {
      await Promise.resolve();
    });
    expect(listNotificationsMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(60_000);
      await Promise.resolve();
    });

    expect(listNotificationsMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes notifications manually", async () => {
    const { result } = renderHook(() => useAdminNotifications());

    await waitFor(() => {
      expect(listNotificationsMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(listNotificationsMock).toHaveBeenCalledTimes(2);
  });

  it("deletes a read notification", async () => {
    listNotificationsMock.mockResolvedValue(
      makePage({
        items: [
          {
            id: "notification-2",
            type: "EVENTO_CREADO_ACTUALIZADO_ELIMINADO",
            severity: "MEDIA",
            title: "Evento actualizado",
            detail: "Se actualizo el evento principal.",
            targetPath: "/admin/eventos",
            metadata: null,
            createdAt: "2026-04-09T14:00:00.000Z",
            isRead: true,
            readAt: "2026-04-09T15:00:00.000Z",
          },
        ],
        unreadCount: 0,
      }),
    );

    const { result } = renderHook(() => useAdminNotifications());

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });

    await act(async () => {
      await result.current.deleteNotification("notification-2");
    });

    expect(deleteNotificationMock).toHaveBeenCalledWith("notification-2");
    expect(result.current.items).toHaveLength(0);
  });
});
