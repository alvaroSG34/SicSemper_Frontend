import { create } from "zustand";
import { participantService } from "@/application/participant/participant.service";
import type {
  CreateParticipantModelPayload,
  ParticipantCategoryOption,
  ParticipantDashboardData,
  ParticipantEventDetail,
  ParticipantModel,
  ParticipantScale,
  ParticipantSubcategoryOption,
  ParticipantUploadImageInput,
} from "@/domain/participant/participant.types";

type ParticipantStoreState = {
  dashboard: ParticipantDashboardData | null;
  loading: boolean;
  error: string | null;
  exploreEvents: ParticipantEventDetail[];
  selectedEvent: ParticipantEventDetail | null;
  eventCategories: ParticipantCategoryOption[];
  subcategoriesByCategory: Record<string, ParticipantSubcategoryOption[]>;
  scales: ParticipantScale[];
  myModels: ParticipantModel[];
  flowLoading: boolean;
  flowError: string | null;
  flowSuccessMessage: string | null;
  loadDashboard: (userId?: string) => Promise<void>;
  loadExploreEvents: () => Promise<void>;
  selectEvent: (eventId: string) => Promise<void>;
  submitModel: (payload: {
    userId: string;
    eventId: string;
    categoryId: string;
    subcategoryId: string;
    nombre: string;
    modelo: string;
    marca: string;
    descripcion?: string;
    escalaId: string;
    images: ParticipantUploadImageInput[];
  }) => Promise<boolean>;
  loadMyModels: (userId: string) => Promise<void>;
  clearError: () => void;
  clearFlowState: () => void;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado al cargar el dashboard de participante.";
};

export const useParticipantStore = create<ParticipantStoreState>((set) => ({
  dashboard: null,
  loading: false,
  error: null,
  exploreEvents: [],
  selectedEvent: null,
  eventCategories: [],
  subcategoriesByCategory: {},
  scales: [],
  myModels: [],
  flowLoading: false,
  flowError: null,
  flowSuccessMessage: null,
  loadDashboard: async (userId) => {
    set({ loading: true, error: null });

    try {
      const dashboard = await participantService.getDashboardData(userId);
      set({
        dashboard,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error: getErrorMessage(error),
      });
    }
  },
  loadExploreEvents: async () => {
    set({ flowLoading: true, flowError: null, flowSuccessMessage: null });

    try {
      const [events, scales] = await Promise.all([
        participantService.getUpcomingEvents(),
        participantService.getScales(),
      ]);

      set((state) => ({
        exploreEvents: events,
        scales,
        selectedEvent:
          state.selectedEvent && events.some((event) => event.id === state.selectedEvent?.id)
            ? state.selectedEvent
            : null,
        flowLoading: false,
        flowError: null,
      }));
    } catch (error) {
      set({
        flowLoading: false,
        flowError: getErrorMessage(error),
      });
    }
  },
  selectEvent: async (eventId) => {
    set({
      flowLoading: true,
      flowError: null,
      flowSuccessMessage: null,
      selectedEvent: null,
      eventCategories: [],
      subcategoriesByCategory: {},
    });

    try {
      const event = await participantService.getEventDetailForParticipant(eventId);
      if (!event) {
        throw new Error("No se encontro el evento seleccionado.");
      }

      const categories = await participantService.getCategoriesForEvent(event.id);
      const subcategoriesByCategoryEntries = await Promise.all(
        categories.map(async (category) => [
          category.id,
          await participantService.getSubcategoriesForCategory(category.id, event.id),
        ] as const),
      );

      set({
        selectedEvent: event,
        eventCategories: categories,
        subcategoriesByCategory: Object.fromEntries(subcategoriesByCategoryEntries),
        flowLoading: false,
        flowError: null,
      });
    } catch (error) {
      set({
        flowLoading: false,
        flowError: getErrorMessage(error),
      });
    }
  },
  submitModel: async (payload) => {
    set({ flowLoading: true, flowError: null, flowSuccessMessage: null });

    try {
      const requestPayload: CreateParticipantModelPayload = {
        userId: payload.userId,
        eventId: payload.eventId,
        categoryId: payload.categoryId,
        subcategoryId: payload.subcategoryId,
        usuarioEventoCategoriaId: `open-${payload.userId}-${payload.eventId}-${payload.categoryId}`,
        nombre: payload.nombre,
        modelo: payload.modelo,
        marca: payload.marca,
        descripcion: payload.descripcion,
        escalaId: payload.escalaId,
        images: payload.images,
      };

      const createdModel = await participantService.createModelSubmission(requestPayload);
      const myModels = await participantService.getMyModels(payload.userId);

      set({
        flowLoading: false,
        flowError: null,
        flowSuccessMessage: `Maqueta ${createdModel.nombre} enviada correctamente.`,
        myModels,
      });
      return true;
    } catch (error) {
      set({
        flowLoading: false,
        flowError: getErrorMessage(error),
        flowSuccessMessage: null,
      });
      return false;
    }
  },
  loadMyModels: async (userId) => {
    try {
      const myModels = await participantService.getMyModels(userId);
      set({
        myModels,
      });
    } catch (error) {
      set({
        flowError: getErrorMessage(error),
      });
    }
  },
  clearError: () => set({ error: null }),
  clearFlowState: () => set({ flowError: null, flowSuccessMessage: null }),
}));
