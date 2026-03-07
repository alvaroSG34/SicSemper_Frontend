import { create } from "zustand";
import { adminService } from "@/application/admin/admin.service";
import type {
  AdminDashboardData,
  AssignJudgeScopePayload,
  CategoryDeleteImpact,
  CatalogEventStatus,
  ClubDeleteImpact,
  EventDeleteImpact,
  JudgePermissionCode,
  JudgePermissionEntry,
} from "@/domain/admin/admin.types";
import type { User } from "@/domain/user/user.types";

type AdminStoreState = {
  users: User[];
  dashboard: AdminDashboardData | null;
  loading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
  clearError: () => void;
  createClub: (payload: {
    name: string;
    place: string;
    contactEmail: string;
    description?: string;
    logoUrl?: string;
  }) => Promise<void>;
  updateClub: (payload: {
    id: string;
    name: string;
    place: string;
    contactEmail: string;
    description?: string;
    logoUrl?: string;
  }) => Promise<void>;
  getClubDeleteImpact: (clubId: string) => Promise<ClubDeleteImpact>;
  removeClub: (clubId: string) => Promise<void>;
  promoteToJudge: (userId: string) => Promise<void>;
  demoteJudge: (userId: string) => Promise<void>;
  banParticipant: (userId: string) => Promise<void>;
  unbanParticipant: (userId: string) => Promise<void>;
  createEvent: (payload: {
    name: string;
    status?: CatalogEventStatus;
    place: string;
    startDate: string;
    endDate: string;
    description: string;
  }) => Promise<void>;
  createEventAndLinkCategories: (
    payload: {
      name: string;
      status?: CatalogEventStatus;
      place: string;
      startDate: string;
      endDate: string;
      description: string;
    },
    categoryIds: string[],
  ) => Promise<void>;
  updateEvent: (payload: {
    id: string;
    name: string;
    status: CatalogEventStatus;
    place: string;
    startDate: string;
    endDate: string;
    description: string;
  }) => Promise<void>;
  updateEventAndLinkCategories: (
    payload: {
      id: string;
      name: string;
      status: CatalogEventStatus;
      place: string;
      startDate: string;
      endDate: string;
      description: string;
    },
    categoryIds: string[],
  ) => Promise<void>;
  getEventDeleteImpact: (eventId: string) => Promise<EventDeleteImpact>;
  removeEvent: (eventId: string) => Promise<void>;
  createCategory: (payload: { eventId?: string | null; name: string }) => Promise<void>;
  updateCategory: (payload: { id: string; eventId?: string | null; name: string }) => Promise<void>;
  getCategoryDeleteImpact: (categoryId: string) => Promise<CategoryDeleteImpact>;
  removeCategory: (categoryId: string) => Promise<void>;
  createSubcategory: (payload: { categoryId: string; name: string }) => Promise<void>;
  updateSubcategory: (payload: { id: string; categoryId: string; name: string }) => Promise<void>;
  removeSubcategory: (subcategoryId: string) => Promise<void>;
  assignJudgeScope: (payload: AssignJudgeScopePayload) => Promise<void>;
  removeJudgeScope: (assignmentId: string) => Promise<void>;
  judgePermissionsMap: Record<string, JudgePermissionEntry[]>;
  judgePermissionsLoading: Record<string, boolean>;
  judgePermissionsError: Record<string, string | null>;
  loadJudgePermissions: (judgeUserId: string) => Promise<void>;
  toggleJudgePermission: (judgeUserId: string, code: JudgePermissionCode, granted: boolean) => Promise<void>;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado en el panel admin.";
};

const loadSnapshot = async (
  set: (partial: Partial<AdminStoreState>) => void,
  options?: { loading?: boolean },
) => {
  if (options?.loading) {
    set({ loading: true });
  }

  const dashboard = await adminService.getDashboardData();

  set({
    users: dashboard.users,
    dashboard,
    error: null,
    loading: false,
  });
};

