import { act, renderHook } from '@testing-library/react';
import type {
  CatalogCategory,
  CatalogEvent,
  CatalogSubcategory,
  EventCategoryOption,
  JudgeAssignmentScope,
} from '@/domain/admin/admin.types';
import type { User } from '@/domain/user/user.types';
import { useAdminJudgeAssignments } from './use-admin-judge-assignments';

const assignJudgeScope = vi.fn();
const removeJudgeScope = vi.fn();
const createEventCategoryLink = vi.fn();
const removeEventCategoryLink = vi.fn();
const clearError = vi.fn();

let latestError: string | null = null;

vi.mock('./use-admin-operations', () => ({
  useAdminOperations: () => ({
    assignJudgeScope,
    removeJudgeScope,
    createEventCategoryLink,
    removeEventCategoryLink,
  }),
}));

vi.mock('@/presentation/stores/admin.store', () => ({
  useAdminStore: Object.assign(
    (selector: (state: { clearError: () => void; error: string | null }) => unknown) =>
      selector({ clearError, error: latestError }),
    {
      getState: () => ({ error: latestError }),
    },
  ),
}));

describe('useAdminJudgeAssignments', () => {
  const users: User[] = [
    {
      id: 'judge-1',
      name: 'Judge One',
      email: 'judge1@example.com',
      roles: ['JUEZ'],
      verified: true,
    },
    {
      id: 'judge-2',
      name: 'Judge Two',
      email: 'judge2@example.com',
      roles: ['JUEZ'],
      verified: true,
    },
  ];

  const events: CatalogEvent[] = [
    {
      id: 'event-1',
      name: 'Evento A',
      status: 'ACTIVO',
    },
    {
      id: 'event-2',
      name: 'Evento B',
      status: 'ACTIVO',
    },
  ];

  const categories: CatalogCategory[] = [
    {
      id: 'cat-1',
      name: 'Categoria 1',
      parentId: null,
    },
  ];

  const subcategories: CatalogSubcategory[] = [
    {
      id: 'sub-1',
      categoryId: 'cat-1',
      name: 'Subcategoria 1',
    },
    {
      id: 'leaf-1',
      categoryId: 'sub-1',
      name: 'Leaf 1',
    },
    {
      id: 'leaf-2',
      categoryId: 'sub-1',
      name: 'Leaf 2',
    },
  ];

  const defaultEventCategories: EventCategoryOption[] = [];
  const defaultAssignments: JudgeAssignmentScope[] = [];

  const useHook = (params?: {
    eventCategories?: EventCategoryOption[];
    assignments?: JudgeAssignmentScope[];
  }) =>
    useAdminJudgeAssignments({
      users,
      assignments: params?.assignments ?? defaultAssignments,
      events,
      categories,
      subcategories,
      eventCategories: params?.eventCategories ?? defaultEventCategories,
      canManageJudgeAssignments: true,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    latestError = null;
    assignJudgeScope.mockResolvedValue(undefined);
    removeJudgeScope.mockResolvedValue(undefined);
    removeEventCategoryLink.mockResolvedValue(undefined);
    createEventCategoryLink.mockImplementation(
      async ({ eventId, categoryId }: { eventId: string; categoryId: string }) => ({
        id: `ec-${categoryId}`,
        eventId,
        categoryId,
        name: categoryId,
      }),
    );
  });

  it('builds L1/L2/L3 tree and computes tri-state by judge', async () => {
    const eventCategories: EventCategoryOption[] = [
      {
        id: 'ec-leaf-1',
        eventId: 'event-1',
        categoryId: 'leaf-1',
        name: 'Categoria 1 > Subcategoria 1 > Leaf 1',
      },
      {
        id: 'ec-leaf-2',
        eventId: 'event-1',
        categoryId: 'leaf-2',
        name: 'Categoria 1 > Subcategoria 1 > Leaf 2',
      },
    ];

    const assignments: JudgeAssignmentScope[] = [
      {
        id: 'assign-1',
        judgeUserId: 'judge-1',
        eventId: 'event-1',
        eventCategoryId: 'ec-leaf-1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const { result } = renderHook(() => useHook({ eventCategories, assignments }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.selectedCategoryTree).toHaveLength(1);
    expect(result.current.selectedCategoryTree[0]?.children).toHaveLength(1);
    expect(result.current.selectedCategoryTree[0]?.children[0]?.children).toHaveLength(2);

    const subStateBefore = result.current.getJudgeNodeSelectionState('judge-1', 'sub-1');
    expect(subStateBefore.indeterminate).toBe(true);
    expect(subStateBefore.selectedLeaves).toBe(1);
    expect(subStateBefore.totalLeaves).toBe(2);

    act(() => {
      result.current.toggleJudgeCategoryNode('judge-1', 'sub-1');
    });

    const subStateAfter = result.current.getJudgeNodeSelectionState('judge-1', 'sub-1');
    expect(subStateAfter.checked).toBe(true);
    expect(result.current.judgeSubcategoryDraft['judge-1']).toEqual(['leaf-1', 'leaf-2']);
  });

  it('normalizes legacy non-leaf links before persisting judge assignments', async () => {
    const eventCategories: EventCategoryOption[] = [
      {
        id: 'ec-legacy-l2',
        eventId: 'event-1',
        categoryId: 'sub-1',
        name: 'Categoria 1 > Subcategoria 1',
      },
    ];

    createEventCategoryLink.mockImplementation(
      async ({ eventId, categoryId }: { eventId: string; categoryId: string }) => ({
        id: categoryId === 'leaf-1' ? 'ec-leaf-1' : 'ec-leaf-2',
        eventId,
        categoryId,
        name: categoryId,
      }),
    );

    const { result } = renderHook(() => useHook({ eventCategories }));

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.assignJudgeToEventDraft('judge-1');
      result.current.setJudgeSubcategoryDraft('judge-1', ['leaf-1']);
    });

    await act(async () => {
      await result.current.handleSaveAssignments();
    });

    expect(createEventCategoryLink).toHaveBeenCalledTimes(2);
    expect(createEventCategoryLink).toHaveBeenCalledWith({
      eventId: 'event-1',
      categoryId: 'leaf-1',
    });
    expect(createEventCategoryLink).toHaveBeenCalledWith({
      eventId: 'event-1',
      categoryId: 'leaf-2',
    });
    expect(removeEventCategoryLink).toHaveBeenCalledWith('ec-legacy-l2');

    expect(assignJudgeScope).toHaveBeenCalledWith({
      judgeUserId: 'judge-1',
      eventId: 'event-1',
      eventCategoryId: 'ec-leaf-1',
    });
  });

  it('blocks save when an assigned judge has no selected leaves', async () => {
    const eventCategories: EventCategoryOption[] = [
      {
        id: 'ec-leaf-1',
        eventId: 'event-1',
        categoryId: 'leaf-1',
        name: 'Categoria 1 > Subcategoria 1 > Leaf 1',
      },
    ];

    const { result } = renderHook(() => useHook({ eventCategories }));

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.assignJudgeToEventDraft('judge-2');
    });

    await act(async () => {
      await result.current.handleSaveAssignments();
    });

    expect(assignJudgeScope).not.toHaveBeenCalled();
    expect(result.current.assignmentFeedback?.type).toBe('error');
    expect(result.current.assignmentFeedback?.message).toContain('sin subcategorias');
  });

  it('switches draft state when selecting another event', async () => {
    const eventCategories: EventCategoryOption[] = [
      {
        id: 'ec-event-1-leaf-1',
        eventId: 'event-1',
        categoryId: 'leaf-1',
        name: 'Categoria 1 > Subcategoria 1 > Leaf 1',
      },
      {
        id: 'ec-event-2-leaf-2',
        eventId: 'event-2',
        categoryId: 'leaf-2',
        name: 'Categoria 1 > Subcategoria 1 > Leaf 2',
      },
    ];

    const assignments: JudgeAssignmentScope[] = [
      {
        id: 'assign-1',
        judgeUserId: 'judge-1',
        eventId: 'event-1',
        eventCategoryId: 'ec-event-1-leaf-1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'assign-2',
        judgeUserId: 'judge-2',
        eventId: 'event-2',
        eventCategoryId: 'ec-event-2-leaf-2',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const { result } = renderHook(() => useHook({ eventCategories, assignments }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.assignedJudgeIds.has('judge-1')).toBe(true);
    expect(result.current.judgeSubcategoryDraft['judge-1']).toEqual(['leaf-1']);

    act(() => {
      result.current.setSelectedEventId('event-2');
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.assignedJudgeIds.has('judge-1')).toBe(false);
    expect(result.current.assignedJudgeIds.has('judge-2')).toBe(true);
    expect(result.current.judgeSubcategoryDraft['judge-2']).toEqual(['leaf-2']);
  });
});
