import { useEffect, useMemo, useState } from "react";
import { useParticipantResultsSlice } from "@/presentation/stores/participant-results.slice";

export const useParticipantResults = () => {
  const {
    exploreEvents,
    selectedEvent,
    eventCategories,
    subcategoriesByCategory,
    categoriesByEventId,
    categoriesLoadingByEventId,
    categoriesErrorByEventId,
    scales,
    flowLoading,
    flowError,
    flowSuccessMessage,
    selectEvent,
    loadEventCategoriesForDetail,
    submitModel,
  } = useParticipantResultsSlice();

  const [isSelectedEventModalOpen, setIsSelectedEventModalOpen] = useState(false);

  useEffect(() => {
    if (selectedEvent || exploreEvents.length === 0) {
      return;
    }

    void selectEvent(exploreEvents[0].id);
  }, [exploreEvents, selectEvent, selectedEvent]);

  const selectedEventCategoryGroups = useMemo(
    () => (selectedEvent ? categoriesByEventId[selectedEvent.id] ?? [] : []),
    [categoriesByEventId, selectedEvent],
  );
  const selectedEventHasLoadedCategories = useMemo(
    () => (selectedEvent ? selectedEvent.id in categoriesByEventId : false),
    [categoriesByEventId, selectedEvent],
  );
  const selectedEventCategoriesLoading = useMemo(
    () => (selectedEvent ? categoriesLoadingByEventId[selectedEvent.id] ?? false : false),
    [categoriesLoadingByEventId, selectedEvent],
  );
  const selectedEventCategoriesError = useMemo(
    () => (selectedEvent ? categoriesErrorByEventId[selectedEvent.id] ?? null : null),
    [categoriesErrorByEventId, selectedEvent],
  );

  const handleSelectEvent = (eventId: string) => {
    if (!eventId) {
      return;
    }

    setIsSelectedEventModalOpen(false);
    void selectEvent(eventId);
  };

  return {
    exploreEvents,
    selectedEvent,
    eventCategories,
    subcategoriesByCategory,
    scales,
    flowLoading,
    flowError,
    flowSuccessMessage,
    loadEventCategoriesForDetail,
    submitModel,
    handleSelectEvent,
    isSelectedEventModalOpen,
    setIsSelectedEventModalOpen,
    selectedEventCategoryGroups,
    selectedEventHasLoadedCategories,
    selectedEventCategoriesLoading,
    selectedEventCategoriesError,
  };
};
