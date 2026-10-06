"use client";

import { useEffect, useId } from "react";
import { useRealtimeDirtyStore } from "./realtime-dirty.store";
import type { SyncDomain } from "./realtime-sync.types";

export const useRealtimeDirtyForm = (domains: SyncDomain[], dirty: boolean) => {
  const formId = useId();
  const setFormDirty = useRealtimeDirtyStore((state) => state.setFormDirty);
  useEffect(() => {
    setFormDirty(formId, domains, dirty);
    return () => setFormDirty(formId, domains, false);
  }, [dirty, domains, formId, setFormDirty]);
};
