"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminEventControlService } from "@/application/admin/services/admin-event-control.service";
import type {
  AdminEventPodiumResult,
  AdminEventPodiumSegment,
  AdminEventPodiumTree,
} from "@/domain/admin/admin.types";
import { subscribeRealtimeInvalidation } from "@/presentation/realtime/realtime-invalidation-bus";

export type EventPodiumService = Pick<
  typeof import("@/application/admin/services/admin-event-control.service").adminEventControlService,
  "getEventControlPodiumTree" | "listEventControlPodiumSegments" | "getEventControlPodiumResult"
>;

const DEFAULT_PAGE_SIZE = 20;

export type AdminEventPodiumInitialSelection = {
  selectedPath?: string[];
  finalCategoryId?: string | null;
  selectedSegment?: {
    scaleId?: string;
    groupId?: string;
  } | null;
};

export const useAdminEventPodium = ({
  eventId,
  enabled = true,
  initialSelection,
  service,
}: {
  eventId: string;
  enabled?: boolean;
  initialSelection?: AdminEventPodiumInitialSelection;
  service?: EventPodiumService;
}) => {
  const podiumService = service ?? adminEventControlService;
  const [tree, setTree] = useState<AdminEventPodiumTree | null>(null);
  const [segments, setSegments] = useState<AdminEventPodiumSegment[]>([]);
  const [result, setResult] = useState<AdminEventPodiumResult | null>(null);
  const [selectedPath, setSelectedPath] = useState<string[]>(initialSelection?.selectedPath ?? []);
  const [finalCategoryId, setFinalCategoryId] = useState<string | null>(
    initialSelection?.finalCategoryId ?? null,
  );
  const [selectedSegment, setSelectedSegment] = useState<{
    scaleId?: string;
    groupId?: string;
  } | null>(initialSelection?.selectedSegment ?? null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setTree(null);
    setSegments([]);
    setResult(null);
    setSelectedPath(initialSelection?.selectedPath ?? []);
    setFinalCategoryId(initialSelection?.finalCategoryId ?? null);
    setSelectedSegment(initialSelection?.selectedSegment ?? null);
    setPage(1);
  }, [initialSelection]);

  const loadTree = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const nextTree = await podiumService.getEventControlPodiumTree(eventId);
      setTree(nextTree);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "No se pudo cargar el árbol del podio.",
      );
    } finally {
      setLoading(false);
    }
  }, [enabled, eventId, podiumService]);

  useEffect(() => {
    reset();
    if (enabled) void loadTree();
  }, [enabled, eventId, loadTree, reset]);

  const nodesById = useMemo(
    () => new Map((tree?.nodes ?? []).map((node) => [node.id, node])),
    [tree?.nodes],
  );

  const currentOptions = useMemo(() => {
    if (!tree) return [];
    const selected = selectedPath.at(-1);
    const ids = selected ? (nodesById.get(selected)?.children ?? []) : tree.rootIds;
    return ids
      .map((id) => nodesById.get(id))
      .filter((node): node is NonNullable<typeof node> => Boolean(node));
  }, [nodesById, selectedPath, tree]);

  const selectCategory = useCallback(
    (categoryId: string, level?: number) => {
      const node = nodesById.get(categoryId);
      if (!node) return;
      const existingIndex = selectedPath.findIndex((id) => id === categoryId);
      const targetLevel = level ?? (existingIndex >= 0 ? existingIndex : selectedPath.length);
      const nextPath = [...selectedPath.slice(0, targetLevel), categoryId];
      setSelectedPath(nextPath);
      setSegments([]);
      setResult(null);
      setSelectedSegment(null);
      setPage(1);
      if (node.children.length === 0) setFinalCategoryId(categoryId);
      else setFinalCategoryId(null);
    },
    [nodesById, selectedPath],
  );

  useEffect(() => {
    if (!enabled || !finalCategoryId) return;
    setLoadingSegments(true);
    setError(null);
    void podiumService
      .listEventControlPodiumSegments(eventId, finalCategoryId)
      .then((nextSegments) => setSegments(nextSegments))
      .catch((nextError) =>
        setError(
          nextError instanceof Error ? nextError.message : "No se pudieron cargar los segmentos.",
        ),
      )
      .finally(() => setLoadingSegments(false));
  }, [enabled, eventId, finalCategoryId, podiumService]);

  const selectSegment = useCallback((segment: AdminEventPodiumSegment | null) => {
    setSelectedSegment(
      segment
        ? { scaleId: segment.scaleId ?? undefined, groupId: segment.groupId ?? undefined }
        : null,
    );
    setPage(1);
  }, []);

  useEffect(() => {
    if (!enabled || !finalCategoryId || !selectedSegment) {
      setResult(null);
      return;
    }
    setLoadingResult(true);
    setError(null);
    void podiumService
      .getEventControlPodiumResult({
        eventId,
        finalCategoryId,
        ...selectedSegment,
        page,
        pageSize,
      })
      .then((nextResult) => setResult(nextResult))
      .catch((nextError) =>
        setError(nextError instanceof Error ? nextError.message : "No se pudo cargar el podio."),
      )
      .finally(() => setLoadingResult(false));
  }, [enabled, eventId, finalCategoryId, page, pageSize, selectedSegment, podiumService]);

  const goBack = useCallback((level: number) => {
    setSelectedPath((current) => current.slice(0, level));
    setFinalCategoryId(null);
    setSegments([]);
    setSelectedSegment(null);
    setResult(null);
    setPage(1);
  }, []);

  const refreshSilently = useCallback(async () => {
    if (!enabled) return;
    try {
      const nextTree = await podiumService.getEventControlPodiumTree(eventId);
      setTree(nextTree);
      if (finalCategoryId) {
        const nextSegments = await podiumService.listEventControlPodiumSegments(
          eventId,
          finalCategoryId,
        );
        setSegments(nextSegments);
        if (selectedSegment) {
          const nextResult = await podiumService.getEventControlPodiumResult({
            eventId,
            finalCategoryId,
            ...selectedSegment,
            page,
            pageSize,
          });
          setResult(nextResult);
        }
      }
    } catch {
      // La actualización en tiempo real no debe interrumpir ni mostrar avisos al administrador.
    }
  }, [enabled, eventId, finalCategoryId, page, pageSize, selectedSegment, podiumService]);

  useEffect(
    () =>
      subscribeRealtimeInvalidation((invalidation) => {
        if (!enabled || invalidation.scope?.eventId !== eventId) return;
        if (
          !invalidation.domains.some((domain) =>
            ["model", "review", "ranking", "showcase", "tieBreak", "event", "admin"].includes(
              domain,
            ),
          )
        )
          return;
        void refreshSilently();
      }),
    [enabled, eventId, refreshSilently],
  );

  return {
    tree,
    nodesById,
    currentOptions,
    selectedPath,
    finalCategoryId,
    segments,
    selectedSegment,
    result,
    loading,
    loadingSegments,
    loadingResult,
    error,
    selectCategory,
    selectSegment,
    goBack,
    page,
    pageSize,
    setPage,
    setPageSize: (next: number) => {
      setPageSize(next);
      setPage(1);
    },
    reload: loadTree,
  };
};
