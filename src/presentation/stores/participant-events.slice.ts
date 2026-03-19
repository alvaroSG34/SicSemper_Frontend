import type {
  ParticipantEventAllowedCategoryGroup,
  ParticipantEventDetail,
} from "@/domain/participant/participant.types";
import { useParticipantStore } from "./participant.store";

export type ParticipantEventsSlice = {
  exploreEvents: ParticipantEventDetail[];
  selectedEvent: ParticipantEventDetail | null;
  categoriesByEventId: Record<string, ParticipantEventAllowedCategoryGroup[]>;
  categoriesLoadingByEventId: Record<string, boolean>;
  categoriesErrorByEventId: Record<string, string | null>;
  flowLoading: boolean;
  selectEvent: (eventId: string) => Promise<boolean>;
  loadEventCategoriesForDetail: (eventId: string) => Promise<void>;
};

export const useParticipantEventsSlice = (): ParticipantEventsSlice => {
  const exploreEvents = useParticipantStore((state) => state.exploreEvents);
  const selectedEvent = useParticipantStore((state) => state.selectedEvent);
  const categoriesByEventId = useParticipantStore((state) => state.categoriesByEventId);
  const categoriesLoadingByEventId = useParticipantStore((state) => state.categoriesLoadingByEventId);
  const categoriesErrorByEventId = useParticipantStore((state) => state.categoriesErrorByEventId);
  const flowLoading = useParticipantStore((state) => state.flowLoading);
  const selectEvent = useParticipantStore((state) => state.selectEvent);
  const loadEventCategoriesForDetail = useParticipantStore((state) => state.loadEventCategoriesForDetail);

  return {
    exploreEvents,
    selectedEvent,
    categoriesByEventId,
    categoriesLoadingByEventId,
    categoriesErrorByEventId,
    flowLoading,
    selectEvent,
    loadEventCategoriesForDetail,
  };
};
