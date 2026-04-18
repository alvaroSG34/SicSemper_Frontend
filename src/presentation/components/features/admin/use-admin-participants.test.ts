import { act, renderHook } from '@testing-library/react';
import type { User } from '@/domain/user/user.types';
import { useAdminParticipants } from './use-admin-participants';

const banParticipant = vi.fn();
const unbanParticipant = vi.fn();
const setParticipantVerified = vi.fn();

vi.mock('./use-admin-operations', () => ({
  useAdminOperations: () => ({
    banParticipant,
    unbanParticipant,
    setParticipantVerified,
  }),
}));

describe('useAdminParticipants', () => {
  const participantUser: User = {
    id: 'participant-1',
    name: 'Participante Uno',
    email: 'participant@example.com',
    ci: null,
    country: null,
    city: null,
    phone: null,
    status: 'ACTIVO',
    verified: false,
    birthDate: null,
    club: null,
    roles: ['PARTICIPANTE'],
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const adminUser: User = {
    id: 'admin-1',
    name: 'Admin Uno',
    email: 'admin@example.com',
    ci: null,
    country: null,
    city: null,
    phone: null,
    status: 'ACTIVO',
    verified: true,
    birthDate: null,
    club: null,
    roles: ['PARTICIPANTE', 'ADMIN'],
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setParticipantVerified.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('toggles verified after confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useAdminParticipants([participantUser]));

    await act(async () => {
      await result.current.handleSetParticipantVerified('participant-1', false);
    });

    expect(confirmSpy).toHaveBeenCalledWith(
      '¿Confirmas marcar esta cuenta como verificada?',
    );
    expect(setParticipantVerified).toHaveBeenCalledWith('participant-1', true);
    expect(result.current.actionFeedback).toEqual({
      type: 'success',
      message: 'Cuenta marcada como verificada.',
    });
  });

  it('does not call mutation when confirmation is cancelled', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { result } = renderHook(() => useAdminParticipants([participantUser]));

    await act(async () => {
      await result.current.handleSetParticipantVerified('participant-1', false);
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(setParticipantVerified).not.toHaveBeenCalled();
  });

  it('allows verification edit only for participant-only users', () => {
    const { result } = renderHook(() => useAdminParticipants([participantUser, adminUser]));

    expect(result.current.canEditParticipantVerification(participantUser)).toBe(true);
    expect(result.current.canEditParticipantVerification(adminUser)).toBe(false);
  });

  it('keeps detail modal open and syncs participant data after users refresh', () => {
    const { result, rerender } = renderHook(
      ({ users }) => useAdminParticipants(users),
      {
        initialProps: { users: [participantUser] },
      },
    );

    act(() => {
      result.current.setParticipantDetailModal(participantUser);
    });

    rerender({
      users: [{ ...participantUser, verified: true }],
    });

    expect(result.current.participantDetailModal?.verified).toBe(true);
  });
});
