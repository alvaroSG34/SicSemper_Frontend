import { create } from "zustand";
import { participantService } from "@/application/participant/participant.service";
import type {
  CreateParticipantModelPayload,
  ParticipantCategoryOption,
  ParticipantDashboardData,
  ParticipantEventAllowedCategoryGroup,
  ParticipantEventDetail,
  ParticipantModel,
  ParticipantScale,
  ParticipantSubcategoryOption,
} from "@/domain/participant/participant.types";

type ParticipantStoreState = {
  dashboard: ParticipantDashboardData | null;
  loading: boolean;
  error: string | null;
  exploreEvents: ParticipantEventDetail[];
  selectedEvent: ParticipantEventDetail | null;
  eventCategories: ParticipantCategoryOption[];
  subcategoriesByCategory: Record<string, ParticipantSubcategoryOption[]>;
  categoriesByEventId: Record<string, ParticipantEventAllowedCategoryGroup[]>;
  categoriesLoadingByEventId: Record<string, boolean>;
  categoriesErrorByEventId: Record<string, string | null>;
  scales: ParticipantScale[];
  myModels: ParticipantModel[];
  myModelsLoading: boolean;
  flowLoading: boolean;
  flowError: string | null;
  flowSuccessMessage: string | null;
  loadDashboard: (userId?: string) => Promise<void>;
  loadExploreEvents: () => Promise<void>;
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
  loadMyModels: (userId: string) => Promise<void>;
  clearError: () => void;
  clearFlowState: () => void;
};

type ExplorePayload = {
  events: ParticipantEventDetail[];
};

let dashboardRequest: Promise<ParticipantDashboardData> | null = null;
let exploreRequest: Promise<ExplorePayload> | null = null;
const myModelsRequests = new Map<string, Promise<ParticipantModel[]>>();
const detailCategoriesRequests = new Map<string, Promise<ParticipantEventAllowedCategoryGroup[]>>();

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado al cargar el dashboard de participante.";
};

const loadSubcategoriesByCategory = async (
  eventId: string,
  rootCategories: ParticipantCategoryOption[],
) => {
  const map: Record<string, ParticipantSubcategoryOption[]> = {};
  const visited = new Set<string>();
  const queue = rootCategories.map((category) => category.id);

  while (queue.length > 0) {
    const parentId = queue.shift();
    if (!parentId || visited.has(parentId)) {
      continue;
    }

    visited.add(parentId);
    const children = await participantService.getSubcategoriesForCategory(
      parentId,
      eventId,
    );
    map[parentId] = children;

    for (const child of children) {
      if (!visited.has(child.id)) {
        queue.push(child.id);
      }
    }
  }

  return map;
};

const collectLeafDescendants = (
  rootCategoryId: string,
  subcategoriesByCategory: Record<string, ParticipantSubcategoryOption[]>,
): ParticipantSubcategoryOption[] => {
  const leaves: ParticipantSubcategoryOption[] = [];
  const queue = [...(subcategoriesByCategory[rootCategoryId] ?? [])];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const children = subcategoriesByCategory[current.id] ?? [];
    if (children.length === 0) {
      leaves.push(current);
      continue;
    }

    queue.push(...children);
  }

  return leaves;
};

