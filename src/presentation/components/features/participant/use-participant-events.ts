import { useParticipantEventsSlice } from "@/presentation/stores/participant-events.slice";

type UseParticipantEventsParams = {
  onGoToResults: () => void;
};

export const useParticipantEvents = ({ onGoToResults }: UseParticipantEventsParams) => {
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

  const handleStartUpload = async (eventId: string) => {
    const wasSelected = await selectEvent(eventId);
    if (wasSelected) {
      onGoToResults();
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
    loadEventCategoriesForDetail,
    handleStartUpload,
  };
};
