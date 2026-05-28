import type { StateCreator } from "zustand";
import { adminService } from "@/application/admin/admin.service";
import type { AdminStoreState } from "./admin.store.types";
import { getErrorMessage } from "./admin.store.shared";

type AdminBitacoraStoreSlice = Pick<
  AdminStoreState,
  | "bitacoraItems"
  | "bitacoraTotal"
  | "bitacoraPage"
  | "bitacoraPageSize"
  | "bitacoraHasMore"
  | "bitacoraFilters"
  | "bitacoraLoading"
  | "bitacoraError"
  | "bitacoraSelectedId"
  | "bitacoraSelectedItem"
  | "bitacoraDetailLoading"
  | "setBitacoraFilters"
  | "setBitacoraPage"
  | "setBitacoraPageSize"
  | "loadBitacora"
  | "selectBitacoraItem"
>;

export const createAdminBitacoraStoreSlice: StateCreator<
  AdminStoreState,
  [],
  [],
  AdminBitacoraStoreSlice
> = (set, get) => ({
  bitacoraItems: [],
  bitacoraTotal: 0,
  bitacoraPage: 1,
  bitacoraPageSize: 20,
  bitacoraHasMore: false,
  bitacoraFilters: {},
  bitacoraLoading: false,
  bitacoraError: null,
  bitacoraSelectedId: null,
  bitacoraSelectedItem: null,
  bitacoraDetailLoading: false,
  setBitacoraFilters: (filters) => {
    set((state) => ({
      bitacoraFilters: { ...state.bitacoraFilters, ...filters },
      bitacoraPage: 1,
    }));
  },
  setBitacoraPage: (page) => {
    const normalized = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    set({ bitacoraPage: normalized });
  },
  setBitacoraPageSize: (pageSize) => {
    const normalized = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 20;
    set({
      bitacoraPageSize: Math.min(normalized, 100),
      bitacoraPage: 1,
    });
  },
  loadBitacora: async () => {
    const state = get();
    set({ bitacoraLoading: true, bitacoraError: null });
    try {
      const response = await adminService.listBitacora({
        page: state.bitacoraPage,
        pageSize: state.bitacoraPageSize,
        ...state.bitacoraFilters,
      });

      set((currentState) => {
        const selectedId =
          currentState.bitacoraSelectedId &&
          response.items.some((entry) => entry.id === currentState.bitacoraSelectedId)
            ? currentState.bitacoraSelectedId
            : (response.items[0]?.id ?? null);

        return {
          bitacoraItems: response.items,
          bitacoraTotal: response.total,
          bitacoraHasMore: response.hasMore,
          bitacoraPage: response.page,
          bitacoraPageSize: response.pageSize,
          bitacoraSelectedId: selectedId,
          bitacoraSelectedItem:
            selectedId === currentState.bitacoraSelectedId
              ? currentState.bitacoraSelectedItem
              : null,
          bitacoraLoading: false,
          bitacoraError: null,
        };
      });
    } catch (error) {
      set({
        bitacoraLoading: false,
        bitacoraError: getErrorMessage(error),
      });
    }
  },
  selectBitacoraItem: async (id) => {
    if (!id) {
      set({
        bitacoraSelectedId: null,
        bitacoraSelectedItem: null,
        bitacoraDetailLoading: false,
      });
      return;
    }

    set({
      bitacoraSelectedId: id,
      bitacoraDetailLoading: true,
    });

    try {
      const detail = await adminService.getBitacoraItem(id);
      set((state) => {
        if (state.bitacoraSelectedId !== id) {
          return {};
        }

        return {
          bitacoraSelectedItem: detail,
          bitacoraDetailLoading: false,
        };
      });
    } catch {
      set((state) => {
        if (state.bitacoraSelectedId !== id) {
          return {};
        }
        return {
          bitacoraSelectedItem: null,
          bitacoraDetailLoading: false,
        };
      });
    }
  },
});
