"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ParticipantScale } from "@/domain/participant/participant.types";
import { participantService } from "@/application/participant/participant.service";
import { useParticipantStore } from "@/presentation/stores";

const buildSubcategoryContextKey = (
  eventId: string,
  purpose: "default" | "upload",
) => `${eventId}::${purpose}`;

export const useParticipantUploadEventContext = (
  eventId: string,
  finalCategoryId?: string,
  subcategoryPurpose: "default" | "upload" = "default",
  visibleBranchParentIds: string[] = [],
) => {
  const normalizedEventId = eventId.trim();
  const normalizedFinalCategoryId = finalCategoryId?.trim() ?? "";
  const normalizedVisibleParentIds = useMemo(
    () =>
      Array.from(
        new Set(
          visibleBranchParentIds
            .map((parentId) => parentId.trim())
            .filter((parentId) => parentId.length > 0),
        ),
      ),
    [visibleBranchParentIds],
  );
  const hasValidEventId = normalizedEventId.length > 0;
  const selectedEvent = useParticipantStore((state) => state.selectedEvent);
  const selectedEventSubcategoryPurpose = useParticipantStore(
    (state) => state.selectedEventSubcategoryPurpose,
  );
  const eventCategories = useParticipantStore((state) => state.eventCategories);
  const subcategoriesByCategory = useParticipantStore((state) => state.subcategoriesByCategory);
  const showcaseTreeByEventId = useParticipantStore((state) => state.showcaseTreeByEventId);
  const showcaseTreeLoadingByEventId = useParticipantStore(
    (state) => state.showcaseTreeLoadingByEventId,
  );
  const showcaseTreeErrorByEventId = useParticipantStore(
    (state) => state.showcaseTreeErrorByEventId,
  );
  const subcategoryBranchLoadingByContext = useParticipantStore(
    (state) => state.subcategoryBranchLoadingByContext,
  );
  const subcategoryBranchErrorByContext = useParticipantStore(
    (state) => state.subcategoryBranchErrorByContext,
  );
  const exploreEvents = useParticipantStore((state) => state.exploreEvents);
  const flowError = useParticipantStore((state) => state.flowError);
  const selectEvent = useParticipantStore((state) => state.selectEvent);
  const loadExploreEvents = useParticipantStore((state) => state.loadExploreEvents);
  const ensureSubcategoryBranches = useParticipantStore(
    (state) => state.ensureSubcategoryBranches,
  );
  const [scales, setScales] = useState<ParticipantScale[]>([]);
  const [scalesLoading, setScalesLoading] = useState(false);
  const [scalesError, setScalesError] = useState<string | null>(null);

  const eventReady =
    selectedEvent?.id === normalizedEventId &&
    selectedEventSubcategoryPurpose === subcategoryPurpose;
  const requestedEventIdRef = useRef<string | null>(null);
  const requestedScaleContextRef = useRef<string | null>(null);

  const subcategoryContextKey = useMemo(
    () =>
      normalizedEventId
        ? buildSubcategoryContextKey(normalizedEventId, subcategoryPurpose)
        : null,
    [normalizedEventId, subcategoryPurpose],
  );

  const visibleBranchLoading = useMemo(() => {
    if (!subcategoryContextKey) {
      return false;
    }

    const branchLoadingState = subcategoryBranchLoadingByContext[subcategoryContextKey] ?? {};
    return normalizedVisibleParentIds.some((parentId) => branchLoadingState[parentId]);
  }, [
    normalizedVisibleParentIds,
    subcategoryBranchLoadingByContext,
    subcategoryContextKey,
  ]);

  const visibleBranchError = useMemo(() => {
    if (!subcategoryContextKey) {
      return null;
    }

    const branchErrorState = subcategoryBranchErrorByContext[subcategoryContextKey] ?? {};
    return (
      normalizedVisibleParentIds
        .map((parentId) => branchErrorState[parentId])
        .find((message): message is string => Boolean(message && message.trim())) ?? null
    );
  }, [normalizedVisibleParentIds, subcategoryBranchErrorByContext, subcategoryContextKey]);

  useEffect(() => {
    if (!normalizedEventId) {
      return;
    }

    if (eventReady) {
      requestedEventIdRef.current = normalizedEventId;
      return;
    }

    if (requestedEventIdRef.current === normalizedEventId) {
      return;
    }

    requestedEventIdRef.current = normalizedEventId;
    void selectEvent(normalizedEventId, subcategoryPurpose);
  }, [eventReady, normalizedEventId, selectEvent, subcategoryPurpose]);

  useEffect(() => {
    if (
      !eventReady ||
      !normalizedEventId ||
      normalizedVisibleParentIds.length === 0 ||
      subcategoryPurpose !== "upload"
    ) {
      return;
    }

    void ensureSubcategoryBranches({
      eventId: normalizedEventId,
      parentCategoryIds: normalizedVisibleParentIds,
      purpose: subcategoryPurpose,
    });
  }, [
    ensureSubcategoryBranches,
    eventReady,
    normalizedEventId,
    normalizedVisibleParentIds,
    subcategoryPurpose,
  ]);

  useEffect(() => {
    if (!eventReady || !normalizedFinalCategoryId) {
      return;
    }

    const contextKey = `${normalizedEventId}::${normalizedFinalCategoryId}`;
    if (requestedScaleContextRef.current === contextKey) {
      return;
    }

    let cancelled = false;
    requestedScaleContextRef.current = contextKey;

    const run = async () => {
      setScalesLoading(true);
      setScalesError(null);

      try {
        const response = await participantService.getScalesForEventCategory(
          normalizedEventId,
          normalizedFinalCategoryId,
        );
        if (!cancelled) {
          setScales(response);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setScalesError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las escalas permitidas.",
          );
          setScales([]);
        }
      } finally {
        if (!cancelled) {
          setScalesLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [eventReady, normalizedEventId, normalizedFinalCategoryId]);

  const retryEventContext = useCallback(() => {
    if (!normalizedEventId) {
      return;
    }

    requestedEventIdRef.current = null;
    requestedScaleContextRef.current = null;
    setScales([]);
    setScalesError(null);

    void loadExploreEvents({ force: true });
    void selectEvent(normalizedEventId, subcategoryPurpose);
  }, [loadExploreEvents, normalizedEventId, selectEvent, subcategoryPurpose]);

  const eventName = useMemo(() => {
    if (selectedEvent?.id === normalizedEventId) {
      return selectedEvent.name;
    }
    return (
      exploreEvents.find((event) => event.id === normalizedEventId)?.name ??
      "Evento"
    );
  }, [exploreEvents, normalizedEventId, selectedEvent]);

  const showcaseTree = hasValidEventId ? showcaseTreeByEventId[normalizedEventId] : undefined;
  const showcaseTreeLoading = hasValidEventId
    ? Boolean(showcaseTreeLoadingByEventId[normalizedEventId])
    : false;
  const showcaseTreeError = hasValidEventId
    ? showcaseTreeErrorByEventId[normalizedEventId] ?? null
    : null;

  const loading = hasValidEventId
    ? ((!eventReady && !flowError) ||
      scalesLoading ||
      (subcategoryPurpose === "default" && showcaseTreeLoading) ||
      (subcategoryPurpose === "upload" && visibleBranchLoading))
    : false;

  const error = hasValidEventId
    ? eventReady
      ? scalesError ??
        (subcategoryPurpose === "default" ? showcaseTreeError : visibleBranchError) ??
        flowError
      : flowError
    : "No se pudo identificar el evento seleccionado.";

  return {
    eventId: normalizedEventId,
    eventReady,
    eventName,
    eventCategories,
    subcategoriesByCategory,
    showcaseTree,
    scales,
    loading,
    error,
    retryEventContext,
  };
};
