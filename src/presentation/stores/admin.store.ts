import { create } from "zustand";
import { createAdminCoreStoreSlice } from "./admin-core.store-slice";
import { createAdminMutationsStoreSlice } from "./admin-mutations.store-slice";
import { createAdminPermissionsStoreSlice } from "./admin-permissions.store-slice";
import type { AdminStoreState } from "./admin.store.types";

export type { AdminStoreState } from "./admin.store.types";

export const useAdminStore = create<AdminStoreState>()((...args) => ({
  ...createAdminCoreStoreSlice(...args),
  ...createAdminMutationsStoreSlice(...args),
  ...createAdminPermissionsStoreSlice(...args),
}));