export const useParticipantStore = create<ParticipantStoreState>((set, get) => ({
  dashboard: null,
  loading: false,
  error: null,
  exploreEvents: [],
  selectedEvent: null,
  eventCategories: [],
  subcategoriesByCategory: {},
  categoriesByEventId: {},
  categoriesLoadingByEventId: {},
  categoriesErrorByEventId: {},
  scales: [],
  myModels: [],
  myModelsLoading: false,
  flowLoading: false,
  flowError: null,
  flowSuccessMessage: null,
  loadDashboard: async (userId) => {
    if (!dashboardRequest) {
      set({ loading: true, error: null });
      dashboardRequest = participantService.getDashboardData(userId);
    }

    const request = dashboardRequest;

    try {
      const dashboard = await request;
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
    } finally {
      if (dashboardRequest === request) {
        dashboardRequest = null;
      }
    }
  },
  loadExploreEvents: async () => {
    const state = get();

    if (state.exploreEvents.length > 0) {
      return;
    }

    if (!exploreRequest) {
      set({ flowLoading: true, flowError: null, flowSuccessMessage: null });
      exploreRequest = participantService
        .getUpcomingEvents()
        .then((events) => ({ events }));
    }

    const request = exploreRequest;

    try {
      const { events } = await request;

      set((currentState) => ({
        exploreEvents: events,
        selectedEvent:
          currentState.selectedEvent && events.some((event) => event.id === currentState.selectedEvent?.id)
            ? currentState.selectedEvent
            : null,
        flowLoading: false,
        flowError: null,
      }));
    } catch (error) {
      set({
        flowLoading: false,
        flowError: getErrorMessage(error),
      });
    } finally {
      if (exploreRequest === request) {
        exploreRequest = null;
      }
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
      const subcategoriesByCategory = await loadSubcategoriesByCategory(
        event.id,
        categories,
      );

      set({
        selectedEvent: event,
        eventCategories: categories,
        subcategoriesByCategory,
        flowLoading: false,
        flowError: null,
      });

      return true;
    } catch (error) {
      set({
        flowLoading: false,
        flowError: getErrorMessage(error),
      });

      return false;
    }
  },
  loadEventCategoriesForDetail: async (eventId) => {
    const normalizedEventId = eventId.trim();
    if (!normalizedEventId) {
      return;
    }

    const state = get();
    if (state.categoriesByEventId[normalizedEventId]) {
      return;
    }

    const existingRequest = detailCategoriesRequests.get(normalizedEventId);
    const request =
      existingRequest ??
      (async () => {
        const categories = await participantService.getCategoriesForEvent(normalizedEventId);
        const subcategoriesByCategory = await loadSubcategoriesByCategory(
          normalizedEventId,
          categories,
        );
        const grouped = categories.map((category) => ({
          category,
          subcategories: collectLeafDescendants(
            category.id,
            subcategoriesByCategory,
          ),
        }));
        return grouped;
      })();

    if (!existingRequest) {
      detailCategoriesRequests.set(normalizedEventId, request);
      set((currentState) => ({
        categoriesLoadingByEventId: {
          ...currentState.categoriesLoadingByEventId,
          [normalizedEventId]: true,
        },
        categoriesErrorByEventId: {
          ...currentState.categoriesErrorByEventId,
          [normalizedEventId]: null,
        },
      }));
    }

    try {
      const groupedCategories = await request;
      set((currentState) => ({
        categoriesByEventId: {
          ...currentState.categoriesByEventId,
          [normalizedEventId]: groupedCategories,
        },
        categoriesLoadingByEventId: {
          ...currentState.categoriesLoadingByEventId,
          [normalizedEventId]: false,
        },
        categoriesErrorByEventId: {
          ...currentState.categoriesErrorByEventId,
          [normalizedEventId]: null,
        },
      }));
    } catch (error) {
      set((currentState) => ({
        categoriesLoadingByEventId: {
          ...currentState.categoriesLoadingByEventId,
          [normalizedEventId]: false,
        },
        categoriesErrorByEventId: {
          ...currentState.categoriesErrorByEventId,
          [normalizedEventId]: getErrorMessage(error),
        },
      }));
    } finally {
      if (detailCategoriesRequests.get(normalizedEventId) === request) {
        detailCategoriesRequests.delete(normalizedEventId);
      }
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
        nombreModelo: payload.nombreModelo,
        marca: payload.marca,
        descripcion: payload.descripcion,
        escalaId: payload.escalaId,
        files:
          payload.files.length > 0
            ? await Promise.all(
                payload.files.map((file) => participantService.uploadModelFile(file)),
              )
            : [],
      };

      const createdModel = await participantService.createModelSubmission(requestPayload);
      const myModels = await participantService.getMyModels(payload.userId);

      set({
        flowLoading: false,
        flowError: null,
        flowSuccessMessage: `Maqueta ${createdModel.nombreModelo} enviada correctamente.`,
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
    if (!userId.trim()) {
      return;
    }

    const existingRequest = myModelsRequests.get(userId);
    const request = existingRequest ?? participantService.getMyModels(userId);

    if (!existingRequest) {
      myModelsRequests.set(userId, request);
      set({
        myModelsLoading: true,
        flowError: null,
      });
    }

    try {
      const myModels = await request;
      set({
        myModels,
        myModelsLoading: false,
      });
    } catch (error) {
      set({
        myModelsLoading: false,
        flowError: getErrorMessage(error),
      });
    } finally {
      if (myModelsRequests.get(userId) === request) {
        myModelsRequests.delete(userId);
      }
    }
  },
  clearError: () => set({ error: null }),
  clearFlowState: () => set({ flowError: null, flowSuccessMessage: null }),
}));

