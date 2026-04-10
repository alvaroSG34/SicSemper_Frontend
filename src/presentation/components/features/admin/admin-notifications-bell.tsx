"use client";

import { Bell, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import type { AdminNotificationItem } from "@/domain/admin/admin.types";
import { useAdminNotifications } from "./use-admin-notifications";

const formatNotificationDate = (value: string) =>
  new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function AdminNotificationsBell() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    isOpen,
    items,
    unreadCount,
    hasMore,
    loading,
    error,
    markingAll,
    markingIds,
    deletingIds,
    closePopover,
    togglePopover,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useAdminNotifications();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (containerRef.current.contains(event.target as Node)) {
        return;
      }

      closePopover();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopover();
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closePopover, isOpen]);

  const unreadLabel = useMemo(
    () =>
      unreadCount > 0
        ? `${unreadCount} notificacion${unreadCount === 1 ? "" : "es"} sin leer`
        : "Sin notificaciones sin leer",
    [unreadCount],
  );

  const handleNotificationClick = async (item: AdminNotificationItem) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }

    if (item.targetPath) {
      closePopover();
      router.push(item.targetPath);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Notificaciones. ${unreadLabel}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={togglePopover}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition hover:border-[#2A2A2A] hover:bg-[#131313]"
      >
        <Bell className="h-5 w-5 text-white" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-[5px] bg-[#F15BB5]" />
        ) : null}
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Notificaciones de admin"
          className="absolute right-0 top-12 z-50 w-[min(92vw,360px)] rounded-2xl border border-[#2D2D2D] bg-[#0F0F0F] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#222222] px-2 pb-2">
            <div>
              <p className="text-sm font-semibold text-white">Notificaciones</p>
              <p className="text-xs text-[#999999]">{unreadLabel}</p>
            </div>

            <button
              type="button"
              onClick={() => void markAllAsRead()}
              disabled={markingAll || unreadCount === 0}
              className="rounded-full border border-[#2D2D2D] px-3 py-1 text-[11px] font-semibold text-[#C8CEFF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markingAll ? "Marcando..." : "Marcar todas"}
            </button>
          </div>

          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-[#AAAAAA]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando notificaciones...
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-xl border border-[#ef4444]/40 bg-[#7f1d1d]/20 p-3 text-xs text-[#fca5a5]">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => void refresh()}
                className="mt-2 rounded-md border border-[#fca5a5]/40 px-2 py-1 text-[11px] font-semibold text-[#fca5a5]"
              >
                Reintentar
              </button>
            </div>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#AAAAAA]">No hay notificaciones por ahora.</div>
          ) : null}

          {!error && items.length > 0 ? (
            <div className="mt-2 max-h-[340px] space-y-2 overflow-y-auto pr-1">
              {items.map((item) => {
                const marking = markingIds.has(item.id);
                const deleting = deletingIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => void handleNotificationClick(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        void handleNotificationClick(item);
                      }
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      item.isRead
                        ? "border-[#262626] bg-[#151515]"
                        : "border-[#3B2B4A] bg-[#1A1520] hover:border-[#5A3B72]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white">{item.title}</p>
                      <span className="text-[10px] text-[#8E8E8E]">
                        {formatNotificationDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-5 text-[#B8B8B8]">{item.detail}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.isRead
                            ? "border border-[#2F2F2F] text-[#8F8F8F]"
                            : "border border-[#F15BB5]/40 text-[#F8A9D8]"
                        }`}
                      >
                        {item.isRead ? "Leida" : "No leida"}
                      </span>

                      {!item.isRead ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void markAsRead(item.id);
                          }}
                          disabled={marking}
                          className={`text-[11px] font-semibold ${
                            marking ? "cursor-not-allowed text-[#696969]" : "text-[#C8CEFF]"
                          }`}
                        >
                          {marking ? "Marcando..." : "Marcar como leida"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void deleteNotification(item.id);
                          }}
                          disabled={deleting}
                          className={`text-[11px] font-semibold ${
                            deleting ? "cursor-not-allowed text-[#696969]" : "text-[#EF9A9A]"
                          }`}
                        >
                          {deleting ? "Eliminando..." : "Eliminar"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {!error && hasMore ? (
            <p className="mt-2 px-2 text-[10px] text-[#7E7E7E]">Mostrando las ultimas 10 notificaciones.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
