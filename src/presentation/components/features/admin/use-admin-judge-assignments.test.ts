import { act, renderHook } from '@testing-library/react';
import type {
  CatalogEvent,
  EventCategoryOption,
  JudgeAssignmentScope,
} from '@/domain/admin/admin.types';
import { useAdminJudgeAssignments } from './use-admin-judge-assignments';

const assignJudgeScope = vi.fn();
const removeJudgeScope = vi.fn();
const clearError = vi.fn();

vi.mock('./use-admin-operations', () => ({
  useAdminOperations: () => ({
    assignJudgeScope,
    removeJudgeScope,
  }),
}));

vi.mock('@/presentation/stores/admin.store', () => ({
  useAdminStore: Object.assign(
    (selector: (state: { clearError: () => void; error: string | null }) => unknown) =>
      selector({ clearError, error: null }),
    {
      getState: () => ({ error: null }),
    },
  ),
}));

describe('useAdminJudgeAssignments', () => {
  const assignments: JudgeAssignmentScope[] = [
    {
      id: 'assign-1',
      judgeUserId: 'judge-1',
      eventId: 'event-1',
      eventCategoryId: 'event-cat-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const events: CatalogEvent[] = [
    {
      id: 'event-1',
      name: 'Evento Uno',
      status: 'ACTIVO',
    },
  ];

  const eventCategories: EventCategoryOption[] = [
    {
      id: 'event-cat-1',
      eventId: 'event-1',
      categoryId: 'cat-1',
      name: 'Categoria 1',
    },
    {
      id: 'event-cat-2',
      eventId: 'event-1',
      categoryId: 'cat-2',
      name: 'Categoria 2',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens modal and computes active/available scopes', () => {
    const { result } = renderHook(() =>
      useAdminJudgeAssignments({ assignments, events, eventCategories }),
    );

    act(() => {
      result.current.openJudgeAssignmentsModal({
        id: 'judge-1',
        name: 'Judge One',
        email: 'judge@example.com',
        roles: ['JUEZ'],
        verified: true,
      });
    });

    expect(result.current.judgeAssignmentModal?.userId).toBe('judge-1');
    expect(result.current.activeJudgeAssignments).toHaveLength(1);
    expect(result.current.activeJudgeAssignments[0]?.scopeName).toBe('Categoria 1');
    expect(result.current.availableEventCategories).toHaveLength(1);
    expect(result.current.availableEventCategories[0]?.id).toBe('event-cat-2');
  });

  it('assigns and removes scope', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() =>
      useAdminJudgeAssignments({ assignments, events, eventCategories }),
    );

    act(() => {
      result.current.openJudgeAssignmentsModal({
        id: 'judge-1',
        name: 'Judge One',
        email: 'judge@example.com',
        roles: ['JUEZ'],
        verified: true,
      });
      result.current.setSelectedEventCategoryId('event-cat-2');
    });

    await act(async () => {
      await result.current.handleAssignScope();
    });
    expect(assignJudgeScope).toHaveBeenCalledWith({
      judgeUserId: 'judge-1',
      eventId: 'event-1',
      eventCategoryId: 'event-cat-2',
    });

    await act(async () => {
      await result.current.handleRemoveScope('assign-1');
    });
    expect(confirmSpy).toHaveBeenCalled();
    expect(removeJudgeScope).toHaveBeenCalledWith('assign-1');
  });
});
