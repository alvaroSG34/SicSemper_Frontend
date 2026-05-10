"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParticipantStore } from "@/presentation/stores";

export const useParticipantUploadEventContext = (eventId: string) => {
  const normalizedEventId = eventId.trim();
  const selectedEvent = useParticipantStore((state) => state.selectedEvent);
  const eventCategories = useParticipantStore((state) => state.eventCategories);
  const subcategoriesByCategory = useParticipantStore((state) => state.subcategoriesByCategory);
  const exploreEvents = useParticipantStore((state) => state.exploreEvents);
  const scales = useParticipantStore((state) => state.scales);
  const flowError = useParticipantStore((state) => state.flowError);
  const selectEvent = useParticipantStore((state) => state.selectEvent);
  const loadExploreEvents = useParticipantStore((state) => state.loadExploreEvents);

  const eventReady = selectedEvent?.id === normalizedEventId;
  const requestedEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (scales.length > 0) {
      return;
    }

    void loadExploreEvents();
  }, [loadExploreEvents, scales.length]);

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
    loading: !eventReady && !flowError,
    error: eventReady ? null : flowError,
  };
};
