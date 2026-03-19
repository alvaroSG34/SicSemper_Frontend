import type { StateCreator } from "zustand";
import { adminService } from "@/application/admin/admin.service";
import type {
  AdminDashboardData,
  AdminDashboardSummary,
} from "@/domain/admin/admin.types";
import type { AdminStoreState } from "./admin.store.types";
import { getErrorMessage } from "./admin.store.shared";

type AdminCoreStoreSlice = Pick<
  AdminStoreState,
  "users" | "dashboard" | "summary" | "loading" | "error" | "loadSummary" | "loadDashboard" | "clearError"
>;

let dashboardRequest: Promise<AdminDashboardData> | null = null;
let summaryRequest: Promise<AdminDashboardSummary> | null = null;

export const createAdminCoreStoreSlice: StateCreator<
  AdminStoreState,
  [],
  [],
  AdminCoreStoreSlice
> = (set, get) => ({
  users: [],
  dashboard: null,
  summary: null,
  loading: false,
  error: null,
  loadSummary: async (options) => {
    const force = options?.force ?? false;
    const state = get();
    if (!force && (state.summary || state.dashboard)) {
      return;
    }

    if (!summaryRequest || force) {
      set({ loading: true, error: null });
      summaryRequest = adminService.getDashboardSummaryData();
    }

    const request = summaryRequest;

    try {
      const summary = await request;
      set({
        summary,
        error: null,
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    } finally {
      if (summaryRequest === request) {
        summaryRequest = null;
      }
    }
  },
  loadDashboard: async (options) => {
    const force = options?.force ?? false;
    if (!force && get().dashboard) {
      return;
    }

    if (!dashboardRequest || force) {
      set({ loading: true, error: null });
      dashboardRequest = adminService.getDashboardData();
    }

    const request = dashboardRequest;

    try {
      const dashboard = await request;
      set({
        users: dashboard.users,
        dashboard,
        summary: {
          kpis: dashboard.kpis,
          effectivePermissions: dashboard.effectivePermissions,
          alerts: dashboard.alerts,
          activity: dashboard.activity,
        },
        error: null,
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    } finally {
      if (dashboardRequest === request) {
        dashboardRequest = null;
      }
    }
  },
  clearError: () => set({ error: null }),
});
