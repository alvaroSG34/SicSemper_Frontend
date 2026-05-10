"use client";

import { useEffect, useMemo, useState } from "react";
import { participantService } from "@/application/participant/participant.service";

export const useParticipantShowcaseCategoryAvailability = (eventId: string) => {
  const normalizedEventId = eventId.trim();
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!normalizedEventId) {
      setCategoryIds([]);
      setLoading(false);
      setError(null);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);

    void participantService
      .getEventCategoryIdsWithModels(normalizedEventId)
      .then((response) => {
        if (!alive) {
          return;
        }
        setCategoryIds(response.categoryIds);
      })
      .catch((reason: unknown) => {
        if (!alive) {
          return;
        }
        setCategoryIds([]);
        setError(reason instanceof Error ? reason.message : "No se pudo validar categorias.");
      })
      .finally(() => {
        if (!alive) {
          return;
        }
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [normalizedEventId]);

  const categoryIdSet = useMemo(() => new Set(categoryIds), [categoryIds]);

  return {
    categoryIdSet,
    loading,
    error,
  };
};

