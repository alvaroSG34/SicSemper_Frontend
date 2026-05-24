import { useEffect, useState } from "react";
import { participantService } from "@/application/participant/participant.service";
import type { ParticipantShowcaseModelDetail } from "@/domain/participant/participant.types";

type UseParticipantShowcaseModelDetailInput = {
  eventId: string;
  finalCategoryId: string;
  modelId: string;
  scaleId?: string;
};

export const useParticipantShowcaseModelDetail = ({
  eventId,
  finalCategoryId,
  modelId,
  scaleId,
}: UseParticipantShowcaseModelDetailInput) => {
  const [detail, setDetail] = useState<ParticipantShowcaseModelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [eventId, finalCategoryId, modelId, scaleId]);

  return { detail, loading, error };
};
