import { useEffect, useState } from "react";
import { participantService } from "@/application/participant/participant.service";
import type { ParticipantScale, ParticipantShowcaseScaleGroup } from "@/domain/participant/participant.types";

type UseParticipantShowcaseScalesInput = {
  eventId: string;
  finalCategoryId: string;
};

export const useParticipantShowcaseScales = ({
  eventId,
  finalCategoryId,
}: UseParticipantShowcaseScalesInput) => {
  const [scales, setScales] = useState<ParticipantScale[]>([]);
  const [scaleGroups, setScaleGroups] = useState<ParticipantShowcaseScaleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const [fetchedScales, fetchedGroups] = await Promise.all([
          participantService.getScalesForEventCategory(eventId, finalCategoryId),
          participantService.getScaleGroupsForEventCategory(eventId, finalCategoryId)
        ]);

        if (!cancelled) {
          setScales(fetchedScales);
          setScaleGroups(fetchedGroups);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudieron cargar las escalas y grupos.",
          );
          setScales([]);
          setScaleGroups([]);
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
    scaleGroups,
    loading,
    error,
  };
};

