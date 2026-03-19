import { describe, expect, it } from 'vitest';
import {
  mapAdminPermissionCodeToApiRequest,
  mapApiAdminPermissionEntry,
  mapApiSystemPermissionToAdminPermission,
} from './admin-permissions.mapper';

describe('admin-permissions.mapper', () => {
  it('maps system permission contract to domain permission', () => {
    const result = mapApiSystemPermissionToAdminPermission({
      id: 'perm-1',
      code: 'ADMIN_USERS_READ',
      name: 'Ver usuarios',
      description: null,
      assignedRoles: [{ code: 'ADMIN', name: 'Administrador' }],
      roleAssignmentsCount: 1,
      userAssignmentsCount: 4,
      createdAt: '2026-03-15T12:00:00.000Z',
      updatedAt: '2026-03-15T13:00:00.000Z',
    });

    expect(result).toEqual({
      id: 'perm-1',
      code: 'ADMIN_USERS_READ',
      name: 'Ver usuarios',
      description: null,
      assignedRoles: [{ code: 'ADMIN', name: 'Administrador' }],
      roleAssignmentsCount: 1,
      userAssignmentsCount: 4,
      createdAt: '2026-03-15T12:00:00.000Z',
      updatedAt: '2026-03-15T13:00:00.000Z',
    });
  });

  it('maps admin permission entry contract to domain entry', () => {
    const result = mapApiAdminPermissionEntry({
      code: 'ADMIN_USERS_WRITE',
      name: 'Administrar usuarios',
      description: 'Alta, baja y edicion',
      granted: true,
      grantedByRole: false,
      grantedDirectly: true,
      grantedAt: '2026-03-15T14:00:00.000Z',
      grantedBy: { id: 'actor-1', name: 'Superadmin' },
    });

    expect(result).toEqual({
      code: 'ADMIN_USERS_WRITE',
      name: 'Administrar usuarios',
      description: 'Alta, baja y edicion',
      granted: true,
      grantedByRole: false,
      grantedDirectly: true,
      grantedAt: '2026-03-15T14:00:00.000Z',
      grantedBy: { id: 'actor-1', name: 'Superadmin' },
    });
  });

  it('maps domain permission code to admin permission action request', () => {
    const result = mapAdminPermissionCodeToApiRequest('ADMIN_USERS_WRITE');

    expect(result).toEqual({
      permission: 'ADMIN_USERS_WRITE',
    });
  });
});
