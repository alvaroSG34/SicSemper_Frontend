"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ParticipantScale } from "@/domain/participant/participant.types";
import { participantService } from "@/application/participant/participant.service";
import { useParticipantStore } from "@/presentation/stores";

export const useParticipantUploadEventContext = (
  eventId: string,
  finalCategoryId?: string,
) => {
  const normalizedEventId = eventId.trim();
  const normalizedFinalCategoryId = finalCategoryId?.trim() ?? "";
  const selectedEvent = useParticipantStore((state) => state.selectedEvent);
  const eventCategories = useParticipantStore((state) => state.eventCategories);
  const subcategoriesByCategory = useParticipantStore((state) => state.subcategoriesByCategory);
  const exploreEvents = useParticipantStore((state) => state.exploreEvents);
  const flowError = useParticipantStore((state) => state.flowError);
  const selectEvent = useParticipantStore((state) => state.selectEvent);
  const loadExploreEvents = useParticipantStore((state) => state.loadExploreEvents);
  const [scales, setScales] = useState<ParticipantScale[]>([]);
  const [scalesLoading, setScalesLoading] = useState(false);
  const [scalesError, setScalesError] = useState<string | null>(null);

  const eventReady = selectedEvent?.id === normalizedEventId;
  const requestedEventIdRef = useRef<string | null>(null);
  const requestedScaleContextRef = useRef<string | null>(null);

  useEffect(() => {
    void loadExploreEvents();
  }, [loadExploreEvents]);

  useEffect(() => {
    if (!normalizedEventId) {
      return;
    }

    if (eventReady) {
      requestedEventIdRef.current = normalizedEventId;
      return;
    }

    if (requestedEventIdRef.current === normalizedEventId) {
      return;
    }

    requestedEventIdRef.current = normalizedEventId;
    void selectEvent(normalizedEventId);
  }, [eventReady, normalizedEventId, selectEvent]);

  useEffect(() => {
    if (!eventReady || !normalizedFinalCategoryId) {
      return;
    }

    const contextKey = `${normalizedEventId}::${normalizedFinalCategoryId}`;
    if (requestedScaleContextRef.current === contextKey) {
      return;
    }
    requestedScaleContextRef.current = contextKey;
    setScalesLoading(true);
    setScalesError(null);

    void participantService
      .getScalesForEventCategory(normalizedEventId, normalizedFinalCategoryId)
      .then((response) => {
        setScales(response);
      })
      .catch((error: unknown) => {
        setScalesError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las escalas permitidas.",
        );
        setScales([]);
      })
      .finally(() => {
        setScalesLoading(false);
      });
  }, [eventReady, normalizedEventId, normalizedFinalCategoryId]);

  const eventName = useMemo(() => {
    if (selectedEvent?.id === normalizedEventId) {
      return selectedEvent.name;
    }
    return (
      exploreEvents.find((event) => event.id === normalizedEventId)?.name ??
      "Evento"
    );
  }, [exploreEvents, normalizedEventId, selectedEvent]);

  return {
    eventId: normalizedEventId,
    eventReady,
    eventName,
    eventCategories,
    subcategoriesByCategory,
    scales,
    loading: (!eventReady && !flowError) || scalesLoading,
    error: eventReady ? scalesError : flowError,
  };
};
