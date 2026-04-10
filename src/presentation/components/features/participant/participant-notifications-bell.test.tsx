import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ParticipantNotificationItem } from "@/domain/participant/participant.types";
import { ParticipantNotificationsBell } from "./participant-notifications-bell";

const pushMock = vi.fn();
const closePopoverMock = vi.fn();
const togglePopoverMock = vi.fn();
const markAsReadMock = vi.fn();
const markAllAsReadMock = vi.fn();
const deleteNotificationMock = vi.fn();
const refreshMock = vi.fn();

const baseItem: ParticipantNotificationItem = {
  id: "notification-1",
  type: "MAQUETA_ENVIADA",
  severity: "BAJA",
  title: "Maqueta enviada",
  detail: "Tu maqueta fue enviada.",
  targetPath: "/participante/maquetas",
  metadata: null,
  createdAt: "2026-04-10T14:00:00.000Z",
  isRead: false,
  readAt: null,
};

const useParticipantNotificationsMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("./use-participant-notifications", () => ({
  useParticipantNotifications: () => useParticipantNotificationsMock(),
}));

describe("ParticipantNotificationsBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockReset();
    useParticipantNotificationsMock.mockReturnValue({
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
    render(<ParticipantNotificationsBell />);

    expect(
      await screen.findByRole("dialog", { name: /Notificaciones de participante/i }),
    ).toBeTruthy();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(closePopoverMock).toHaveBeenCalledTimes(1);
    });
  });

  it("marks item as read and navigates to target path on click", async () => {
    markAsReadMock.mockResolvedValue(undefined);
    render(<ParticipantNotificationsBell />);

    const itemTitle = await screen.findByText("Maqueta enviada");
    fireEvent.click(itemTitle.closest('[role="button"]') as HTMLDivElement);

    await waitFor(() => {
      expect(markAsReadMock).toHaveBeenCalledWith("notification-1");
    });
    expect(pushMock).toHaveBeenCalledWith("/participante/maquetas");
  });

  it("marks all notifications as read from popover action", async () => {
    render(<ParticipantNotificationsBell />);

    const markAllButton = await screen.findByRole("button", { name: "Marcar todas" });
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(markAllAsReadMock).toHaveBeenCalledTimes(1);
    });
  });

  it("deletes a read notification from action button", async () => {
    useParticipantNotificationsMock.mockReturnValue({
      isOpen: true,
      items: [{ ...baseItem, isRead: true, readAt: "2026-04-10T15:00:00.000Z" }],
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

    render(<ParticipantNotificationsBell />);

    const deleteButton = await screen.findByRole("button", { name: "Eliminar" });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteNotificationMock).toHaveBeenCalledWith("notification-1");
    });
  });
});
