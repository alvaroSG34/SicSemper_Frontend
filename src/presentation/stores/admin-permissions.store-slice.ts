import type { StateCreator } from "zustand";
import { adminService } from "@/application/admin/admin.service";
import type { AdminStoreState } from "./admin.store.types";

type AdminPermissionsStoreSlice = Pick<
  AdminStoreState,
  | "adminPermissionsMap"
  | "adminPermissionsLoading"
  | "adminPermissionsError"
  | "loadAdminPermissions"
  | "toggleAdminPermission"
  | "judgePermissionsMap"
  | "judgePermissionsLoading"
  | "judgePermissionsError"
  | "loadJudgePermissions"
  | "toggleJudgePermission"
>;

export const createAdminPermissionsStoreSlice: StateCreator<
  AdminStoreState,
  [],
  [],
  AdminPermissionsStoreSlice
> = (set) => ({
  adminPermissionsMap: {},
  adminPermissionsLoading: {},
  adminPermissionsError: {},
  judgePermissionsMap: {},
  judgePermissionsLoading: {},
  judgePermissionsError: {},
  loadAdminPermissions: async (adminUserId) => {
    set((state) => ({
      adminPermissionsLoading: { ...state.adminPermissionsLoading, [adminUserId]: true },
      adminPermissionsError: { ...state.adminPermissionsError, [adminUserId]: null },
    }));
    try {
      const entries = await adminService.listAdminPermissions(adminUserId);
      set((state) => ({
        adminPermissionsMap: { ...state.adminPermissionsMap, [adminUserId]: entries },
        adminPermissionsLoading: { ...state.adminPermissionsLoading, [adminUserId]: false },
      }));
    } catch (error) {
      set((state) => ({
        adminPermissionsLoading: { ...state.adminPermissionsLoading, [adminUserId]: false },
        adminPermissionsError: {
          ...state.adminPermissionsError,
          [adminUserId]: error instanceof Error ? error.message : "Error al cargar permisos.",
        },
      }));
    }
  },
  toggleAdminPermission: async (adminUserId, code, shouldRevoke) => {
    const actionKey = `admin-perm:toggle:${adminUserId}:${code}`;
    set((state) => ({
      adminPermissionsLoading: { ...state.adminPermissionsLoading, [actionKey]: true },
    }));
    try {
      const entries = shouldRevoke
        ? await adminService.revokeAdminPermission(adminUserId, code)
        : await adminService.grantAdminPermission(adminUserId, code);
      set((state) => ({
        adminPermissionsMap: { ...state.adminPermissionsMap, [adminUserId]: entries },
        adminPermissionsLoading: { ...state.adminPermissionsLoading, [actionKey]: false },
      }));
    } catch (error) {
      set((state) => ({
        adminPermissionsLoading: { ...state.adminPermissionsLoading, [actionKey]: false },
        adminPermissionsError: {
          ...state.adminPermissionsError,
          [adminUserId]: error instanceof Error ? error.message : "Error al actualizar permiso.",
        },
      }));
      throw error;
    }
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
  toggleJudgePermission: async (judgeUserId, code, grantedDirectly) => {
    const actionKey = `perm:toggle:${judgeUserId}:${code}`;
    set((state) => ({
      judgePermissionsLoading: { ...state.judgePermissionsLoading, [actionKey]: true },
    }));
    try {
      const entries = grantedDirectly
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
      throw error;
    }
  },
});
