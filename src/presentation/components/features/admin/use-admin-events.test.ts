import { act, renderHook } from '@testing-library/react';
import type { FormEvent } from 'react';
import type {
  AdminClub,
  CatalogCategory,
  CatalogEvent,
  CatalogSubcategory,
  EventCategoryOption,
  JudgeAssignmentScope,
} from '@/domain/admin/admin.types';
import { useAdminEvents } from './use-admin-events';

const createEventAndLinkCategories = vi.fn();
const updateEventAndLinkCategories = vi.fn();
const getEventDeleteImpact = vi.fn();
const removeEvent = vi.fn();
const clearError = vi.fn();

let latestError: string | null = null;

vi.mock('./use-admin-operations', () => ({
  useAdminOperations: () => ({
    createEventAndLinkCategories,
    updateEventAndLinkCategories,
    getEventDeleteImpact,
    removeEvent,
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

describe('useAdminEvents', () => {
  const clubs: AdminClub[] = [
    {
      id: 'club-1',
      name: 'Club Central',
      place: 'La Paz',
      contactEmail: 'club@example.com',
      members: 5,
    },
  ];

  const events: CatalogEvent[] = [
    {
      id: 'event-1',
      organizerClubId: 'club-1',
      name: 'Evento Uno',
      place: 'La Paz',
      startDate: '2026-05-10',
      endDate: '2026-05-11',
      status: 'ACTIVO',
      description: 'Evento principal',
    },
  ];

  const categories: CatalogCategory[] = [
    {
      id: 'cat-1',
      name: 'Categoria 1',
      parentId: null,
    },
    {
      id: 'cat-2',
      name: 'Categoria 2',
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
      categoryId: 'cat-2',
      name: 'Subcategoria 2',
    },
  ];

  const eventCategories: EventCategoryOption[] = [
    {
      id: 'ec-root-1',
      eventId: 'event-1',
      categoryId: 'cat-1',
      name: 'Categoria 1',
    },
    {
      id: 'ec-sub-1',
      eventId: 'event-1',
      categoryId: 'sub-1',
      name: 'Categoria 1 > Subcategoria 1',
    },
    {
      id: 'ec-root-2',
      eventId: 'event-1',
      categoryId: 'cat-2',
      name: 'Categoria 2',
    },
    {
      id: 'ec-sub-2',
      eventId: 'event-1',
      categoryId: 'sub-2',
      name: 'Categoria 2 > Subcategoria 2',
    },
  ];

  const assignments: JudgeAssignmentScope[] = [
    {
      id: 'assign-1',
      judgeUserId: 'judge-1',
      eventId: 'event-1',
      eventCategoryId: 'ec-sub-2',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const useHook = () =>
    useAdminEvents({
      events,
      clubs,
      categories,
      subcategories,
      eventCategories,
      assignments,
      canReadJudgeAssignments: true,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    latestError = null;
    createEventAndLinkCategories.mockResolvedValue(undefined);
    updateEventAndLinkCategories.mockResolvedValue(undefined);
    getEventDeleteImpact.mockResolvedValue(undefined);
    removeEvent.mockResolvedValue(undefined);
  });

  it('moves modal from step 1 to step 2 and saves event/category links without judge sync', async () => {
    const { result } = renderHook(useHook);

    act(() => {
      result.current.openEditEventModal(events[0]!);
    });

    expect(result.current.eventModalStep).toBe(1);

    await act(async () => {
      await result.current.handleSubmitEventModal({
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>);
    });

    expect(result.current.eventModalStep).toBe(2);

    await act(async () => {
      await result.current.handleFinalizeEventModal();
    });

    expect(updateEventAndLinkCategories).toHaveBeenCalledTimes(1);
    expect(updateEventAndLinkCategories).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'event-1',
        name: 'Evento Uno',
      }),
      expect.arrayContaining(['cat-1', 'sub-1', 'cat-2', 'sub-2']),
    );
    expect(createEventAndLinkCategories).not.toHaveBeenCalled();
  });

  it('computes implicit removals and affected judge assignments when categories are removed', () => {
    const { result } = renderHook(useHook);

    act(() => {
      result.current.openEditEventModal(events[0]!);
    });

    act(() => {
      result.current.toggleCategorySelection('cat-2');
    });

    expect(result.current.eventModalCategoryRemovalImpact.removedEventCategoryIds).toEqual(
      expect.arrayContaining(['ec-root-2', 'ec-sub-2']),
    );
    expect(result.current.eventModalCategoryRemovalImpact.removedEventCategoryIds).toHaveLength(2);
    expect(result.current.eventModalCategoryRemovalImpact.removedAssignmentsCount).toBe(1);
  });
});
