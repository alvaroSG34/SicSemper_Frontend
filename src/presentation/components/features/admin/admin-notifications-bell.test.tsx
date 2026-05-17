import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminNotificationsService } from "@/application/admin/services/admin-notifications.service";
import { AdminNotificationsBell } from "./admin-notifications-bell";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

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

describe("AdminNotificationsBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockReset();
    listNotificationsMock.mockResolvedValue({
      items: [
        {
          id: "notification-1",
          type: "EVENTO_CREADO_ACTUALIZADO_ELIMINADO",
          severity: "MEDIA",
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
    });
    markNotificationAsReadMock.mockResolvedValue({ success: true });
    markAllNotificationsAsReadMock.mockResolvedValue({ success: true, marked: 1 });
    deleteNotificationMock.mockResolvedValue({ success: true });
  });

  it("opens and closes the popover", async () => {
    render(<AdminNotificationsBell />);

    const bellButton = await screen.findByRole("button", { name: /Notificaciones\./i });
    fireEvent.click(bellButton);

    expect(await screen.findByRole("dialog", { name: /Notificaciones de admin/i })).toBeTruthy();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /Notificaciones de admin/i })).toBeNull();
    });
  });

  it("marks item as read and navigates to target path on click", async () => {
    render(<AdminNotificationsBell />);

    const bellButton = await screen.findByRole("button", { name: /Notificaciones\./i });
    fireEvent.click(bellButton);

    const itemTitle = await screen.findByText("Evento actualizado");
    fireEvent.click(itemTitle.closest('[role="button"]') as HTMLDivElement);

    await waitFor(() => {
      expect(markNotificationAsReadMock).toHaveBeenCalledWith("notification-1");
    });
    expect(pushMock).toHaveBeenCalledWith("/admin/eventos");
  });

  it("marks all notifications as read from popover action", async () => {
    render(<AdminNotificationsBell />);

    const bellButton = await screen.findByRole("button", { name: /Notificaciones\./i });
    fireEvent.click(bellButton);

    const markAllButton = await screen.findByRole("button", { name: "Marcar todas" });
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(markAllNotificationsAsReadMock).toHaveBeenCalledTimes(1);
    });
  });

  it("refreshes notifications from popover action", async () => {
    render(<AdminNotificationsBell />);

    const bellButton = await screen.findByRole("button", { name: /Notificaciones\./i });
    fireEvent.click(bellButton);
    await screen.findByRole("dialog", { name: /Notificaciones de admin/i });
    await waitFor(() => {
      expect(listNotificationsMock).toHaveBeenCalled();
    });

    const callsBeforeRefresh = listNotificationsMock.mock.calls.length;
    const refreshButton = await screen.findByRole("button", { name: "Actualizar" });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(listNotificationsMock.mock.calls.length).toBeGreaterThan(callsBeforeRefresh);
    });
  });

  it("deletes a read notification from action button", async () => {
    listNotificationsMock.mockResolvedValue({
      items: [
        {
          id: "notification-1",
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
      page: 1,
      pageSize: 10,
      total: 1,
      hasMore: false,
      unreadCount: 0,
    });

    render(<AdminNotificationsBell />);

    const bellButton = await screen.findByRole("button", { name: /Notificaciones\./i });
    fireEvent.click(bellButton);

    const deleteButton = await screen.findByRole("button", { name: "Eliminar" });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteNotificationMock).toHaveBeenCalledWith("notification-1");
    });
  });
});
