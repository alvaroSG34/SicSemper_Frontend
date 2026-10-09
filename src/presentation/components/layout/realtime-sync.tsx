"use client";

import { useCallback, useEffect, useRef } from "react";
import { getApiBaseUrl } from "@/core/api-base-url";
import { useAdminStore, useAuthStore, useJudgeStore, useParticipantStore } from "@/presentation/stores";
import { publishRealtimeInvalidation } from "@/presentation/realtime/realtime-invalidation-bus";
import { hasDirtyFormForDomains, useRealtimeDirtyStore } from "@/presentation/realtime/realtime-dirty.store";
import { isSyncInvalidation, type SyncDomain, type SyncInvalidation } from "@/presentation/realtime/realtime-sync.types";

const RETRY_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 15_000, 30_000];
const PENDING_REFRESH_EVENT = "sicsemper:refresh-pending-sync";
const intersects = (domains: SyncDomain[], candidates: SyncDomain[]) => domains.some((domain) => candidates.includes(domain));

export function RealtimeSync() {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const sourceRef = useRef<EventSource | null>(null);
  const retryRef = useRef<number | null>(null);
  const retriesRef = useRef(0);
  const lastFocusSyncAtRef = useRef(0);
  const refreshRef = useRef<(domains: SyncDomain[], scope?: SyncInvalidation["scope"]) => void>(() => undefined);

  const refreshDomains = useCallback((domains: SyncDomain[], scope?: SyncInvalidation["scope"]) => {
    const auth = useAuthStore.getState();
    const currentUser = auth.user;
    if (!currentUser) return;
    if (domains.includes("session")) void auth.refreshSession();
    const activeRole = auth.currentRole;
    if (activeRole === "PARTICIPANTE" && intersects(domains, ["participant", "event", "model", "registration", "review"])) {
      const participant = useParticipantStore.getState();
      void participant.loadDashboard(currentUser.id);
      void participant.loadExploreEvents({ force: true });
      void participant.loadMyModels(currentUser.id);
    }
    if (activeRole === "PARTICIPANTE" && scope?.eventId && intersects(domains, ["showcase", "ranking", "tieBreak"])) {
      void useParticipantStore.getState().loadShowcaseTree(scope.eventId, { force: true });
    }
    if (activeRole === "JUEZ" && intersects(domains, ["judge", "event", "model"])) {
      const judge = useJudgeStore.getState();
      void judge.loadDashboard();
      if (judge.models || judge.selectedModelId) void judge.loadModels();
    }
    if ((activeRole === "ADMIN" || activeRole === "SUPERADMIN") && intersects(domains, ["admin", "event", "model", "session"])) {
      const admin = useAdminStore.getState();
      void admin.loadSummary({ force: true });
      if (admin.dashboard) void admin.loadDashboard({ force: true });
    }
  }, []);

  useEffect(() => { refreshRef.current = refreshDomains; }, [refreshDomains]);

  const handleInvalidation = useCallback((invalidation: SyncInvalidation) => {
    publishRealtimeInvalidation(invalidation);
    if (hasDirtyFormForDomains(invalidation.domains)) {
      useRealtimeDirtyStore.getState().addPending(invalidation.domains);
      return;
    }
    refreshDomains(invalidation.domains, invalidation.scope);
  }, [refreshDomains]);

  useEffect(() => {
    const refreshPending = () => {
      const pendingDomains = useRealtimeDirtyStore.getState().pendingDomains;
      if (pendingDomains.length) {
        useRealtimeDirtyStore.getState().clearPending();
        refreshRef.current(pendingDomains);
      }
    };
    window.addEventListener(PENDING_REFRESH_EVENT, refreshPending);
    return () => window.removeEventListener(PENDING_REFRESH_EVENT, refreshPending);
  }, []);

  useEffect(() => {
    if (!initialized || !user) return;
    let disposed = false;
    const close = () => { sourceRef.current?.close(); sourceRef.current = null; };
    const scheduleReconnect = () => {
      if (disposed || document.visibilityState !== "visible" || retryRef.current !== null) return;
      const delay = RETRY_DELAYS_MS[Math.min(retriesRef.current, RETRY_DELAYS_MS.length - 1)];
      retriesRef.current += 1;
      retryRef.current = window.setTimeout(() => { retryRef.current = null; connect(); }, delay);
    };
    const connect = () => {
      if (disposed || document.visibilityState !== "visible" || sourceRef.current) return;
      const source = new EventSource(`${getApiBaseUrl()}/sync/stream`, { withCredentials: true });
      sourceRef.current = source;
      source.addEventListener("sync", (message) => {
        try {
          const invalidation = JSON.parse((message as MessageEvent<string>).data) as unknown;
          if (isSyncInvalidation(invalidation)) handleInvalidation(invalidation);
        } catch { /* Ignora mensajes truncados durante el cierre. */ }
      });
      source.onopen = () => { retriesRef.current = 0; };
      source.onerror = () => {
        // EventSource no expone el codigo HTTP. Revalidamos la sesion al
        // recuperar foco, no por cada error transitorio de red.
        if (sourceRef.current !== source) return;
        source.close();
        sourceRef.current = null;
        scheduleReconnect();
      };
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        if (now - lastFocusSyncAtRef.current < 1_000) {
          connect();
          return;
        }
        lastFocusSyncAtRef.current = now;
        void useAuthStore.getState().refreshSession();
        refreshRef.current(["participant", "judge", "admin", "event", "model"]);
        connect();
      } else close();
    };
    connect();
    window.addEventListener("focus", onVisibility);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true; close();
      if (retryRef.current !== null) window.clearTimeout(retryRef.current);
      window.removeEventListener("focus", onVisibility);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [handleInvalidation, initialized, user]);
  return null;
}
