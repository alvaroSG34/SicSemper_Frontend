import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JudgeNotificationItem } from "@/domain/judge/judge.types";
import { JudgeNotificationsBell } from "./judge-notifications-bell";

const pushMock = vi.fn();
const closePopoverMock = vi.fn();
const togglePopoverMock = vi.fn();
const markAsReadMock = vi.fn();
const markAllAsReadMock = vi.fn();
const deleteNotificationMock = vi.fn();
const refreshMock = vi.fn();

const baseItem: JudgeNotificationItem = {
  id: "notification-1",
  type: "ASIGNACION_CREADA",
  severity: "MEDIA",
  title: "Nueva asignacion",
  detail: "Se te asigno Evento Nacional / Aviones.",
  targetPath: "/juez/eventos",
  metadata: null,
  createdAt: "2026-04-09T14:00:00.000Z",
  isRead: false,
  readAt: null,
};

const useJudgeNotificationsMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("./use-judge-notifications", () => ({
  useJudgeNotifications: () => useJudgeNotificationsMock(),
}));

describe("JudgeNotificationsBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockReset();
    useJudgeNotificationsMock.mockReturnValue({
      isOpen: true,
      items: [baseItem],
      unreadCount: 1,
      hasMore: false,
      loading: false,
      error: null,
      markingAll: false,
      markingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      closePopover: closePopoverMock,
      togglePopover: togglePopoverMock,
      refresh: refreshMock,
      markAsRead: markAsReadMock,
      markAllAsRead: markAllAsReadMock,
      deleteNotification: deleteNotificationMock,
    });
  });

  it("renders popover and closes on outside click", async () => {
    render(<JudgeNotificationsBell />);

    expect(await screen.findByRole("dialog", { name: /Notificaciones de juez/i })).toBeTruthy();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(closePopoverMock).toHaveBeenCalledTimes(1);
    });
  });

  it("marks item as read and navigates to target path on click", async () => {
    markAsReadMock.mockResolvedValue(undefined);
    render(<JudgeNotificationsBell />);

    const itemTitle = await screen.findByText("Nueva asignacion");
    fireEvent.click(itemTitle.closest('[role="button"]') as HTMLDivElement);

    await waitFor(() => {
      expect(markAsReadMock).toHaveBeenCalledWith("notification-1");
    });
    expect(pushMock).toHaveBeenCalledWith("/juez/eventos");
  });

  it("marks all notifications as read from popover action", async () => {
    render(<JudgeNotificationsBell />);

    const markAllButton = await screen.findByRole("button", { name: "Marcar todas" });
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(markAllAsReadMock).toHaveBeenCalledTimes(1);
    });
  });

  it("refreshes notifications from popover action", async () => {
    render(<JudgeNotificationsBell />);

    const refreshButton = await screen.findByRole("button", { name: "Actualizar" });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });
  });

  it("deletes a read notification from action button", async () => {
    useJudgeNotificationsMock.mockReturnValue({
      isOpen: true,
      items: [{ ...baseItem, isRead: true, readAt: "2026-04-09T15:00:00.000Z" }],
      unreadCount: 0,
      hasMore: false,
      loading: false,
      error: null,
      markingAll: false,
      markingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      closePopover: closePopoverMock,
      togglePopover: togglePopoverMock,
      refresh: refreshMock,
      markAsRead: markAsReadMock,
      markAllAsRead: markAllAsReadMock,
      deleteNotification: deleteNotificationMock,
    });

    render(<JudgeNotificationsBell />);

    const deleteButton = await screen.findByRole("button", { name: "Eliminar" });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteNotificationMock).toHaveBeenCalledWith("notification-1");
    });
  });
});
