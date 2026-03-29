"use client";

import { ParticipantEventsExplorer } from "./participant-events-explorer";
import { useParticipantEvents } from "./use-participant-events";

type ParticipantEventsSectionProps = {
  onGoToResults: () => void;
  onGoToMyModelsByEvent: (eventId: string) => void;
};

export function ParticipantEventsSection({ onGoToResults, onGoToMyModelsByEvent }: ParticipantEventsSectionProps) {
  const {
    exploreEvents,
    selectedEvent,
    categoriesByEventId,
    categoriesLoadingByEventId,
    categoriesErrorByEventId,
    loading,
    loadEventCategoriesForDetail,
    handleStartUpload,
  } = useParticipantEvents({ onGoToResults });

  return (
    <section className="grid w-full grid-cols-1 gap-5">
      <ParticipantEventsExplorer
        events={exploreEvents}
        selectedEventId={selectedEvent?.id ?? null}
        loading={loading}
        categoriesByEventId={categoriesByEventId}
        categoriesLoadingByEventId={categoriesLoadingByEventId}
        categoriesErrorByEventId={categoriesErrorByEventId}
        onLoadEventCategories={loadEventCategoriesForDetail}
        onStartUpload={handleStartUpload}
        onGoToMyModelsByEvent={onGoToMyModelsByEvent}
      />
    </section>
  );
}
