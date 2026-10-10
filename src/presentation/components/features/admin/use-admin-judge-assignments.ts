import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CatalogCategory,
  CatalogEvent,
  CatalogSubcategory,
  EventCategoryOption,
  JudgeAssignmentScope,
} from '@/domain/admin/admin.types';
import type { User } from '@/domain/user/user.types';
import { useAdminStore } from '@/presentation/stores/admin.store';
import { adminEventsService } from '@/application/admin/services/admin-events.service';
import { useAdminOperations } from './use-admin-operations';
import {
  buildAssignedJudgeSet,
  buildJudgeAssignmentDiff,
  type JudgeSubcategoryDraft,
} from './judge-assignment-tree.utils';

export type JudgeCategoryTreeNode = {
  id: string;
  name: string;
  depth: number;
  isLeaf: boolean;
  pathLabel: string;
  leafIds: string[];
  children: JudgeCategoryTreeNode[];
};

export type JudgeNodeSelectionState = {
  checked: boolean;
  indeterminate: boolean;
  selectedLeaves: number;
  totalLeaves: number;
};

export type JudgeScaleDraft = Record<string, string[]>;

type JudgeValidationIssue = {
  judgeId: string;
  judgeName: string;
  message: string;
};

type JudgeSyncReport = {
  created: number;
  removed: number;
  failedCreates: Array<{ judgeName: string; scopeName: string; message: string }>;
  failedRemoves: Array<{ judgeName: string; scopeName: string; message: string }>;
};

type UseAdminJudgeAssignmentsParams = {
  users: User[];
  assignments: JudgeAssignmentScope[];
  events: CatalogEvent[];
  categories: CatalogCategory[];
  subcategories: CatalogSubcategory[];
  eventCategories: EventCategoryOption[];
  canManageJudgeAssignments: boolean;
  onAssignmentsSaved?: () => void;
};

const buildJudgeValidationIssues = (
  assignedJudgeIds: Set<string>,
  draft: JudgeSubcategoryDraft,
  judgeNameById: Map<string, string>,
): JudgeValidationIssue[] =>
  Array.from(assignedJudgeIds)
    .filter((judgeUserId) => (draft[judgeUserId]?.length ?? 0) === 0)
    .map((judgeUserId) => ({
      judgeId: judgeUserId,
      judgeName: judgeNameById.get(judgeUserId) ?? judgeUserId,
      message: 'Este juez debe tener al menos una subcategoria seleccionada.',
    }));

const toUniqueSorted = (values: string[]) => Array.from(new Set(values)).sort();

