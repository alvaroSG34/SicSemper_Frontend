"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { judgeService } from "@/application/judge/judge.service";
import type { JudgeNotificationItem } from "@/domain/judge/judge.types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const POLLING_INTERVAL_MS = 60_000;

type UseJudgeNotificationsResult = {
  isOpen: boolean;
  items: JudgeNotificationItem[];
  unreadCount: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  markingAll: boolean;
  markingIds: Set<string>;
  deletingIds: Set<string>;
  closePopover: () => void;
  togglePopover: () => void;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
};

export const useJudgeNotifications = (): UseJudgeNotificationsResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<JudgeNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const inFlightRef = useRef<Promise<void> | null>(null);

  const fetchNotifications = useCallback(async (showLoading: boolean) => {
    if (inFlightRef.current) {
      await inFlightRef.current;
      return;
    }

    const request = (async () => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const page = await judgeService.listNotifications(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
        setItems(page.items);
        setUnreadCount(page.unreadCount);
        setHasMore(page.hasMore);
        setError(null);
      } catch (nextError) {
        const message =
          nextError instanceof Error
            ? nextError.message
            : "No se pudieron cargar las notificaciones.";
        setError(message);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = request;
    await request;
  }, []);

  const refresh = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  const closePopover = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePopover = useCallback(() => {
    setIsOpen((previous) => !previous);
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    setMarkingIds((previous) => new Set(previous).add(notificationId));

    try {
      await judgeService.markNotificationAsRead(notificationId);
      setItems((previous) =>
        previous.map((item) =>
          item.id === notificationId && !item.isRead
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((previous) => Math.max(0, previous - 1));
      setError(null);
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : "No se pudo marcar la notificacion como leida.";
      setError(message);
    } finally {
      setMarkingIds((previous) => {
        const next = new Set(previous);
        next.delete(notificationId);
        return next;
      });
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setMarkingAll(true);

    try {
      await judgeService.markAllNotificationsAsRead();
      const readAt = new Date().toISOString();
      setItems((previous) =>
        previous.map((item) => (item.isRead ? item : { ...item, isRead: true, readAt })),
      );
      setUnreadCount(0);
      setError(null);
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : "No se pudieron marcar todas las notificaciones como leidas.";
      setError(message);
    } finally {
      setMarkingAll(false);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    setDeletingIds((previous) => new Set(previous).add(notificationId));

    try {
      await judgeService.deleteNotification(notificationId);
      setItems((previous) => previous.filter((item) => item.id !== notificationId));
      setError(null);
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : "No se pudo eliminar la notificacion.";
      setError(message);
    } finally {
      setDeletingIds((previous) => {
        const next = new Set(previous);
        next.delete(notificationId);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    void fetchNotifications(false);
  }, [fetchNotifications]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchNotifications(false);
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void fetchNotifications(true);
  }, [fetchNotifications, isOpen]);

  const stableMarkingIds = useMemo(() => markingIds, [markingIds]);
  const stableDeletingIds = useMemo(() => deletingIds, [deletingIds]);

  return {
    isOpen,
    items,
    unreadCount,
    hasMore,
    loading,
    error,
    markingAll,
    markingIds: stableMarkingIds,
    deletingIds: stableDeletingIds,
    closePopover,
    togglePopover,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
