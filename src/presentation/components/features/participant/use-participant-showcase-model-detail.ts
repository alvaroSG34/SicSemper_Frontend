import { useCallback, useEffect, useState } from "react";
import { participantService } from "@/application/participant/participant.service";
import type { ParticipantShowcaseModelDetail } from "@/domain/participant/participant.types";
import { subscribeRealtimeInvalidation } from "@/presentation/realtime/realtime-invalidation-bus";

type UseParticipantShowcaseModelDetailInput = {
  eventId: string;
  finalCategoryId: string;
  modelId: string;
  scaleId?: string;
  groupId?: string;
};

export const useParticipantShowcaseModelDetail = ({
  eventId,
  finalCategoryId,
  modelId,
  scaleId,
  groupId,
}: UseParticipantShowcaseModelDetailInput) => {
  const [detail, setDetail] = useState<ParticipantShowcaseModelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await participantService.getShowcaseModelDetail({
          eventId,
          finalCategoryId,
          modelId,
          scaleId,
          groupId,
        });

        if (cancelled) {
          return;
        }

        setDetail(response);
      } catch (requestError) {
        if (cancelled) {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudo cargar el detalle de la maqueta.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }

    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [eventId, finalCategoryId, modelId, scaleId, groupId]);

  useEffect(() => load(), [load]);

  useEffect(
    () =>
      subscribeRealtimeInvalidation((invalidation) => {
        if (invalidation.scope?.eventId !== eventId || invalidation.scope?.modelId !== modelId) return;
        if (invalidation.domains.some((domain) => ["showcase", "ranking", "model", "review"].includes(domain))) void load();
      }),
    [eventId, load, modelId],
  );

  return { detail, loading, error };
};
