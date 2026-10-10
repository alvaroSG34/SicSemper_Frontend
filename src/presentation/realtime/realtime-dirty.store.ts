import { create } from "zustand";
import type { SyncDomain } from "./realtime-sync.types";

type RealtimeDirtyState = {
  dirtyForms: Record<string, SyncDomain[]>;
  pendingDomains: SyncDomain[];
  setFormDirty: (formId: string, domains: SyncDomain[], dirty: boolean) => void;
  addPending: (domains: SyncDomain[]) => void;
  clearPending: () => void;
};

export const useRealtimeDirtyStore = create<RealtimeDirtyState>((set) => ({
  dirtyForms: {}, pendingDomains: [],
  setFormDirty: (formId, domains, dirty) => set((state) => {
    const dirtyForms = { ...state.dirtyForms };
    if (dirty) dirtyForms[formId] = domains; else delete dirtyForms[formId];
    return { dirtyForms };
  }),
  addPending: (domains) => set((state) => ({ pendingDomains: [...new Set([...state.pendingDomains, ...domains])] })),
  clearPending: () => set({ pendingDomains: [] }),
}));

export const hasDirtyFormForDomains = (domains: SyncDomain[]) =>
  Object.values(useRealtimeDirtyStore.getState().dirtyForms).some((formDomains) => formDomains.some((domain) => domains.includes(domain)));
