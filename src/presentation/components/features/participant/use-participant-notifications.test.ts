import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { participantService } from "@/application/participant/participant.service";
import { useParticipantNotifications } from "./use-participant-notifications";

vi.mock("@/application/participant/participant.service", () => ({
  participantService: {
    listNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
    deleteNotification: vi.fn(),
  },
}));

const listNotificationsMock = vi.mocked(participantService.listNotifications);
const markNotificationAsReadMock = vi.mocked(participantService.markNotificationAsRead);
const markAllNotificationsAsReadMock = vi.mocked(participantService.markAllNotificationsAsRead);
const deleteNotificationMock = vi.mocked(participantService.deleteNotification);

const makePage = (
  overrides?: Partial<Awaited<ReturnType<typeof participantService.listNotifications>>>,
) => ({
  items: [
    {
      id: "notification-1",
      type: "MAQUETA_ENVIADA" as const,
      severity: "BAJA" as const,
      title: "Maqueta enviada",
      detail: "Tu maqueta fue enviada.",
      targetPath: "/participante/maquetas",
      metadata: null,
      createdAt: "2026-04-10T14:00:00.000Z",
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

describe("useParticipantNotifications", () => {
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
    const { result } = renderHook(() => useParticipantNotifications());

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
    const { result } = renderHook(() => useParticipantNotifications());

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
    renderHook(() => useParticipantNotifications());

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
    const { result } = renderHook(() => useParticipantNotifications());

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
            type: "MAQUETA_CALIFICADA",
            severity: "ALTA",
            title: "Maqueta calificada",
            detail: "Tu maqueta ya fue calificada.",
            targetPath: "/participante/maquetas",
            metadata: null,
            createdAt: "2026-04-10T14:00:00.000Z",
            isRead: true,
            readAt: "2026-04-10T15:00:00.000Z",
          },
        ],
        unreadCount: 0,
      }),
    );

    const { result } = renderHook(() => useParticipantNotifications());

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
