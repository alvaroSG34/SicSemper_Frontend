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
  ParticipantShowcaseTreeResponse,
  ParticipantSubcategoryOption,
} from "@/domain/participant/participant.types";

type EnsureSubcategoryBranchesInput = {
  eventId: string;
  parentCategoryIds: string[];
  purpose?: "default" | "upload";
  force?: boolean;
};

type ParticipantStoreState = {
  dashboard: ParticipantDashboardData | null;
  loading: boolean;
  error: string | null;
  exploreEvents: ParticipantEventDetail[];
  selectedEvent: ParticipantEventDetail | null;
  selectedEventSubcategoryPurpose: "default" | "upload";
  eventCategories: ParticipantCategoryOption[];
  subcategoriesByCategory: Record<string, ParticipantSubcategoryOption[]>;
  subcategoryBranchCacheByContext: Record<
    string,
    Record<string, ParticipantSubcategoryOption[]>
  >;
  subcategoryBranchLoadingByContext: Record<string, Record<string, boolean>>;
  subcategoryBranchErrorByContext: Record<string, Record<string, string | null>>;
  showcaseTreeByEventId: Record<string, ParticipantShowcaseTreeResponse>;
  showcaseTreeLoadingByEventId: Record<string, boolean>;
  showcaseTreeErrorByEventId: Record<string, string | null>;
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
  loadExploreEvents: (options?: { force?: boolean }) => Promise<void>;
  selectEvent: (
    eventId: string,
    subcategoryPurpose?: "default" | "upload",
  ) => Promise<boolean>;
  loadShowcaseTree: (eventId: string, options?: { force?: boolean }) => Promise<void>;
  ensureSubcategoryBranches: (
    input: EnsureSubcategoryBranchesInput,
  ) => Promise<void>;
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

type SubcategoryTreeLoadResult = {
  map: Record<string, ParticipantSubcategoryOption[]>;
  warning: string | null;
};

let dashboardRequest: Promise<ParticipantDashboardData> | null = null;
let exploreRequest: Promise<ExplorePayload> | null = null;
const myModelsRequests = new Map<string, Promise<ParticipantModel[]>>();
const detailCategoriesRequests = new Map<
  string,
  Promise<ParticipantEventAllowedCategoryGroup[]>
>();
const showcaseTreeRequests = new Map<string, Promise<ParticipantShowcaseTreeResponse>>();
const subcategoryBranchRequests = new Map<
  string,
  Promise<ParticipantSubcategoryOption[]>
>();
const SUBCATEGORY_REQUEST_TIMEOUT_MS = 12_000;
const EVENT_CONTEXT_REQUEST_TIMEOUT_MS = 12_000;
const SHOWCASE_TREE_REQUEST_TIMEOUT_MS = 12_000;

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado al cargar el dashboard de participante.";
};

const buildSubcategoryContextKey = (
  eventId: string,
  purpose: "default" | "upload",
) => `${eventId}::${purpose}`;

const buildSubcategoriesMapFromShowcaseTree = (
  tree: ParticipantShowcaseTreeResponse,
  rootCategories: ParticipantCategoryOption[],
): Record<string, ParticipantSubcategoryOption[]> => {
  const nodesById = new Map(tree.nodes.map((node) => [node.id, node]));
  const map: Record<string, ParticipantSubcategoryOption[]> = {};

  for (const rootCategory of rootCategories) {
    map[rootCategory.id] = [];
  }

  for (const node of tree.nodes) {
    if (!Array.isArray(node.children) || node.children.length === 0) {
      if (!map[node.id]) {
        map[node.id] = [];
      }
      continue;
    }

    const children = node.children
      .map((childId) => nodesById.get(childId))
      .filter((child): child is NonNullable<typeof child> => Boolean(child))
      .map((child) => ({
        id: child.id,
        categoryId: node.id,
        name: child.name,
      }));

    map[node.id] = children;
  }

  return map;
};

