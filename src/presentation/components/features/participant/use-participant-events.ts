import { useParticipantEventsSlice } from "@/presentation/stores/participant-events.slice";
import { participantService } from "@/application/participant/participant.service";
import { useEffect, useMemo, useState } from "react";
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
    selectEvent,
    loadEventCategoriesForDetail,
  } = useParticipantEventsSlice();
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [registeredEventIdsLoading, setRegisteredEventIdsLoading] = useState(false);
  const [registeredPastEvents, setRegisteredPastEvents] = useState<ParticipantEventDetail[]>([]);

  useEffect(() => {
    let alive = true;
    setRegisteredEventIdsLoading(true);

    void participantService
      .getMyRegisteredEventIds()
      .then((response) => {
        if (!alive) {
          return;
        }
        setRegisteredEventIds(response.eventIds);

        if (response.eventIds.length === 0) {
          setRegisteredPastEvents([]);
          return;
        }

        void Promise.all(
          response.eventIds.map((eventId) => participantService.getEventDetailForParticipant(eventId)),
        )
          .then((events) => {
            if (!alive) {
              return;
            }

            const now = Date.now();
            const pastEvents = events
              .filter((event): event is ParticipantEventDetail => Boolean(event))
              .filter((event) => {
                const endDateTime = new Date(event.endDate).getTime();
                return Number.isFinite(endDateTime) && endDateTime < now;
              })
              .sort((left, right) => new Date(right.endDate).getTime() - new Date(left.endDate).getTime());

            setRegisteredPastEvents(pastEvents);
          })
          .catch(() => {
            if (!alive) {
              return;
            }
            setRegisteredPastEvents([]);
          });
      })
      .catch(() => {
        if (!alive) {
          return;
        }
        setRegisteredEventIds([]);
        setRegisteredPastEvents([]);
      })
      .finally(() => {
        if (!alive) {
          return;
        }
        setRegisteredEventIdsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

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
  };
};
