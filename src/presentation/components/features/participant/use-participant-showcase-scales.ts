import { useEffect, useState } from "react";
import { participantService } from "@/application/participant/participant.service";
import type { ParticipantScale } from "@/domain/participant/participant.types";

type UseParticipantShowcaseScalesInput = {
  eventId: string;
  finalCategoryId: string;
};

export const useParticipantShowcaseScales = ({
  eventId,
  finalCategoryId,
}: UseParticipantShowcaseScalesInput) => {
  const [scales, setScales] = useState<ParticipantScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await participantService.getScalesForEventCategory(
          eventId,
          finalCategoryId,
        );
        if (!cancelled) {
          setScales(response);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudieron cargar las escalas.",
          );
          setScales([]);
        }
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
  }, [eventId, finalCategoryId]);

  return {
    scales,
    loading,
    error,
  };
};

