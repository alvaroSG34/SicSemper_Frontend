import { act, renderHook } from '@testing-library/react';
import type { JudgeAssignmentScope } from '@/domain/admin/admin.types';
import type { User } from '@/domain/user/user.types';
import { useAdminJudges } from './use-admin-judges';

const promoteToJudge = vi.fn();
const demoteJudge = vi.fn();
const createJudge = vi.fn();
const clearError = vi.fn();

vi.mock('./use-admin-operations', () => ({
  useAdminOperations: () => ({
    promoteToJudge,
    demoteJudge,
    createJudge,
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

describe('useAdminJudges', () => {
  const users: User[] = [
    {
      id: 'user-judge',
      name: 'Judge One',
      email: 'judge@example.com',
      ci: null,
      country: null,
      city: null,
      phone: null,
      status: 'ACTIVO',
      verified: true,
      birthDate: null,
      club: null,
      roles: ['JUEZ'],
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'user-participant',
      name: 'Participant One',
      email: 'participant@example.com',
      ci: null,
      country: null,
      city: null,
      phone: null,
      status: 'ACTIVO',
      verified: true,
      birthDate: null,
      club: null,
      roles: ['PARTICIPANTE'],
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const assignments: JudgeAssignmentScope[] = [
    {
      id: 'assign-1',
      judgeUserId: 'user-judge',
      eventId: 'event-1',
      eventCategoryId: 'event-category-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    createJudge.mockResolvedValue(undefined);
  });

  it('filters judges by search', () => {
    const { result } = renderHook(() => useAdminJudges({ users, assignments }));

    expect(result.current.judgeUsers).toHaveLength(1);
    expect(result.current.filteredJudgeUsers[0]?.id).toBe('user-judge');

    act(() => {
      result.current.setJudgeSearch('missing');
    });

    expect(result.current.filteredJudgeUsers).toHaveLength(0);
  });

  it('opens add judge modal and resets selection', () => {
    const { result } = renderHook(() => useAdminJudges({ users, assignments }));

    act(() => {
      result.current.openAddJudgeModal();
    });

    expect(clearError).toHaveBeenCalled();
    expect(result.current.addJudgeModalOpen).toBe(true);
    expect(result.current.addJudgeSelectedUserId).toBe('');
    expect(result.current.filteredNonJudgeUsers).toHaveLength(1);
    expect(result.current.filteredNonJudgeUsers[0]?.id).toBe('user-participant');
  });

  it('creates a new judge user', async () => {
    const { result } = renderHook(() => useAdminJudges({ users, assignments }));

    act(() => {
      result.current.openCreateJudgeModal();
      result.current.setCreateJudgeForm((prev) => ({
        ...prev,
        name: 'Nuevo Juez',
        email: 'nuevo-juez@example.com',
        password: 'password123',
      }));
    });

    await act(async () => {
      await result.current.handleCreateJudge();
    });

    expect(createJudge).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Nuevo Juez',
        email: 'nuevo-juez@example.com',
      }),
    );
  });
});
