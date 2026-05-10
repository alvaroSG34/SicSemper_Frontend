"use client";

import { ParticipantEventsExplorer } from "./participant-events-explorer";
import { useParticipantEvents } from "./use-participant-events";

type ParticipantEventsSectionProps = {
  onStartUpload: (eventId: string) => void;
  onGoToMyModelsByEvent: (eventId: string) => void;
  onOpenParticipantsByEvent: (eventId: string) => void;
};

export function ParticipantEventsSection({
  onStartUpload,
  onGoToMyModelsByEvent,
  onOpenParticipantsByEvent,
}: ParticipantEventsSectionProps) {
  const {
    exploreEvents,
    pastEvents,
    selectedEvent,
    categoriesByEventId,
    categoriesLoadingByEventId,
    categoriesErrorByEventId,
    loading,
    registeredEventIdSet,
    registeredEventIdsLoading,
    loadEventCategoriesForDetail,
    handleStartUpload,
  } = useParticipantEvents({ onStartUpload });

  return (
    <section className="grid w-full grid-cols-1 gap-5">
      <ParticipantEventsExplorer
        events={exploreEvents}
        pastEvents={pastEvents}
        selectedEventId={selectedEvent?.id ?? null}
        loading={loading}
        categoriesByEventId={categoriesByEventId}
        categoriesLoadingByEventId={categoriesLoadingByEventId}
        categoriesErrorByEventId={categoriesErrorByEventId}
        registeredEventIdSet={registeredEventIdSet}
        registeredEventIdsLoading={registeredEventIdsLoading}
        onLoadEventCategories={loadEventCategoriesForDetail}
        onStartUpload={handleStartUpload}
        onGoToMyModelsByEvent={onGoToMyModelsByEvent}
        onOpenParticipantsByEvent={onOpenParticipantsByEvent}
      />
    </section>
  );
}
