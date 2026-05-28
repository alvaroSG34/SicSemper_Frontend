import { useParticipantEventsSlice } from "@/presentation/stores/participant-events.slice";
import { participantService } from "@/application/participant/participant.service";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ParticipantEventDetail } from "@/domain/participant/participant.types";

type UseParticipantEventsParams = {
  onStartUpload: (eventId: string) => void;
};

export const useParticipantEvents = ({ onStartUpload }: UseParticipantEventsParams) => {
  const {
    exploreEvents,
    selectedEvent,
    categoriesByEventId,
    categoriesLoadingByEventId,
    categoriesErrorByEventId,
    flowLoading,
    loadExploreEvents,
    selectEvent,
    loadEventCategoriesForDetail,
  } = useParticipantEventsSlice();
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [registeredEventIdsLoading, setRegisteredEventIdsLoading] = useState(true);
  const [registeredPastEvents, setRegisteredPastEvents] = useState<ParticipantEventDetail[]>([]);

  const loadRegisteredEvents = useCallback(async () => {
    setRegisteredEventIdsLoading(true);
    try {
      const response = await participantService.getMyRegisteredEventIds();
      setRegisteredEventIds(response.eventIds);

      if (response.eventIds.length === 0) {
        setRegisteredPastEvents([]);
        return;
      }

      const now = Date.now();
      const detailedEvents = await Promise.all(
        response.eventIds.map(async (eventId) => {
          try {
            return await participantService.getEventDetailForParticipant(eventId);
          } catch {
            return null;
          }
        }),
      );

      const pastEvents = detailedEvents
        .filter((event): event is ParticipantEventDetail => Boolean(event))
        .filter((event) => {
          const endDateTime = new Date(event.endDate).getTime();
          return Number.isFinite(endDateTime) && endDateTime < now;
        })
        .sort((left, right) => new Date(right.endDate).getTime() - new Date(left.endDate).getTime());

      setRegisteredPastEvents(pastEvents);
    } catch {
      setRegisteredEventIds([]);
      setRegisteredPastEvents([]);
    } finally {
      setRegisteredEventIdsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRegisteredEvents();
  }, [loadRegisteredEvents]);

  const registeredEventIdSet = useMemo(
    () => new Set(registeredEventIds),
    [registeredEventIds],
  );

  const handleStartUpload = async (eventId: string) => {
    const wasSelected = await selectEvent(eventId);
    if (wasSelected) {
      onStartUpload(eventId);
    }
    return wasSelected;
  };

  const refreshEvents = useCallback(async () => {
    await Promise.all([
      loadExploreEvents({ force: true }),
      loadRegisteredEvents(),
    ]);
  }, [loadExploreEvents, loadRegisteredEvents]);

  return {
    exploreEvents,
    selectedEvent,
    categoriesByEventId,
    categoriesLoadingByEventId,
    categoriesErrorByEventId,
    loading: flowLoading && exploreEvents.length === 0,
    pastEvents: registeredPastEvents,
    registeredEventIdSet,
    registeredEventIdsLoading,
    loadEventCategoriesForDetail,
    handleStartUpload,
    refreshEvents,
  };
};