const loadSubcategoriesByCategory = async (
  eventId: string,
  rootCategories: ParticipantCategoryOption[],
  subcategoryPurpose: "default" | "upload",
): Promise<SubcategoryTreeLoadResult> => {
  const map: Record<string, ParticipantSubcategoryOption[]> = {};
  const visited = new Set<string>();
  const failedParents: Array<{ parentId: string; reason: string }> = [];
  let currentLevel = rootCategories
    .map((category) => category.id)
    .filter((categoryId) => categoryId.trim().length > 0);

  while (currentLevel.length > 0) {
    const pendingParents = currentLevel.filter((parentId) => !visited.has(parentId));
    if (pendingParents.length === 0) {
      break;
    }

    pendingParents.forEach((parentId) => visited.add(parentId));

    const results = await Promise.all(
      pendingParents.map(async (parentId) => {
        try {
          const children = await withTimeout(
            participantService.getSubcategoriesForCategory(
              parentId,
              eventId,
              subcategoryPurpose === "upload" ? "upload" : undefined,
            ),
            SUBCATEGORY_REQUEST_TIMEOUT_MS,
            "Tiempo de espera agotado al cargar subcategorias.",
          );

          return { parentId, children };
        } catch (error) {
          const reason =
            error instanceof Error && error.message
              ? error.message
              : "No se pudieron cargar las subcategorias.";
          return { parentId, error: reason };
        }
      }),
    );

    const nextLevel: string[] = [];
    for (const result of results) {
      if ("error" in result) {
        const reason =
          typeof result.error === "string"
            ? result.error
            : "No se pudieron cargar las subcategorias.";
        failedParents.push({ parentId: result.parentId, reason });
        map[result.parentId] = [];
        continue;
      }

      map[result.parentId] = result.children;
      for (const child of result.children) {
        if (!visited.has(child.id)) {
          nextLevel.push(child.id);
        }
      }
    }

    currentLevel = nextLevel;
  }

  const warning =
    failedParents.length === 0
      ? null
      : `${failedParents.length === 1 ? "No se pudo cargar una rama de subcategorias." : `No se pudieron cargar ${failedParents.length} ramas de subcategorias.`} Reintenta para completar el arbol.`;

  return { map, warning };
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
  selectedEventSubcategoryPurpose: "default",
  eventCategories: [],
  subcategoriesByCategory: {},
  subcategoryBranchCacheByContext: {},
  subcategoryBranchLoadingByContext: {},
  subcategoryBranchErrorByContext: {},
  showcaseTreeByEventId: {},
  showcaseTreeLoadingByEventId: {},
  showcaseTreeErrorByEventId: {},
  categoriesByEventId: {},
  categoriesLoadingByEventId: {},
  categoriesErrorByEventId: {},
  scales: [],
  myModels: [],
  myModelsLoading: false,
  flowLoading: false,
  flowError: null,
  flowSuccessMessage: null,
  loadDashboard: async () => {
    if (!dashboardRequest) {
      set({ loading: true, error: null });
      dashboardRequest = participantService.getDashboardData();
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
  loadExploreEvents: async (options = {}) => {
    const { force = false } = options;
    const state = get();

    if (!force && state.exploreEvents.length > 0) {
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
          currentState.selectedEvent &&
          events.some((event) => event.id === currentState.selectedEvent?.id)
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
  selectEvent: async (eventId, subcategoryPurpose = "default") => {
    const normalizedEventId = eventId.trim();
    if (!normalizedEventId) {
      set({
        flowLoading: false,
        flowError: "No se encontro el evento seleccionado.",
      });
      return false;
    }

    set({
      flowLoading: true,
      flowError: null,
      flowSuccessMessage: null,
      selectedEvent: null,
      selectedEventSubcategoryPurpose: subcategoryPurpose,
      eventCategories: [],
      subcategoriesByCategory: {},
    });

    try {
      const [event, categories] = await Promise.all([
        withTimeout(
          participantService.getEventDetailForParticipant(normalizedEventId),
          EVENT_CONTEXT_REQUEST_TIMEOUT_MS,
          "Tiempo de espera agotado al cargar el evento.",
        ),
        withTimeout(
          participantService.getCategoriesForEvent(normalizedEventId),
          EVENT_CONTEXT_REQUEST_TIMEOUT_MS,
          "Tiempo de espera agotado al cargar las categorias del evento.",
        ),
      ]);

      if (!event) {
        throw new Error("No se encontro el evento seleccionado.");
      }

      const contextKey = buildSubcategoryContextKey(
        event.id,
        subcategoryPurpose,
      );
      const cachedBranches =
        get().subcategoryBranchCacheByContext[contextKey] ?? {};

      set({
        selectedEvent: event,
        selectedEventSubcategoryPurpose: subcategoryPurpose,
        eventCategories: categories,
        subcategoriesByCategory: cachedBranches,
      });

      if (subcategoryPurpose === "default") {
        await get().loadShowcaseTree(event.id);
        const tree = get().showcaseTreeByEventId[event.id];
        if (tree) {
          const mapFromTree = buildSubcategoriesMapFromShowcaseTree(tree, categories);
          set((currentState) => ({
            subcategoryBranchCacheByContext: {
              ...currentState.subcategoryBranchCacheByContext,
              [contextKey]: {
                ...(currentState.subcategoryBranchCacheByContext[contextKey] ?? {}),
                ...mapFromTree,
              },
            },
            subcategoriesByCategory: {
              ...(currentState.subcategoryBranchCacheByContext[contextKey] ?? {}),
              ...mapFromTree,
            },
          }));
        }

        set((currentState) => ({
          flowLoading: false,
          flowError: currentState.showcaseTreeErrorByEventId[event.id] ?? null,
        }));

        return true;
      }

      await get().ensureSubcategoryBranches({
        eventId: event.id,
        parentCategoryIds: categories.map((category) => category.id),
        purpose: "upload",
      });

      const rootBranchErrors = get().subcategoryBranchErrorByContext[contextKey] ?? {};
      const firstRootBranchError =
        categories
          .map((category) => rootBranchErrors[category.id])
          .find((message): message is string => Boolean(message && message.trim())) ??
        null;

      set({
        flowLoading: false,
        flowError: firstRootBranchError,
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
  loadShowcaseTree: async (eventId, options = {}) => {
    const normalizedEventId = eventId.trim();
    if (!normalizedEventId) {
      return;
    }

    const { force = false } = options;
    const state = get();
    if (!force && state.showcaseTreeByEventId[normalizedEventId]) {
      return;
    }

    const existingRequest = showcaseTreeRequests.get(normalizedEventId);
    const request =
      existingRequest ??
      withTimeout(
        participantService.getShowcaseTree(normalizedEventId),
        SHOWCASE_TREE_REQUEST_TIMEOUT_MS,
        "Tiempo de espera agotado al cargar el arbol de categorias.",
      );

    if (!existingRequest) {
      showcaseTreeRequests.set(normalizedEventId, request);
      set((currentState) => ({
        showcaseTreeLoadingByEventId: {
          ...currentState.showcaseTreeLoadingByEventId,
          [normalizedEventId]: true,
        },
        showcaseTreeErrorByEventId: {
          ...currentState.showcaseTreeErrorByEventId,
          [normalizedEventId]: null,
        },
      }));
    }

    try {
      const tree = await request;
      set((currentState) => ({
        showcaseTreeByEventId: {
          ...currentState.showcaseTreeByEventId,
          [normalizedEventId]: tree,
        },
        showcaseTreeLoadingByEventId: {
          ...currentState.showcaseTreeLoadingByEventId,
          [normalizedEventId]: false,
        },
        showcaseTreeErrorByEventId: {
          ...currentState.showcaseTreeErrorByEventId,
          [normalizedEventId]: null,
        },
      }));
    } catch (error) {
      set((currentState) => ({
        showcaseTreeLoadingByEventId: {
          ...currentState.showcaseTreeLoadingByEventId,
          [normalizedEventId]: false,
        },
        showcaseTreeErrorByEventId: {
          ...currentState.showcaseTreeErrorByEventId,
          [normalizedEventId]: getErrorMessage(error),
        },
      }));
    } finally {
      if (showcaseTreeRequests.get(normalizedEventId) === request) {
        showcaseTreeRequests.delete(normalizedEventId);
      }
    }
  },
  ensureSubcategoryBranches: async ({
    eventId,
    parentCategoryIds,
    purpose = "default",
    force = false,
  }) => {
    const normalizedEventId = eventId.trim();
    if (!normalizedEventId) {
      return;
    }

    const normalizedParentIds = Array.from(
      new Set(
        parentCategoryIds
          .map((parentId) => parentId.trim())
          .filter((parentId) => parentId.length > 0),
      ),
    );

    if (normalizedParentIds.length === 0) {
      return;
    }

    const contextKey = buildSubcategoryContextKey(normalizedEventId, purpose);
    const state = get();
    const contextCache = state.subcategoryBranchCacheByContext[contextKey] ?? {};
    const parentIdsToLoad = force
      ? normalizedParentIds
      : normalizedParentIds.filter((parentId) => !(parentId in contextCache));

    if (parentIdsToLoad.length === 0) {
      if (
        state.selectedEvent?.id === normalizedEventId &&
        state.selectedEventSubcategoryPurpose === purpose
      ) {
        set({ subcategoriesByCategory: contextCache });
      }
      return;
    }

    set((currentState) => {
      const loadingContext = {
        ...(currentState.subcategoryBranchLoadingByContext[contextKey] ?? {}),
      };
      const errorContext = {
        ...(currentState.subcategoryBranchErrorByContext[contextKey] ?? {}),
      };
      for (const parentId of parentIdsToLoad) {
        loadingContext[parentId] = true;
        errorContext[parentId] = null;
      }
      return {
        subcategoryBranchLoadingByContext: {
          ...currentState.subcategoryBranchLoadingByContext,
          [contextKey]: loadingContext,
        },
        subcategoryBranchErrorByContext: {
          ...currentState.subcategoryBranchErrorByContext,
          [contextKey]: errorContext,
        },
      };
    });

    const results = await Promise.all(
      parentIdsToLoad.map(async (parentId) => {
        const requestKey = `${contextKey}::${parentId}`;
        const existingRequest = subcategoryBranchRequests.get(requestKey);
        const request =
          existingRequest ??
          withTimeout(
            participantService.getSubcategoriesForCategory(
              parentId,
              normalizedEventId,
              purpose === "upload" ? "upload" : undefined,
            ),
            SUBCATEGORY_REQUEST_TIMEOUT_MS,
            "Tiempo de espera agotado al cargar subcategorias.",
          );

        if (!existingRequest) {
          subcategoryBranchRequests.set(requestKey, request);
        }

        try {
          const children = await request;
          return { parentId, children };
        } catch (error) {
          return {
            parentId,
            error: getErrorMessage(error),
          };
        } finally {
          if (subcategoryBranchRequests.get(requestKey) === request) {
            subcategoryBranchRequests.delete(requestKey);
          }
        }
      }),
    );

    set((currentState) => {
      const cachedContext = {
        ...(currentState.subcategoryBranchCacheByContext[contextKey] ?? {}),
      };
      const loadingContext = {
        ...(currentState.subcategoryBranchLoadingByContext[contextKey] ?? {}),
      };
      const errorContext = {
        ...(currentState.subcategoryBranchErrorByContext[contextKey] ?? {}),
      };

      for (const result of results) {
        loadingContext[result.parentId] = false;
        if ("error" in result) {
          errorContext[result.parentId] =
            typeof result.error === "string"
              ? result.error
              : "No se pudieron cargar las subcategorias.";
          continue;
        }

        cachedContext[result.parentId] = result.children;
        errorContext[result.parentId] = null;
      }

      const nextState: Partial<ParticipantStoreState> = {
        subcategoryBranchCacheByContext: {
          ...currentState.subcategoryBranchCacheByContext,
          [contextKey]: cachedContext,
        },
        subcategoryBranchLoadingByContext: {
          ...currentState.subcategoryBranchLoadingByContext,
          [contextKey]: loadingContext,
        },
        subcategoryBranchErrorByContext: {
          ...currentState.subcategoryBranchErrorByContext,
          [contextKey]: errorContext,
        },
      };

      if (
        currentState.selectedEvent?.id === normalizedEventId &&
        currentState.selectedEventSubcategoryPurpose === purpose
      ) {
        nextState.subcategoriesByCategory = cachedContext;
      }

      return nextState;
    });
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
        const categories = await withTimeout(
          participantService.getCategoriesForEvent(normalizedEventId),
          EVENT_CONTEXT_REQUEST_TIMEOUT_MS,
          "Tiempo de espera agotado al cargar las categorias del evento.",
        );
        const subcategoriesByCategoryResult = await loadSubcategoriesByCategory(
          normalizedEventId,
          categories,
          "default",
        );
        const grouped = categories.map((category) => ({
          category,
          subcategories: collectLeafDescendants(
            category.id,
            subcategoriesByCategoryResult.map,
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
