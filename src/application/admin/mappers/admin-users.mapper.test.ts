import { describe, expect, it } from 'vitest';
import { mapApiAdminDashboardUserToDomainUser } from './admin-users.mapper';

describe('admin-users.mapper', () => {
  it('maps admin dashboard user contract to domain user', () => {
    const result = mapApiAdminDashboardUserToDomainUser({
      id: 'user-1',
      name: 'Usuario Uno',
      email: 'user@example.com',
      ci: null,
      country: 'Bolivia',
      city: 'La Paz',
      phone: null,
      status: 'ACTIVO',
      verified: true,
      birthDate: null,
      club: { id: 'club-1', name: 'Club Uno' },
      roles: ['PARTICIPANTE'],
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    });

    expect(result).toEqual({
      id: 'user-1',
      name: 'Usuario Uno',
      email: 'user@example.com',
      ci: null,
      country: 'Bolivia',
      city: 'La Paz',
      phone: null,
      status: 'ACTIVO',
      verified: true,
      birthDate: null,
      club: { id: 'club-1', name: 'Club Uno' },
      roles: ['PARTICIPANTE'],
      createdAt: '2026-03-16T00:00:00.000Z',
    });
  });
});
