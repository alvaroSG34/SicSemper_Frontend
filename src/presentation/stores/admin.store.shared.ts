import type { StoreApi } from "zustand";
import { adminService } from "@/application/admin/admin.service";
import type { AdminStoreState } from "./admin.store.types";

type AdminSetState = StoreApi<AdminStoreState>["setState"];

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado en el panel admin.";
};

export const loadSnapshot = async (
  set: AdminSetState,
  options?: { loading?: boolean },
) => {
  if (options?.loading) {
    set({ loading: true });
  }

  const dashboard = await adminService.getDashboardData();

  set({
    users: dashboard.users,
    dashboard,
    summary: {
      kpis: dashboard.kpis,
      alerts: dashboard.alerts,
      activity: dashboard.activity,
      effectivePermissions: dashboard.effectivePermissions,
    },
    error: null,
    loading: false,
  });
};

export const executeMutation = async <T>(
  set: AdminSetState,
  mutation: () => Promise<T>,
): Promise<T | undefined> => {
  set({ loading: true, error: null });

  try {
    const result = await mutation();
    await loadSnapshot(set);
    return result;
  } catch (error) {
    set({ loading: false, error: getErrorMessage(error) });
  }
  return undefined;
};
