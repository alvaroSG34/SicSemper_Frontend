import { describe, expect, it } from 'vitest';
import {
  mapApiAdminManagedUserToDomainUser,
  mapCreateAdminPayloadToApiRequest,
} from './admin-admins.mapper';

describe('admin-admins.mapper', () => {
  it('maps create admin payload to api request', () => {
    const result = mapCreateAdminPayloadToApiRequest({
      name: 'Admin One',
      email: 'admin@example.com',
      password: 'secret123',
      birthDate: '1990-05-15',
      ci: '123456',
      country: 'Bolivia',
      city: 'La Paz',
      phone: '+59170000000',
      clubId: 'club-1',
    });

    expect(result).toEqual({
      name: 'Admin One',
      email: 'admin@example.com',
      password: 'secret123',
      birthDate: '1990-05-15',
      ci: '123456',
      country: 'Bolivia',
      city: 'La Paz',
      phone: '+59170000000',
      clubId: 'club-1',
    });
  });

  it('maps admin managed user contract to domain user', () => {
    const result = mapApiAdminManagedUserToDomainUser({
      id: 'user-1',
      name: 'Admin One',
      email: 'admin@example.com',
      ci: null,
      country: 'Bolivia',
      city: 'La Paz',
      phone: null,
      status: 'ACTIVO',
      verified: true,
      birthDate: null,
      club: null,
      roles: ['ADMIN'],
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    });

    expect(result).toEqual({
      id: 'user-1',
      name: 'Admin One',
      email: 'admin@example.com',
      photoUrl: null,
      ci: null,
      country: 'Bolivia',
      city: 'La Paz',
      phone: null,
      status: 'ACTIVO',
      verified: true,
      birthDate: null,
      club: null,
      roles: ['ADMIN'],
      createdAt: '2026-03-16T00:00:00.000Z',
    });
  });
});
