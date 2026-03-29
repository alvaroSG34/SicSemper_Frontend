import type { JudgeAssignmentScope } from '@/domain/admin/admin.types';

export type JudgeSubcategoryDraft = Record<string, string[]>;

export type JudgeAssignmentDiffCreateItem = {
  judgeUserId: string;
  eventCategoryId: string;
  subcategoryId: string;
};

export type JudgeAssignmentDiffRemoveItem = {
  id: string;
  judgeUserId: string;
  eventCategoryId: string;
};

export type JudgeAssignmentDiffResult = {
  toCreate: JudgeAssignmentDiffCreateItem[];
  toRemove: JudgeAssignmentDiffRemoveItem[];
  unchanged: number;
  missingSubcategories: Array<{
    judgeUserId: string;
    subcategoryId: string;
  }>;
};

export const buildAssignedJudgeSet = (
  assignments: JudgeAssignmentScope[],
  eventId: string | null,
): Set<string> => {
  if (!eventId) {
    return new Set();
  }

  return new Set(
    assignments
      .filter((assignment) => assignment.eventId === eventId)
      .map((assignment) => assignment.judgeUserId),
  );
};

export const toggleCategoryAllSubcategories = (
  selectedSubcategoryIds: Set<string>,
  categorySubcategoryIds: string[],
): Set<string> => {
  const next = new Set(selectedSubcategoryIds);
  if (categorySubcategoryIds.length === 0) {
    return next;
  }

  const allSelected = categorySubcategoryIds.every((subcategoryId) => next.has(subcategoryId));
  for (const subcategoryId of categorySubcategoryIds) {
    if (allSelected) {
      next.delete(subcategoryId);
    } else {
      next.add(subcategoryId);
    }
  }

  return next;
};

export const computeCategoryCheckedState = (
  selectedSubcategoryIds: Set<string>,
  categorySubcategoryIds: string[],
) => {
  const total = categorySubcategoryIds.length;
  const selectedCount = categorySubcategoryIds.filter((subcategoryId) =>
    selectedSubcategoryIds.has(subcategoryId),
  ).length;

  return {
    checked: selectedCount > 0,
    indeterminate: selectedCount > 0 && selectedCount < total,
    selectedCount,
    total,
  };
};

const toUniqueSorted = (values: string[]) => Array.from(new Set(values)).sort();

export const buildJudgeAssignmentDiff = (params: {
  existingAssignments: Array<{
    id: string;
    judgeUserId: string;
    eventCategoryId: string;
  }>;
  assignedJudgeIds: Set<string>;
  selectionsByJudge: JudgeSubcategoryDraft;
  subcategoryToEventCategoryId: Map<string, string>;
}): JudgeAssignmentDiffResult => {
  const {
    existingAssignments,
    assignedJudgeIds,
    selectionsByJudge,
    subcategoryToEventCategoryId,
  } = params;

  const desiredKeys = new Set<string>();
  const existingKeys = new Set(
    existingAssignments.map((assignment) => `${assignment.judgeUserId}::${assignment.eventCategoryId}`),
  );
  const missingSubcategories = new Map<string, { judgeUserId: string; subcategoryId: string }>();
  const toCreate: JudgeAssignmentDiffCreateItem[] = [];

  for (const judgeUserId of assignedJudgeIds) {
    const selectedSubcategories = toUniqueSorted(selectionsByJudge[judgeUserId] ?? []);
    for (const subcategoryId of selectedSubcategories) {
      const eventCategoryId = subcategoryToEventCategoryId.get(subcategoryId);
      if (!eventCategoryId) {
        missingSubcategories.set(`${judgeUserId}::${subcategoryId}`, {
          judgeUserId,
          subcategoryId,
        });
        continue;
      }

      const key = `${judgeUserId}::${eventCategoryId}`;
      desiredKeys.add(key);
      if (!existingKeys.has(key)) {
        toCreate.push({
          judgeUserId,
          eventCategoryId,
          subcategoryId,
        });
      }
    }
  }

  const toRemove = existingAssignments.filter(
    (assignment) => !desiredKeys.has(`${assignment.judgeUserId}::${assignment.eventCategoryId}`),
  );

  let unchanged = 0;
  for (const key of desiredKeys) {
    if (existingKeys.has(key)) {
      unchanged += 1;
    }
  }

  return {
    toCreate,
    toRemove,
    unchanged,
    missingSubcategories: Array.from(missingSubcategories.values()),
  };
};
