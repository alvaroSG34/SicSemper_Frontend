import { create } from "zustand";
import { adminService } from "@/application/admin/admin.service";
import type {
  AdminDashboardData,
  AssignJudgeScopePayload,
  CatalogEventStatus,
} from "@/domain/admin/admin.types";
import type { User } from "@/domain/user/user.types";

type AdminStoreState = {
  users: User[];
  dashboard: AdminDashboardData | null;
  loading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
  clearError: () => void;
  promoteToJudge: (userId: string) => Promise<void>;
  demoteJudge: (userId: string) => Promise<void>;
  createEvent: (payload: {
    name: string;
    status?: CatalogEventStatus;
    place: string;
    startDate: string;
    endDate: string;
    description: string;
  }) => Promise<void>;
  updateEvent: (payload: {
    id: string;
    name: string;
    status: CatalogEventStatus;
    place: string;
    startDate: string;
    endDate: string;
    description: string;
  }) => Promise<void>;
  createCategory: (payload: { eventId: string; name: string }) => Promise<void>;
  updateCategory: (payload: { id: string; eventId: string; name: string }) => Promise<void>;
  createSubcategory: (payload: { categoryId: string; name: string }) => Promise<void>;
  updateSubcategory: (payload: { id: string; categoryId: string; name: string }) => Promise<void>;
  assignJudgeScope: (payload: AssignJudgeScopePayload) => Promise<void>;
  removeJudgeScope: (assignmentId: string) => Promise<void>;
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

  const [dashboard, users] = await Promise.all([
    adminService.getDashboardData(),
    adminService.listUsers(),
  ]);

  set({
    users,
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

export const useAdminStore = create<AdminStoreState>((set) => ({
  users: [],
  dashboard: null,
  loading: false,
  error: null,
  loadDashboard: async () => {
    try {
      await loadSnapshot(set, { loading: true });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },
  clearError: () => set({ error: null }),
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
  createEvent: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.createEvent(payload);
    });
  },
  updateEvent: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.updateEvent(payload);
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
}));
