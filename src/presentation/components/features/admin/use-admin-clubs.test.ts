import { act, renderHook } from '@testing-library/react';
import type { AdminClub } from '@/domain/admin/admin.types';
import { useAdminClubs } from './use-admin-clubs';

const createClub = vi.fn();
const updateClub = vi.fn();
const getClubDeleteImpact = vi.fn();
const removeClub = vi.fn();

vi.mock('./use-admin-operations', () => ({
  useAdminOperations: () => ({
    createClub,
    updateClub,
    getClubDeleteImpact,
    removeClub,
  }),
}));

describe('useAdminClubs', () => {
  const clubs: AdminClub[] = [
    {
      id: 'club-1',
      name: 'Alpha Team',
      place: 'La Paz',
      contactEmail: 'alpha@club.com',
      description: 'A',
      logoUrl: null,
      members: 3,
    },
    {
      id: 'club-2',
      name: 'Bravo Squad',
      place: 'Cochabamba',
      contactEmail: 'bravo@club.com',
      description: 'B',
      logoUrl: null,
      members: 5,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters clubs by search text', () => {
    const { result } = renderHook(() => useAdminClubs(clubs));

    expect(result.current.filteredClubs).toHaveLength(2);

    act(() => {
      result.current.setClubSearch('bravo');
    });

    expect(result.current.filteredClubs).toHaveLength(1);
    expect(result.current.filteredClubs[0]?.id).toBe('club-2');
  });

  it('opens create modal and resets form', () => {
    const { result } = renderHook(() => useAdminClubs(clubs));

    act(() => {
      result.current.openCreateClubModal();
    });

    expect(result.current.clubModalMode).toBe('create');
    expect(result.current.clubForm).toEqual({
      name: '',
      place: '',
      contactEmail: '',
      description: '',
      logoUrl: '',
    });
  });
});