const executeMutation = async (
  set: (partial: Partial<AdminStoreState>) => void,
  mutation: () => Promise<void>,
) => {
  set({ loading: true, error: null });

  try {
    await mutation();
    await loadSnapshot(set);
  } catch (error) {
    set({ loading: false, error: getErrorMessage(error) });
  }
};

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  users: [],
  dashboard: null,
  loading: false,
  error: null,
  judgePermissionsMap: {},
  judgePermissionsLoading: {},
  judgePermissionsError: {},
  loadDashboard: async () => {
    try {
      await loadSnapshot(set, { loading: true });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },
  clearError: () => set({ error: null }),
  createClub: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.createClub(payload);
    });
  },
  updateClub: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.updateClub(payload);
    });
  },
  getClubDeleteImpact: async (clubId) => {
    return adminService.getClubDeleteImpact(clubId);
  },
  removeClub: async (clubId) => {
    await executeMutation(set, async () => {
      await adminService.removeClub(clubId);
    });
  },
  promoteToJudge: async (userId) => {
    await executeMutation(set, async () => {
      await adminService.promoteToJudge(userId);
    });
  },
  demoteJudge: async (userId) => {
    await executeMutation(set, async () => {
      await adminService.demoteJudge(userId);
    });
  },
  banParticipant: async (userId) => {
    await executeMutation(set, async () => {
      await adminService.banParticipant(userId);
    });
  },
  unbanParticipant: async (userId) => {
    await executeMutation(set, async () => {
      await adminService.unbanParticipant(userId);
    });
  },
  createEvent: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.createEvent(payload);
    });
  },
  createEventAndLinkCategories: async (payload, categoryIds) => {
    await executeMutation(set, async () => {
      await adminService.createEventAndLinkCategories(payload, categoryIds);
    });
  },
  updateEvent: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.updateEvent(payload);
    });
  },
  updateEventAndLinkCategories: async (payload, categoryIds) => {
    await executeMutation(set, async () => {
      await adminService.updateEventAndLinkCategories(payload, categoryIds);
    });
  },
  getEventDeleteImpact: async (eventId) => {
    return adminService.getEventDeleteImpact(eventId);
  },
  removeEvent: async (eventId) => {
    await executeMutation(set, async () => {
      await adminService.removeEvent(eventId);
    });
  },
  createCategory: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.createCategory(payload);
    });
  },
  updateCategory: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.updateCategory(payload);
    });
  },
  getCategoryDeleteImpact: async (categoryId) => {
    return adminService.getCategoryDeleteImpact(categoryId);
  },
  removeCategory: async (categoryId) => {
    await executeMutation(set, async () => {
      await adminService.removeCategory(categoryId);
    });
  },
  createSubcategory: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.createSubcategory(payload);
    });
  },
  updateSubcategory: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.updateSubcategory(payload);
    });
  },
  removeSubcategory: async (subcategoryId) => {
    await executeMutation(set, async () => {
      await adminService.removeSubcategory(subcategoryId);
    });
  },
  assignJudgeScope: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.assignJudgeScope(payload);
    });
  },
  removeJudgeScope: async (assignmentId) => {
    await executeMutation(set, async () => {
      await adminService.removeJudgeScope(assignmentId);
    });
  },
  loadJudgePermissions: async (judgeUserId) => {
    set((state) => ({
      judgePermissionsLoading: { ...state.judgePermissionsLoading, [judgeUserId]: true },
      judgePermissionsError: { ...state.judgePermissionsError, [judgeUserId]: null },
    }));
    try {
      const entries = await adminService.listJudgePermissions(judgeUserId);
      set((state) => ({
        judgePermissionsMap: { ...state.judgePermissionsMap, [judgeUserId]: entries },
        judgePermissionsLoading: { ...state.judgePermissionsLoading, [judgeUserId]: false },
      }));
    } catch (error) {
      set((state) => ({
        judgePermissionsLoading: { ...state.judgePermissionsLoading, [judgeUserId]: false },
        judgePermissionsError: {
          ...state.judgePermissionsError,
          [judgeUserId]: error instanceof Error ? error.message : "Error al cargar permisos.",
        },
      }));
    }
  },
  toggleJudgePermission: async (judgeUserId, code, granted) => {
    const actionKey = `perm:toggle:${judgeUserId}:${code}`;
    set((state) => ({
      judgePermissionsLoading: { ...state.judgePermissionsLoading, [actionKey]: true },
    }));
    try {
      const entries = granted
        ? await adminService.revokeJudgePermission(judgeUserId, code)
        : await adminService.grantJudgePermission(judgeUserId, code);
      set((state) => ({
        judgePermissionsMap: { ...state.judgePermissionsMap, [judgeUserId]: entries },
        judgePermissionsLoading: { ...state.judgePermissionsLoading, [actionKey]: false },
      }));
    } catch (error) {
      set((state) => ({
        judgePermissionsLoading: { ...state.judgePermissionsLoading, [actionKey]: false },
        judgePermissionsError: {
          ...state.judgePermissionsError,
          [judgeUserId]: error instanceof Error ? error.message : "Error al actualizar permiso.",
        },
      }));
      // Re-throw so the UI can show feedback
      throw error;
    }
  },
}));
