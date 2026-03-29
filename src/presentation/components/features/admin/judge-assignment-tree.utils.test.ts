import {
  buildAssignedJudgeSet,
  buildJudgeAssignmentDiff,
  computeCategoryCheckedState,
  toggleCategoryAllSubcategories,
  type JudgeSubcategoryDraft,
} from './judge-assignment-tree.utils';

describe('judge-assignment-tree.utils', () => {
  it('buildAssignedJudgeSet returns judges assigned to the target event', () => {
    const assigned = buildAssignedJudgeSet(
      [
        {
          id: 'a-1',
          judgeUserId: 'judge-1',
          eventId: 'event-1',
          eventCategoryId: 'ec-1',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'a-2',
          judgeUserId: 'judge-2',
          eventId: 'event-2',
          eventCategoryId: 'ec-2',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      'event-1',
    );

    expect(Array.from(assigned)).toEqual(['judge-1']);
  });

  it('toggleCategoryAllSubcategories toggles all subcategories as a block', () => {
    const selected = new Set<string>(['sub-1']);
    const toggledOn = toggleCategoryAllSubcategories(selected, ['sub-1', 'sub-2']);
    expect(Array.from(toggledOn).sort()).toEqual(['sub-1', 'sub-2']);

    const toggledOff = toggleCategoryAllSubcategories(toggledOn, ['sub-1', 'sub-2']);
    expect(Array.from(toggledOff)).toEqual([]);
  });

  it('computeCategoryCheckedState marks checked only when at least one subcategory is selected', () => {
    const none = computeCategoryCheckedState(new Set<string>(), ['sub-1', 'sub-2']);
    expect(none.checked).toBe(false);
    expect(none.indeterminate).toBe(false);

    const partial = computeCategoryCheckedState(new Set<string>(['sub-1']), ['sub-1', 'sub-2']);
    expect(partial.checked).toBe(true);
    expect(partial.indeterminate).toBe(true);

    const full = computeCategoryCheckedState(new Set<string>(['sub-1', 'sub-2']), ['sub-1', 'sub-2']);
    expect(full.checked).toBe(true);
    expect(full.indeterminate).toBe(false);
  });

  it('buildJudgeAssignmentDiff computes create/remove/unchanged sets', () => {
    const selectionsByJudge: JudgeSubcategoryDraft = {
      'judge-1': ['sub-1'],
      'judge-2': ['sub-2'],
    };

    const diff = buildJudgeAssignmentDiff({
      existingAssignments: [
        { id: 'a-1', judgeUserId: 'judge-1', eventCategoryId: 'ec-1' },
        { id: 'a-2', judgeUserId: 'judge-3', eventCategoryId: 'ec-3' },
      ],
      assignedJudgeIds: new Set(['judge-1', 'judge-2']),
      selectionsByJudge,
      subcategoryToEventCategoryId: new Map([
        ['sub-1', 'ec-1'],
        ['sub-2', 'ec-2'],
      ]),
    });

    expect(diff.toCreate).toEqual([
      { judgeUserId: 'judge-2', eventCategoryId: 'ec-2', subcategoryId: 'sub-2' },
    ]);
    expect(diff.toRemove).toEqual([{ id: 'a-2', judgeUserId: 'judge-3', eventCategoryId: 'ec-3' }]);
    expect(diff.unchanged).toBe(1);
    expect(diff.missingSubcategories).toEqual([]);
  });

  it('buildJudgeAssignmentDiff reports missing subcategory mappings', () => {
    const diff = buildJudgeAssignmentDiff({
      existingAssignments: [],
      assignedJudgeIds: new Set(['judge-1']),
      selectionsByJudge: { 'judge-1': ['sub-missing'] },
      subcategoryToEventCategoryId: new Map(),
    });

    expect(diff.toCreate).toEqual([]);
    expect(diff.missingSubcategories).toEqual([
      { judgeUserId: 'judge-1', subcategoryId: 'sub-missing' },
    ]);
  });
});
