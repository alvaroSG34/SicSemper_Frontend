import { useEffect, useMemo, useState } from 'react';
import type {
  CatalogCategory,
  CatalogEvent,
  CatalogSubcategory,
  EventCategoryOption,
  JudgeAssignmentScope,
} from '@/domain/admin/admin.types';
import type { User } from '@/domain/user/user.types';
import { useAdminStore } from '@/presentation/stores/admin.store';
import { useAdminOperations } from './use-admin-operations';
import {
  buildAssignedJudgeSet,
  buildJudgeAssignmentDiff,
  type JudgeSubcategoryDraft,
} from './judge-assignment-tree.utils';

type CategoryNode = {
  id: string;
  name: string;
  subcategories: Array<{
    id: string;
    name: string;
  }>;
};

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

export const useAdminJudgeAssignments = ({
  users,
  assignments,
  events,
  categories,
  subcategories,
  eventCategories,
  canManageJudgeAssignments,
}: UseAdminJudgeAssignmentsParams) => {
  const { assignJudgeScope, removeJudgeScope } = useAdminOperations();
  const clearError = useAdminStore((state) => state.clearError);

  const [selectedEventId, setSelectedEventId] = useState('');
  const [assignedJudgeIds, setAssignedJudgeIds] = useState<Set<string>>(new Set());
  const [judgeSubcategoryDraft, setJudgeSubcategoryDraftState] = useState<JudgeSubcategoryDraft>(
    {},
  );
  const [pendingAssignmentAction, setPendingAssignmentAction] = useState<string | null>(null);
  const [assignmentFeedback, setAssignmentFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [assignmentSyncReport, setAssignmentSyncReport] = useState<JudgeSyncReport | null>(null);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category] as const)),
    [categories],
  );
  const subcategoryById = useMemo(
    () => new Map(subcategories.map((subcategory) => [subcategory.id, subcategory] as const)),
    [subcategories],
  );
  const subcategoriesByCategoryId = useMemo(() => {
    const map = new Map<string, CatalogSubcategory[]>();
    subcategories.forEach((subcategory) => {
      const current = map.get(subcategory.categoryId) ?? [];
      current.push(subcategory);
      map.set(subcategory.categoryId, current);
    });
    return map;
  }, [subcategories]);

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

  const selectedEventCategories = useMemo(
    () => eventCategories.filter((entry) => entry.eventId === selectedEventId),
    [eventCategories, selectedEventId],
  );

  const selectedEventCategoryById = useMemo(
    () => new Map(selectedEventCategories.map((entry) => [entry.id, entry] as const)),
    [selectedEventCategories],
  );

  const selectedCategoryNodes = useMemo<CategoryNode[]>(() => {
    const selectedCategoryIds = new Set(selectedEventCategories.map((entry) => entry.categoryId));
    const rootCategoryIds = new Set<string>();

    for (const categoryId of selectedCategoryIds) {
      const category = categoryById.get(categoryId);
      if (category && (category.parentId === null || category.parentId === undefined)) {
        rootCategoryIds.add(category.id);
        continue;
      }

      const subcategory = subcategoryById.get(categoryId);
      if (subcategory) {
        rootCategoryIds.add(subcategory.categoryId);
      }
    }

    return Array.from(rootCategoryIds)
      .map((rootCategoryId) => {
        const rootCategory = categoryById.get(rootCategoryId);
        const linkedSubcategories = (subcategoriesByCategoryId.get(rootCategoryId) ?? [])
          .filter((subcategory) => selectedCategoryIds.has(subcategory.id))
          .map((subcategory) => ({
            id: subcategory.id,
            name: subcategory.name,
          }))
          .sort((left, right) => left.name.localeCompare(right.name));

        return {
          id: rootCategoryId,
          name: rootCategory?.name ?? rootCategoryId,
          subcategories: linkedSubcategories,
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [categoryById, selectedEventCategories, subcategoriesByCategoryId, subcategoryById]);

  const selectedAssignableSubcategoryIds = useMemo(
    () =>
      selectedCategoryNodes.flatMap((category) =>
        category.subcategories.map((subcategory) => subcategory.id),
      ),
    [selectedCategoryNodes],
  );

  const subcategoryToEventCategoryId = useMemo(
    () =>
      new Map(
        selectedEventCategories
          .filter((entry) => subcategoryById.has(entry.categoryId))
          .map((entry) => [entry.categoryId, entry.id] as const),
      ),
    [selectedEventCategories, subcategoryById],
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

  useEffect(() => {
    setAssignedJudgeIds(new Set(currentAssignedJudgeIds));
    setJudgeSubcategoryDraftState(currentJudgeSubcategoryDraft);
    setAssignmentFeedback(null);
    setAssignmentSyncReport(null);
  }, [currentAssignedJudgeIds, currentJudgeSubcategoryDraft, selectedEventId]);

  useEffect(() => {
    const allowedSubcategoryIds = new Set(selectedAssignableSubcategoryIds);
    setJudgeSubcategoryDraftState((prev) => {
      let changed = false;
      const next: JudgeSubcategoryDraft = {};

      for (const [judgeUserId, subcategoryIds] of Object.entries(prev)) {
        const filtered = Array.from(
          new Set(subcategoryIds.filter((subcategoryId) => allowedSubcategoryIds.has(subcategoryId))),
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

  const executeAssignmentAction = async (
    actionKey: string,
    successMessage: string,
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

      setAssignmentFeedback({
        type: 'success',
        message: successMessage,
      });
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
    const nextScopes = Array.from(
      new Set(subcategoryIds.filter((subcategoryId) => allowedSubcategoryIds.has(subcategoryId))),
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

  const syncJudgeAssignments = async (): Promise<JudgeSyncReport> => {
    if (!selectedEventId) {
      return {
        created: 0,
        removed: 0,
        failedCreates: [],
        failedRemoves: [],
      };
    }

    const scopeLabelBySubcategoryId = new Map(
      selectedCategoryNodes.flatMap((category) =>
        category.subcategories.map((subcategory) => [
          subcategory.id,
          `${category.name} > ${subcategory.name}`,
        ] as const),
      ),
    );
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

    const failedCreates: JudgeSyncReport['failedCreates'] = diff.missingSubcategories.map(
      (missing) => ({
        judgeName: judgeNameById.get(missing.judgeUserId) ?? missing.judgeUserId,
        scopeName:
          scopeLabelBySubcategoryId.get(missing.subcategoryId) ?? missing.subcategoryId,
        message: 'El alcance no esta disponible para este evento.',
      }),
    );
    const failedRemoves: JudgeSyncReport['failedRemoves'] = [];

    let created = 0;
    let removed = 0;

    for (const createItem of diff.toCreate) {
      clearError();
      await assignJudgeScope({
        judgeUserId: createItem.judgeUserId,
        eventId: selectedEventId,
        eventCategoryId: createItem.eventCategoryId,
      });
      const opError = useAdminStore.getState().error;
      if (opError) {
        failedCreates.push({
          judgeName: judgeNameById.get(createItem.judgeUserId) ?? createItem.judgeUserId,
          scopeName:
            scopeLabelBySubcategoryId.get(createItem.subcategoryId) ?? createItem.subcategoryId,
          message: opError,
        });
      } else {
        created += 1;
      }
    }

    for (const removeItem of diff.toRemove) {
      clearError();
      await removeJudgeScope(removeItem.id);
      const opError = useAdminStore.getState().error;
      if (opError) {
        failedRemoves.push({
          judgeName: judgeNameById.get(removeItem.judgeUserId) ?? removeItem.judgeUserId,
          scopeName:
            selectedEventCategoryById.get(removeItem.eventCategoryId)?.name ??
            removeItem.eventCategoryId,
          message: opError,
        });
      } else {
        removed += 1;
      }
    }

    clearError();
    const report: JudgeSyncReport = {
      created,
      removed,
      failedCreates,
      failedRemoves,
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
      'Asignaciones guardadas correctamente.',
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
    }
  };

  return {
    selectedEventId,
    setSelectedEventId,
    availableEvents,
    eligibleJudges,
    selectedCategoryNodes,
    assignedJudgeIds,
    judgeSubcategoryDraft,
    setJudgeSubcategoryDraft,
    assignJudgeToEventDraft,
    unassignJudgeFromEventDraft,
    judgeValidationIssues,
    judgeSyncPreview,
    pendingAssignmentAction,
    assignmentFeedback,
    assignmentSyncReport,
    eventCurrentAssignments,
    handleSaveAssignments,
  };
};
