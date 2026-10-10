"use client";

import { useCallback, useEffect, useState } from "react";
import { adminEventControlService } from "@/application/admin/services/admin-event-control.service";
import type { AdminEventModelDetail } from "@/domain/admin/admin.types";
import { subscribeRealtimeInvalidation } from "@/presentation/realtime/realtime-invalidation-bus";

export const useAdminEventModelDetail = (eventId: string, modelId: string) => {
  const [detail, setDetail] = useState<AdminEventModelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextDetail = await adminEventControlService.getEventControlModelDetail(
        eventId,
        modelId,
      );
      setDetail(nextDetail);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "No se pudo cargar el detalle de la maqueta.",
      );
    } finally {
      setLoading(false);
    }
  }, [eventId, modelId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(
    () =>
      subscribeRealtimeInvalidation((invalidation) => {
        if (invalidation.scope?.eventId !== eventId) return;
        if (invalidation.scope?.modelId && invalidation.scope.modelId !== modelId) return;
        if (
          invalidation.domains.some((domain) => ["model", "review", "showcase"].includes(domain))
        ) {
          void load();
        }
      }),
    [eventId, load, modelId],
  );

  return { detail, loading, error, reload: load };
};
