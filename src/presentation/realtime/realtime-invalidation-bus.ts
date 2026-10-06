import type { SyncInvalidation } from "./realtime-sync.types";

type Listener = (invalidation: SyncInvalidation) => void;
const listeners = new Set<Listener>();

export const publishRealtimeInvalidation = (invalidation: SyncInvalidation) => listeners.forEach((listener) => listener(invalidation));
export const subscribeRealtimeInvalidation = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
