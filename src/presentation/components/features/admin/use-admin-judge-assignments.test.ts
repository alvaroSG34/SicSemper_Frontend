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
const clearError = vi.fn();

let latestError: string | null = null;

vi.mock('./use-admin-operations', () => ({
  useAdminOperations: () => ({
    assignJudgeScope,
    removeJudgeScope,
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

  const assignments: JudgeAssignmentScope[] = [
    {
      id: 'assign-1',
      judgeUserId: 'judge-1',
      eventId: 'event-1',
      eventCategoryId: 'event-sub-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'assign-2',
      judgeUserId: 'judge-2',
      eventId: 'event-2',
      eventCategoryId: 'event-2-sub-2',
      createdAt: '2026-01-01T00:00:00.000Z',
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
      id: 'sub-2',
      categoryId: 'cat-1',
      name: 'Subcategoria 2',
    },
  ];

  const eventCategories: EventCategoryOption[] = [
    {
      id: 'event-root-1',
      eventId: 'event-1',
      categoryId: 'cat-1',
      name: 'Categoria 1',
    },
    {
      id: 'event-sub-1',
      eventId: 'event-1',
      categoryId: 'sub-1',
      name: 'Categoria 1 > Subcategoria 1',
    },
    {
      id: 'event-sub-2',
      eventId: 'event-1',
      categoryId: 'sub-2',
      name: 'Categoria 1 > Subcategoria 2',
    },
    {
      id: 'event-2-root-1',
      eventId: 'event-2',
      categoryId: 'cat-1',
      name: 'Categoria 1',
    },
    {
      id: 'event-2-sub-1',
      eventId: 'event-2',
      categoryId: 'sub-1',
      name: 'Categoria 1 > Subcategoria 1',
    },
    {
      id: 'event-2-sub-2',
      eventId: 'event-2',
      categoryId: 'sub-2',
      name: 'Categoria 1 > Subcategoria 2',
    },
  ];

  const useHook = () =>
    useAdminJudgeAssignments({
      users,
      assignments,
      events,
      categories,
      subcategories,
      eventCategories,
      canManageJudgeAssignments: true,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    latestError = null;
    assignJudgeScope.mockResolvedValue(undefined);
    removeJudgeScope.mockResolvedValue(undefined);
  });

  it('loads event draft with assigned judges and subcategories', async () => {
    const { result } = renderHook(useHook);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.selectedEventId).toBe('event-1');
    expect(result.current.assignedJudgeIds.has('judge-1')).toBe(true);
    expect(result.current.judgeSubcategoryDraft['judge-1']).toEqual(['sub-1']);
    expect(result.current.selectedCategoryNodes).toHaveLength(1);
    expect(result.current.selectedCategoryNodes[0]?.subcategories).toHaveLength(2);
  });

  it('blocks save when an assigned judge has no selected subcategories', async () => {
    const { result } = renderHook(useHook);

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
    expect(removeJudgeScope).not.toHaveBeenCalled();
    expect(result.current.assignmentFeedback?.type).toBe('error');
    expect(result.current.assignmentFeedback?.message).toContain('sin subcategorias');
  });

  it('syncs create and remove diff against backend endpoints', async () => {
    const { result } = renderHook(useHook);

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.unassignJudgeFromEventDraft('judge-1');
      result.current.assignJudgeToEventDraft('judge-2');
      result.current.setJudgeSubcategoryDraft('judge-2', ['sub-2']);
    });

    await act(async () => {
      await result.current.handleSaveAssignments();
    });

    expect(assignJudgeScope).toHaveBeenCalledWith({
      judgeUserId: 'judge-2',
      eventId: 'event-1',
      eventCategoryId: 'event-sub-2',
    });
    expect(removeJudgeScope).toHaveBeenCalledWith('assign-1');
  });

  it('switches draft state when selecting another event', async () => {
    const { result } = renderHook(useHook);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.selectedEventId).toBe('event-1');
    expect(result.current.assignedJudgeIds.has('judge-1')).toBe(true);
    expect(result.current.judgeSubcategoryDraft['judge-1']).toEqual(['sub-1']);

    act(() => {
      result.current.setSelectedEventId('event-2');
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.selectedEventId).toBe('event-2');
    expect(result.current.assignedJudgeIds.has('judge-1')).toBe(false);
    expect(result.current.assignedJudgeIds.has('judge-2')).toBe(true);
    expect(result.current.judgeSubcategoryDraft['judge-2']).toEqual(['sub-2']);
  });
});
