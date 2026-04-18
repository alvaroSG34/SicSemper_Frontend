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
      id: 'leaf-1',
      categoryId: 'sub-1',
      name: 'Leaf 1',
    },
    {
      id: 'leaf-2',
      categoryId: 'sub-1',
      name: 'Leaf 2',
    },
    {
      id: 'leaf-3',
      categoryId: 'cat-1',
      name: 'Leaf 3',
    },
    {
      id: 'sub-2',
      categoryId: 'cat-2',
      name: 'Subcategoria 2',
    },
  ];

  const eventCategories: EventCategoryOption[] = [
    {
      id: 'ec-legacy-root',
      eventId: 'event-1',
      categoryId: 'cat-1',
      name: 'Categoria 1',
    },
    {
      id: 'ec-legacy-l2',
      eventId: 'event-1',
      categoryId: 'sub-1',
      name: 'Categoria 1 > Subcategoria 1',
    },
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

  it('preloads exact leaves from existing links (including legacy non-leaf links) and saves only leaves', async () => {
    const { result } = renderHook(useHook);

    act(() => {
      result.current.openEditEventModal(events[0]!);
    });

    expect(result.current.eventModalSelectedLeafIds.has('leaf-1')).toBe(true);
    expect(result.current.eventModalSelectedLeafIds.has('leaf-2')).toBe(true);
    expect(result.current.eventModalSelectedLeafIds.has('leaf-3')).toBe(true);
    expect(result.current.eventModalSelectedLeafIds.has('sub-2')).toBe(true);

    await act(async () => {
      await result.current.handleSubmitEventModal({
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>);
    });

    await act(async () => {
      await result.current.handleFinalizeEventModal();
    });

    expect(updateEventAndLinkCategories).toHaveBeenCalledTimes(1);
    expect(updateEventAndLinkCategories).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'event-1',
        name: 'Evento Uno',
        startDate: '2026-05-10T04:00:00.000Z',
        endDate: '2026-05-11T04:00:00.000Z',
      }),
      expect.arrayContaining(['leaf-1', 'leaf-2', 'leaf-3', 'sub-2']),
    );
  });

  it('supports parent toggles and tri-state behavior with exact leaf selections', () => {
    const { result } = renderHook(useHook);

    act(() => {
      result.current.openCreateEventModal();
      result.current.toggleCategorySelection('sub-1');
    });

    expect(result.current.eventModalSelectedLeafIds.has('leaf-1')).toBe(true);
    expect(result.current.eventModalSelectedLeafIds.has('leaf-2')).toBe(true);
    expect(result.current.eventModalSelectedLeafIds.has('leaf-3')).toBe(false);

    const rootStateAfterL2Toggle = result.current.getCategoryNodeSelectionState('cat-1');
    expect(rootStateAfterL2Toggle.indeterminate).toBe(true);
    expect(rootStateAfterL2Toggle.selectedLeaves).toBe(2);
    expect(rootStateAfterL2Toggle.totalLeaves).toBe(3);

    act(() => {
      result.current.toggleCategorySelection('cat-1');
    });

    const rootStateAfterRootToggle = result.current.getCategoryNodeSelectionState('cat-1');
    expect(rootStateAfterRootToggle.checked).toBe(true);
    expect(result.current.eventModalSelectedLeafIds.has('leaf-3')).toBe(true);

    act(() => {
      result.current.toggleCategorySelection('cat-1');
    });

    const rootStateAfterSecondRootToggle = result.current.getCategoryNodeSelectionState('cat-1');
    expect(rootStateAfterSecondRootToggle.checked).toBe(false);
    expect(rootStateAfterSecondRootToggle.selectedLeaves).toBe(0);
  });

  it('computes removals against exact desired leaves and preserves assignment impact', () => {
    const { result } = renderHook(useHook);

    act(() => {
      result.current.openEditEventModal(events[0]!);
      result.current.toggleCategorySelection('sub-2');
    });

    expect(result.current.eventModalCategoryRemovalImpact.removedEventCategoryIds).toEqual(
      expect.arrayContaining(['ec-legacy-root', 'ec-legacy-l2', 'ec-sub-2']),
    );
    expect(result.current.eventModalCategoryRemovalImpact.removedEventCategoryIds).toHaveLength(3);
    expect(result.current.eventModalCategoryRemovalImpact.removedAssignmentsCount).toBe(1);
  });

  it('requires end date/time to be equal or after start date/time', async () => {
    const { result } = renderHook(useHook);

    act(() => {
      result.current.openEditEventModal(events[0]!);
      result.current.setEventForm((prev) => ({
        ...prev,
        startDate: '2026-05-12',
        startTime: '10:30',
        endDate: '2026-05-12',
        endTime: '09:45',
      }));
    });

    await act(async () => {
      await result.current.handleSubmitEventModal({
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>);
    });

    expect(result.current.eventModalStep).toBe(1);
    expect(result.current.eventModalError).toBe(
      'La fecha y hora de inicio no puede ser mayor que la fecha y hora de fin.',
    );
  });
});