export const useAdminJudgeAssignments = ({
  users,
  assignments,
  events,
  categories,
  subcategories,
  eventCategories,
  canManageJudgeAssignments,
  onAssignmentsSaved,
}: UseAdminJudgeAssignmentsParams) => {
  const {
    assignJudgeScope,
    removeJudgeScope,
    syncJudgeAssignments: syncJudgeAssignmentsRequest,
    createEventCategoryLink,
    removeEventCategoryLink,
  } = useAdminOperations();
  const clearError = useAdminStore((state) => state.clearError);

  const [selectedEventId, setSelectedEventId] = useState('');
  const [assignedJudgeIds, setAssignedJudgeIds] = useState<Set<string>>(new Set());
  const [judgeSubcategoryDraft, setJudgeSubcategoryDraftState] = useState<JudgeSubcategoryDraft>(
    {},
  );
  const [judgeScaleDraft, setJudgeScaleDraft] = useState<JudgeScaleDraft>({});
  const [scaleIdsByEventCategory, setScaleIdsByEventCategory] = useState<Record<string, string[]>>({});
  const [availableScales, setAvailableScales] = useState<Array<{ id: string; value: string }>>([]);
  const [scaleRefreshToken, setScaleRefreshToken] = useState(0);
  const [pendingAssignmentAction, setPendingAssignmentAction] = useState<string | null>(null);
  const [assignmentFeedback, setAssignmentFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [assignmentSyncReport, setAssignmentSyncReport] = useState<JudgeSyncReport | null>(null);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => {
      map.set(category.id, category.name);
    });
    subcategories.forEach((subcategory) => {
      map.set(subcategory.id, subcategory.name);
    });
    return map;
  }, [categories, subcategories]);

  const rootCategoryIds = useMemo(() => categories.map((category) => category.id), [categories]);

  const childrenByCategoryId = useMemo(() => {
    const map = new Map<string, string[]>();

    subcategories.forEach((subcategory) => {
      const current = map.get(subcategory.categoryId) ?? [];
      current.push(subcategory.id);
      map.set(subcategory.categoryId, current);
    });

    for (const [parentId, children] of map.entries()) {
      map.set(
        parentId,
        children.sort((left, right) =>
          (categoryNameById.get(left) ?? left).localeCompare(
            categoryNameById.get(right) ?? right,
          ),
        ),
      );
    }

    return map;
  }, [categoryNameById, subcategories]);

  const leafIdsByCategoryId = useMemo(() => {
    const cache = new Map<string, string[]>();

    const collectLeaves = (categoryId: string, ancestry: Set<string>): string[] => {
      if (cache.has(categoryId)) {
        return cache.get(categoryId) ?? [];
      }

      if (ancestry.has(categoryId)) {
        return [];
      }

      const children = childrenByCategoryId.get(categoryId) ?? [];
      if (children.length === 0) {
        cache.set(categoryId, [categoryId]);
        return [categoryId];
      }

      const nextAncestry = new Set(ancestry);
      nextAncestry.add(categoryId);
      const leaves = toUniqueSorted(
        children.flatMap((childId) => collectLeaves(childId, nextAncestry)),
      );
      cache.set(categoryId, leaves);
      return leaves;
    };

    rootCategoryIds.forEach((rootId) => {
      collectLeaves(rootId, new Set());
    });

    subcategories.forEach((subcategory) => {
      if (!cache.has(subcategory.id)) {
        collectLeaves(subcategory.id, new Set());
      }
    });

    return cache;
  }, [childrenByCategoryId, rootCategoryIds, subcategories]);

  const leafCategoryIdSet = useMemo(
    () =>
      new Set(
        [...leafIdsByCategoryId.entries()]
          .filter(([categoryId, leafIds]) => leafIds.length === 1 && leafIds[0] === categoryId)
          .map(([categoryId]) => categoryId),
      ),
    [leafIdsByCategoryId],
  );

  const eligibleJudges = useMemo(
    () =>
      users
        .filter((user) => user.roles.includes('JUEZ'))
        .sort((left, right) => left.name.localeCompare(right.name)),
    [users],
  );

  const judgeNameById = useMemo(
    () => new Map(eligibleJudges.map((judge) => [judge.id, judge.name] as const)),
    [eligibleJudges],
  );

  const availableEvents = useMemo(
    () => [...events].sort((left, right) => left.name.localeCompare(right.name)),
    [events],
  );

  useEffect(() => {
    if (availableEvents.length === 0) {
      if (selectedEventId) {
        setSelectedEventId('');
      }
      return;
    }

    const hasSelectedEvent = availableEvents.some((eventItem) => eventItem.id === selectedEventId);
    if (!hasSelectedEvent) {
      setSelectedEventId(availableEvents[0]?.id ?? '');
    }
  }, [availableEvents, selectedEventId]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedEventId) {
      setScaleIdsByEventCategory({});
      setAvailableScales([]);
      return () => undefined;
    }
    void adminEventsService.listEventCategoryScales(selectedEventId).then((response) => {
      if (cancelled) return;
      setAvailableScales(response.availableScales.map((scale) => ({ id: scale.id, value: scale.value })));
      setScaleIdsByEventCategory(
        Object.fromEntries(response.items.map((item) => [item.eventCategoryId, item.scaleIds])),
      );
    }).catch(() => {
      if (!cancelled) {
        setScaleIdsByEventCategory({});
        setAvailableScales([]);
      }
    });
    return () => { cancelled = true; };
  }, [scaleRefreshToken, selectedEventId]);

  const refreshAvailableScales = useCallback(() => {
    setScaleRefreshToken((current) => current + 1);
  }, []);

  const selectedEventCategories = useMemo(
    () => eventCategories.filter((entry) => entry.eventId === selectedEventId),
    [eventCategories, selectedEventId],
  );

  const selectedEventCategoryById = useMemo(
    () => new Map(selectedEventCategories.map((entry) => [entry.id, entry] as const)),
    [selectedEventCategories],
  );

  const selectedLeafCategoryIds = useMemo(() => {
    const normalized = new Set<string>();

    selectedEventCategories.forEach((entry) => {
      const leafIds = leafIdsByCategoryId.get(entry.categoryId) ?? [];
      leafIds.forEach((leafId) => {
        if (leafCategoryIdSet.has(leafId)) {
          normalized.add(leafId);
        }
      });
    });

    return Array.from(normalized).sort((left, right) =>
      (categoryNameById.get(left) ?? left).localeCompare(categoryNameById.get(right) ?? right),
    );
  }, [categoryNameById, leafCategoryIdSet, leafIdsByCategoryId, selectedEventCategories]);

  const selectedLeafCategorySet = useMemo(
    () => new Set(selectedLeafCategoryIds),
    [selectedLeafCategoryIds],
  );

  const selectedCategoryTree = useMemo<JudgeCategoryTreeNode[]>(() => {
    const buildNode = (
      nodeId: string,
      depth: number,
      ancestry: Set<string>,
      path: string[],
    ): JudgeCategoryTreeNode | null => {
      if (ancestry.has(nodeId)) {
        return null;
      }

      const nodeName = categoryNameById.get(nodeId) ?? nodeId;
      const nextPath = [...path, nodeName];
      const childIds = childrenByCategoryId.get(nodeId) ?? [];

      if (childIds.length === 0) {
        if (!selectedLeafCategorySet.has(nodeId)) {
          return null;
        }

        return {
          id: nodeId,
          name: nodeName,
          depth,
          isLeaf: true,
          pathLabel: nextPath.slice(1).join(' > ') || nodeName,
          leafIds: [nodeId],
          children: [],
        };
      }

      const nextAncestry = new Set(ancestry);
      nextAncestry.add(nodeId);

      const children = childIds
        .map((childId) => buildNode(childId, depth + 1, nextAncestry, nextPath))
        .filter((childNode): childNode is JudgeCategoryTreeNode => childNode !== null);

      if (children.length === 0) {
        return null;
      }

      return {
        id: nodeId,
        name: nodeName,
        depth,
        isLeaf: false,
        pathLabel: nextPath.slice(1).join(' > ') || nodeName,
        leafIds: toUniqueSorted(children.flatMap((childNode) => childNode.leafIds)),
        children,
      };
    };

    return rootCategoryIds
      .map((rootId) => buildNode(rootId, 1, new Set(), []))
      .filter((node): node is JudgeCategoryTreeNode => node !== null)
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [categoryNameById, childrenByCategoryId, rootCategoryIds, selectedLeafCategorySet]);

  const selectedLeafIdsByNodeId = useMemo(() => {
    const map = new Map<string, string[]>();

    const visit = (node: JudgeCategoryTreeNode) => {
      map.set(node.id, node.leafIds);
      node.children.forEach((childNode) => visit(childNode));
    };

    selectedCategoryTree.forEach((rootNode) => visit(rootNode));
    return map;
  }, [selectedCategoryTree]);

  const selectedLeafLabelById = useMemo(() => {
    const map = new Map<string, string>();

    const visit = (node: JudgeCategoryTreeNode, rootName: string) => {
      if (node.isLeaf) {
        map.set(node.id, `${rootName} > ${node.pathLabel}`);
        return;
      }
      node.children.forEach((childNode) => visit(childNode, rootName));
    };

    selectedCategoryTree.forEach((rootNode) => {
      visit(rootNode, rootNode.name);
    });

    return map;
  }, [selectedCategoryTree]);

  const selectedAssignableSubcategoryIds = useMemo(
    () => selectedCategoryTree.flatMap((node) => node.leafIds),
    [selectedCategoryTree],
  );

  const subcategoryToEventCategoryId = useMemo(
    () =>
      new Map(
        selectedEventCategories
          .filter((entry) => selectedLeafCategorySet.has(entry.categoryId))
          .map((entry) => [entry.categoryId, entry.id] as const),
      ),
    [selectedEventCategories, selectedLeafCategorySet],
  );

  const currentAssignedJudgeIds = useMemo(
    () => buildAssignedJudgeSet(assignments, selectedEventId || null),
    [assignments, selectedEventId],
  );

  const currentJudgeSubcategoryDraft = useMemo(() => {
    if (!selectedEventId) {
      return {};
    }

    const allowedSubcategorySet = new Set(selectedAssignableSubcategoryIds);
    const eventCategoryToCategory = new Map(
      eventCategories
        .filter((entry) => entry.eventId === selectedEventId)
        .map((entry) => [entry.id, entry.categoryId] as const),
    );

    const draft: JudgeSubcategoryDraft = {};
    for (const assignment of assignments) {
      if (assignment.eventId !== selectedEventId) {
        continue;
      }

      const subcategoryId = eventCategoryToCategory.get(assignment.eventCategoryId);
      if (!subcategoryId || !allowedSubcategorySet.has(subcategoryId)) {
        continue;
      }

      const current = new Set(draft[assignment.judgeUserId] ?? []);
      current.add(subcategoryId);
      draft[assignment.judgeUserId] = Array.from(current);
    }

    return draft;
  }, [assignments, eventCategories, selectedAssignableSubcategoryIds, selectedEventId]);

  const currentJudgeScaleDraft = useMemo(() => {
    const draft: JudgeScaleDraft = {};
    assignments.filter((assignment) => assignment.eventId === selectedEventId).forEach((assignment) => {
      draft[`${assignment.judgeUserId}::${assignment.eventCategoryId}`] = assignment.scaleIds ?? [];
    });
    return draft;
  }, [assignments, selectedEventId]);

  useEffect(() => {
    setAssignedJudgeIds(new Set(currentAssignedJudgeIds));
    setJudgeSubcategoryDraftState(currentJudgeSubcategoryDraft);
    setJudgeScaleDraft(currentJudgeScaleDraft);
    setAssignmentFeedback(null);
    setAssignmentSyncReport(null);
  }, [currentAssignedJudgeIds, currentJudgeScaleDraft, currentJudgeSubcategoryDraft, selectedEventId]);

  useEffect(() => {
    const allowedSubcategoryIds = new Set(selectedAssignableSubcategoryIds);
    setJudgeSubcategoryDraftState((prev) => {
      let changed = false;
      const next: JudgeSubcategoryDraft = {};

      for (const [judgeUserId, subcategoryIds] of Object.entries(prev)) {
        const filtered = toUniqueSorted(
          subcategoryIds.filter((subcategoryId) => allowedSubcategoryIds.has(subcategoryId)),
        );
        if (filtered.length > 0) {
          next[judgeUserId] = filtered;
        }
        if (filtered.length !== subcategoryIds.length) {
          changed = true;
        }
      }

      if (!changed && Object.keys(next).length === Object.keys(prev).length) {
        return prev;
      }

      return next;
    });
  }, [selectedAssignableSubcategoryIds]);

  useEffect(() => {
    const allowedJudgeIds = new Set(eligibleJudges.map((judge) => judge.id));
    setAssignedJudgeIds((prev) => {
      const next = new Set<string>();
      for (const judgeUserId of prev) {
        if (allowedJudgeIds.has(judgeUserId)) {
          next.add(judgeUserId);
        }
      }

      if (next.size === prev.size) {
        return prev;
      }
      return next;
    });
  }, [eligibleJudges]);

  const eventCurrentAssignments = useMemo(() => {
    if (!selectedEventId) {
      return [];
    }

    return assignments
      .filter((assignment) => assignment.eventId === selectedEventId)
      .map((assignment) => ({
        id: assignment.id,
        judgeUserId: assignment.judgeUserId,
        judgeName: judgeNameById.get(assignment.judgeUserId) ?? assignment.judgeUserId,
        eventCategoryId: assignment.eventCategoryId,
        scopeLabel:
          selectedEventCategoryById.get(assignment.eventCategoryId)?.name ??
          assignment.eventCategoryId,
      }))
      .sort((left, right) => {
        const byJudge = left.judgeName.localeCompare(right.judgeName);
        if (byJudge !== 0) return byJudge;
        return left.scopeLabel.localeCompare(right.scopeLabel);
      });
  }, [assignments, judgeNameById, selectedEventCategoryById, selectedEventId]);

  const judgeValidationIssues = useMemo(
    () => buildJudgeValidationIssues(assignedJudgeIds, judgeSubcategoryDraft, judgeNameById),
    [assignedJudgeIds, judgeSubcategoryDraft, judgeNameById],
  );

  const judgeSyncPreview = useMemo(() => {
    if (!selectedEventId) {
      return { added: 0, removed: 0, unchanged: 0 };
    }

    const diff = buildJudgeAssignmentDiff({
      existingAssignments: assignments
        .filter((assignment) => assignment.eventId === selectedEventId)
        .map((assignment) => ({
          id: assignment.id,
          judgeUserId: assignment.judgeUserId,
          eventCategoryId: assignment.eventCategoryId,
        })),
      assignedJudgeIds,
      selectionsByJudge: judgeSubcategoryDraft,
      subcategoryToEventCategoryId,
    });

    return {
      added: diff.toCreate.length,
      removed: diff.toRemove.length,
      unchanged: diff.unchanged,
    };
  }, [assignments, assignedJudgeIds, judgeSubcategoryDraft, selectedEventId, subcategoryToEventCategoryId]);

  const getJudgeNodeSelectionState = useCallback(
    (judgeUserId: string, nodeId: string): JudgeNodeSelectionState => {
      const leafIds = selectedLeafIdsByNodeId.get(nodeId) ?? [];
      if (leafIds.length === 0) {
        return {
          checked: false,
          indeterminate: false,
          selectedLeaves: 0,
          totalLeaves: 0,
        };
      }

      const selected = new Set(judgeSubcategoryDraft[judgeUserId] ?? []);
      const selectedLeaves = leafIds.filter((leafId) => selected.has(leafId)).length;

      return {
        checked: selectedLeaves === leafIds.length,
        indeterminate: selectedLeaves > 0 && selectedLeaves < leafIds.length,
        selectedLeaves,
        totalLeaves: leafIds.length,
      };
    },
    [judgeSubcategoryDraft, selectedLeafIdsByNodeId],
  );

  const executeAssignmentAction = async (
    actionKey: string,
    action: () => Promise<void>,
  ) => {
    setPendingAssignmentAction(actionKey);
    setAssignmentFeedback(null);
    clearError();

    try {
      await action();
      const latestError = useAdminStore.getState().error;
      if (latestError) {
        setAssignmentFeedback({
          type: 'error',
          message: latestError,
        });
        return false;
      }

      return true;
    } catch (error) {
      setAssignmentFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo completar la accion.',
      });
      return false;
    } finally {
      setPendingAssignmentAction((current) => (current === actionKey ? null : current));
    }
  };

  const assignJudgeToEventDraft = (judgeUserId: string) => {
    setAssignmentSyncReport(null);
    setAssignmentFeedback(null);
    setAssignedJudgeIds((prev) => {
      const next = new Set(prev);
      next.add(judgeUserId);
      return next;
    });
  };

  const setJudgeSubcategoryDraft = (judgeUserId: string, subcategoryIds: string[]) => {
    const allowedSubcategoryIds = new Set(selectedAssignableSubcategoryIds);
    const nextScopes = toUniqueSorted(
      subcategoryIds.filter((subcategoryId) => allowedSubcategoryIds.has(subcategoryId)),
    );
    setAssignmentSyncReport(null);
    setAssignmentFeedback(null);
    setJudgeSubcategoryDraftState((prev) => {
      const next = { ...prev };
      if (nextScopes.length === 0) {
        delete next[judgeUserId];
      } else {
        next[judgeUserId] = nextScopes;
      }
      return next;
    });
  };

  const getJudgeScaleIds = useCallback(
    (judgeUserId: string, subcategoryId: string) => {
      const eventCategoryId = subcategoryToEventCategoryId.get(subcategoryId);
      return eventCategoryId ? judgeScaleDraft[`${judgeUserId}::${eventCategoryId}`] ?? [] : [];
    },
    [judgeScaleDraft, subcategoryToEventCategoryId],
  );

  const toggleJudgeScale = (judgeUserId: string, subcategoryId: string, scaleId: string) => {
    const eventCategoryId = subcategoryToEventCategoryId.get(subcategoryId);
    if (!eventCategoryId) return;
    const key = `${judgeUserId}::${eventCategoryId}`;
    setAssignmentFeedback(null);
    setJudgeScaleDraft((prev) => {
      const selected = new Set(prev[key] ?? []);
      if (selected.has(scaleId)) selected.delete(scaleId); else selected.add(scaleId);
      return { ...prev, [key]: toUniqueSorted(Array.from(selected)) };
    });
  };

  const selectAllJudgeScales = (judgeUserId: string, subcategoryId: string) => {
    const eventCategoryId = subcategoryToEventCategoryId.get(subcategoryId);
    if (!eventCategoryId) return;
    setJudgeScaleDraft((prev) => ({
      ...prev,
      [`${judgeUserId}::${eventCategoryId}`]: [...(scaleIdsByEventCategory[eventCategoryId] ?? [])],
    }));
  };

  const getScaleSelectionState = useCallback(
    (judgeUserId: string, subcategoryId: string) => {
      const eventCategoryId = subcategoryToEventCategoryId.get(subcategoryId);
      const allowed = eventCategoryId ? scaleIdsByEventCategory[eventCategoryId] ?? [] : [];
      const selected = getJudgeScaleIds(judgeUserId, subcategoryId);
      return { allowedScaleIds: allowed, selectedScaleIds: selected };
    },
    [getJudgeScaleIds, scaleIdsByEventCategory, subcategoryToEventCategoryId],
  );

  const toggleJudgeCategoryNode = (judgeUserId: string, nodeId: string) => {
    const leafIds = selectedLeafIdsByNodeId.get(nodeId) ?? [];
    if (leafIds.length === 0) {
      return;
    }

    setAssignmentSyncReport(null);
    setAssignmentFeedback(null);
    setJudgeSubcategoryDraftState((prev) => {
      const allowed = new Set(selectedAssignableSubcategoryIds);
      const selected = new Set(prev[judgeUserId] ?? []);
      const allSelected = leafIds.every((leafId) => selected.has(leafId));

      leafIds.forEach((leafId) => {
        if (!allowed.has(leafId)) {
          return;
        }
        if (allSelected) {
          selected.delete(leafId);
        } else {
          selected.add(leafId);
        }
      });

      const next = { ...prev };
      const normalized = toUniqueSorted(Array.from(selected));
      if (normalized.length === 0) {
        delete next[judgeUserId];
      } else {
        next[judgeUserId] = normalized;
      }
      return next;
    });
  };

  const unassignJudgeFromEventDraft = (judgeUserId: string) => {
    setAssignmentSyncReport(null);
    setAssignmentFeedback(null);
    setAssignedJudgeIds((prev) => {
      const next = new Set(prev);
      next.delete(judgeUserId);
      return next;
    });
    setJudgeSubcategoryDraft(judgeUserId, []);
  };

  const normalizeEventLeafLinks = async (): Promise<EventCategoryOption[]> => {
    if (!selectedEventId) {
      return [];
    }

    const currentLinks = eventCategories.filter((entry) => entry.eventId === selectedEventId);
    if (currentLinks.length === 0) {
      return currentLinks;
    }

    const legacyNonLeafLinks = currentLinks.filter(
      (entry) => !leafCategoryIdSet.has(entry.categoryId),
    );

    if (legacyNonLeafLinks.length === 0) {
      return currentLinks;
    }

    const desiredLeafCategoryIds = new Set(
      currentLinks
        .filter((entry) => leafCategoryIdSet.has(entry.categoryId))
        .map((entry) => entry.categoryId),
    );

    legacyNonLeafLinks.forEach((entry) => {
      const leafIds = leafIdsByCategoryId.get(entry.categoryId) ?? [];
      leafIds.forEach((leafId) => {
        if (leafCategoryIdSet.has(leafId)) {
          desiredLeafCategoryIds.add(leafId);
        }
      });
    });

    const currentCategoryIds = new Set(currentLinks.map((entry) => entry.categoryId));
    const linksToCreate = Array.from(desiredLeafCategoryIds).filter(
      (categoryId) => !currentCategoryIds.has(categoryId),
    );

    const createdLinks: EventCategoryOption[] = [];
    for (const categoryId of linksToCreate) {
      const created = await createEventCategoryLink({
        eventId: selectedEventId,
        categoryId,
      });
      createdLinks.push(created);
    }

    for (const legacyLink of legacyNonLeafLinks) {
      await removeEventCategoryLink(legacyLink.id);
    }

    const removedLegacyIds = new Set(legacyNonLeafLinks.map((entry) => entry.id));
    return [
      ...currentLinks.filter((entry) => !removedLegacyIds.has(entry.id)),
      ...createdLinks,
    ];
  };

  const syncJudgeAssignments = async (): Promise<JudgeSyncReport> => {
    if (!selectedEventId) {
      return { created: 0, removed: 0, failedCreates: [], failedRemoves: [] };
    }

    const normalizedEventCategories = await normalizeEventLeafLinks();
    const effectiveMap = new Map(
      normalizedEventCategories.map((entry) => [entry.categoryId, entry.id] as const),
    );
    const desiredAssignments: Array<{ judgeUserId: string; eventCategoryId: string; scaleIds: string[] }> = [];
    const failedCreates: JudgeSyncReport['failedCreates'] = [];

    for (const judgeUserId of assignedJudgeIds) {
      for (const subcategoryId of judgeSubcategoryDraft[judgeUserId] ?? []) {
        const eventCategoryId = effectiveMap.get(subcategoryId);
        if (!eventCategoryId) {
          failedCreates.push({ judgeName: judgeNameById.get(judgeUserId) ?? judgeUserId, scopeName: subcategoryId, message: 'El alcance no esta disponible para este evento.' });
          continue;
        }
        const scaleIds = judgeScaleDraft[`${judgeUserId}::${eventCategoryId}`] ?? [];
        if (scaleIds.length === 0 && typeof syncJudgeAssignmentsRequest === 'function') {
          failedCreates.push({ judgeName: judgeNameById.get(judgeUserId) ?? judgeUserId, scopeName: selectedEventCategoryById.get(eventCategoryId)?.name ?? subcategoryId, message: 'Selecciona al menos una escala.' });
          continue;
        }
        desiredAssignments.push({ judgeUserId, eventCategoryId, scaleIds });
      }
    }

    if (failedCreates.length > 0) {
      const report = { created: 0, removed: 0, failedCreates, failedRemoves: [] };
      setAssignmentSyncReport(report);
      return report;
    }

    if (typeof syncJudgeAssignmentsRequest !== 'function') {
      for (const desired of desiredAssignments) {
        await assignJudgeScope({
          judgeUserId: desired.judgeUserId,
          eventId: selectedEventId,
          eventCategoryId: desired.eventCategoryId,
          ...(desired.scaleIds.length > 0 ? { scaleIds: desired.scaleIds } : {}),
        });
      }
      const desiredKeys = new Set(desiredAssignments.map((entry) => `${entry.judgeUserId}::${entry.eventCategoryId}`));
      for (const existing of assignments.filter((assignment) => assignment.eventId === selectedEventId)) {
        if (!desiredKeys.has(`${existing.judgeUserId}::${existing.eventCategoryId}`)) {
          await removeJudgeScope(existing.id);
        }
      }
      const report = { created: desiredAssignments.length, removed: 0, failedCreates: [], failedRemoves: [] };
      setAssignmentSyncReport(report);
      return report;
    }
    await syncJudgeAssignmentsRequest({ eventId: selectedEventId, assignments: desiredAssignments });
    const latestError = useAdminStore.getState().error;
    if (latestError) {
      const report = { created: 0, removed: 0, failedCreates: [{ judgeName: 'Asignaciones', scopeName: selectedEventId, message: latestError }], failedRemoves: [] };
      setAssignmentSyncReport(report);
      return report;
    }

    const existing = assignments.filter((assignment) => assignment.eventId === selectedEventId);
    const desiredKeys = new Set(desiredAssignments.map((entry) => `${entry.judgeUserId}::${entry.eventCategoryId}`));
    const report = {
      created: desiredAssignments.filter((entry) => !existing.some((current) => current.judgeUserId === entry.judgeUserId && current.eventCategoryId === entry.eventCategoryId)).length,
      removed: existing.filter((entry) => !desiredKeys.has(`${entry.judgeUserId}::${entry.eventCategoryId}`)).length,
      failedCreates: [],
      failedRemoves: [],
    };
    setAssignmentSyncReport(report);
    return report;
  };

  const handleSaveAssignments = async () => {
    if (!selectedEventId) {
      setAssignmentFeedback({
        type: 'error',
        message: 'Selecciona un evento para gestionar asignaciones.',
      });
      return;
    }

    if (!canManageJudgeAssignments) {
      setAssignmentFeedback({
        type: 'error',
        message: 'No tienes permisos para guardar asignaciones.',
      });
      return;
    }

    if (judgeValidationIssues.length > 0) {
      setAssignmentFeedback({
        type: 'error',
        message: `Hay ${judgeValidationIssues.length} juez(ces) asignado(s) sin subcategorias.`,
      });
      return;
    }

    let syncReport: JudgeSyncReport = {
      created: 0,
      removed: 0,
      failedCreates: [],
      failedRemoves: [],
    };
    const success = await executeAssignmentAction(
      `judge-assignment:sync:${selectedEventId}`,
      async () => {
        syncReport = await syncJudgeAssignments();
      },
    );
    if (!success) {
      return;
    }

    const failures = syncReport.failedCreates.length + syncReport.failedRemoves.length;
    if (failures > 0) {
      setAssignmentFeedback({
        type: 'error',
        message: `${failures} asignacion(es) fallaron; puedes reintentar.`,
      });
      return;
    }

    onAssignmentsSaved?.();
  };

  return {
    selectedEventId,
    setSelectedEventId,
    availableEvents,
    eligibleJudges,
    selectedCategoryTree,
    assignedJudgeIds,
    judgeSubcategoryDraft,
    setJudgeSubcategoryDraft,
    getJudgeNodeSelectionState,
    toggleJudgeCategoryNode,
    assignJudgeToEventDraft,
    unassignJudgeFromEventDraft,
    judgeValidationIssues,
    judgeSyncPreview,
    pendingAssignmentAction,
    assignmentFeedback,
    assignmentSyncReport,
    eventCurrentAssignments,
    availableScales,
    scaleIdsByEventCategory,
    refreshAvailableScales,
    getScaleSelectionState,
    toggleJudgeScale,
    selectAllJudgeScales,
    handleSaveAssignments,
  };
};
