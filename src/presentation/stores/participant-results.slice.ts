import type {
  ParticipantCategoryOption,
  ParticipantEventAllowedCategoryGroup,
  ParticipantEventDetail,
  ParticipantScale,
  ParticipantSubcategoryOption,
} from "@/domain/participant/participant.types";
import { useParticipantStore } from "./participant.store";

export type ParticipantResultsSlice = {
  exploreEvents: ParticipantEventDetail[];
  selectedEvent: ParticipantEventDetail | null;
  eventCategories: ParticipantCategoryOption[];
  subcategoriesByCategory: Record<string, ParticipantSubcategoryOption[]>;
  categoriesByEventId: Record<string, ParticipantEventAllowedCategoryGroup[]>;
  categoriesLoadingByEventId: Record<string, boolean>;
  categoriesErrorByEventId: Record<string, string | null>;
  scales: ParticipantScale[];
  flowLoading: boolean;
  flowError: string | null;
  flowSuccessMessage: string | null;
  selectEvent: (eventId: string) => Promise<boolean>;
  loadEventCategoriesForDetail: (eventId: string) => Promise<void>;
  submitModel: (payload: {
    userId: string;
    eventId: string;
    categoryId: string;
    subcategoryId: string;
    nombreModelo: string;
    marca: string;
    descripcion?: string;
    escalaId: string;
    files: File[];
  }) => Promise<boolean>;
};

export const useParticipantResultsSlice = (): ParticipantResultsSlice => {
  const exploreEvents = useParticipantStore((state) => state.exploreEvents);
  const selectedEvent = useParticipantStore((state) => state.selectedEvent);
  const eventCategories = useParticipantStore((state) => state.eventCategories);
  const subcategoriesByCategory = useParticipantStore((state) => state.subcategoriesByCategory);
  const categoriesByEventId = useParticipantStore((state) => state.categoriesByEventId);
  const categoriesLoadingByEventId = useParticipantStore((state) => state.categoriesLoadingByEventId);
  const categoriesErrorByEventId = useParticipantStore((state) => state.categoriesErrorByEventId);
  const scales = useParticipantStore((state) => state.scales);
  const flowLoading = useParticipantStore((state) => state.flowLoading);
  const flowError = useParticipantStore((state) => state.flowError);
  const flowSuccessMessage = useParticipantStore((state) => state.flowSuccessMessage);
  const selectEvent = useParticipantStore((state) => state.selectEvent);
  const loadEventCategoriesForDetail = useParticipantStore((state) => state.loadEventCategoriesForDetail);
  const submitModel = useParticipantStore((state) => state.submitModel);

  return {
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
  };
};
