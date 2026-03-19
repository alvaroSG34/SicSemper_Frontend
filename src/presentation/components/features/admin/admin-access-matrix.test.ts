import { describe, expect, it } from 'vitest';
import {
  createAdminAccessMatrix,
  listAvailableAdminSections,
} from './admin-access-matrix';

describe('admin-access-matrix', () => {
  it('shows only base sections when read permissions are missing', () => {
    const matrix = createAdminAccessMatrix([], false);

    expect(listAvailableAdminSections(matrix)).toEqual(['inicio', 'ajustes']);
    expect(matrix.section.clubes).toBe(false);
    expect(matrix.module.clubs.read).toBe(false);
  });

  it('enables clubs section with ADMIN_CLUBS_READ', () => {
    const matrix = createAdminAccessMatrix(['ADMIN_CLUBS_READ'], false);

    expect(matrix.section.clubes).toBe(true);
    expect(matrix.module.clubs.read).toBe(true);
    expect(matrix.module.clubs.create).toBe(false);
  });

  it('enables judges section when at least one read permission is present', () => {
    const byAssignments = createAdminAccessMatrix(
      ['ADMIN_JUDGE_ASSIGNMENTS_READ'],
      false,
    );
    const byPermissions = createAdminAccessMatrix(
      ['ADMIN_JUDGE_PERMISSIONS_READ'],
      false,
    );

    expect(byAssignments.section.jueces).toBe(true);
    expect(byPermissions.section.jueces).toBe(true);
  });

  it('grants full access for superadmin', () => {
    const matrix = createAdminAccessMatrix(
      [
        'ADMIN_USERS_CREATE',
        'ADMIN_USERS_READ',
        'ADMIN_USERS_UPDATE',
        'ADMIN_USERS_DELETE',
        'ADMIN_CLUBS_CREATE',
        'ADMIN_CLUBS_READ',
        'ADMIN_CLUBS_UPDATE',
        'ADMIN_CLUBS_DELETE',
        'ADMIN_EVENTS_CREATE',
        'ADMIN_EVENTS_READ',
        'ADMIN_EVENTS_UPDATE',
        'ADMIN_EVENTS_DELETE',
        'ADMIN_CATEGORIES_CREATE',
        'ADMIN_CATEGORIES_READ',
        'ADMIN_CATEGORIES_UPDATE',
        'ADMIN_CATEGORIES_DELETE',
        'ADMIN_EVENT_CATEGORIES_CREATE',
        'ADMIN_EVENT_CATEGORIES_READ',
        'ADMIN_EVENT_CATEGORIES_UPDATE',
        'ADMIN_EVENT_CATEGORIES_DELETE',
        'ADMIN_JUDGE_ASSIGNMENTS_CREATE',
        'ADMIN_JUDGE_ASSIGNMENTS_READ',
        'ADMIN_JUDGE_ASSIGNMENTS_UPDATE',
        'ADMIN_JUDGE_ASSIGNMENTS_DELETE',
        'ADMIN_JUDGE_PERMISSIONS_CREATE',
        'ADMIN_JUDGE_PERMISSIONS_READ',
        'ADMIN_JUDGE_PERMISSIONS_UPDATE',
        'ADMIN_JUDGE_PERMISSIONS_DELETE',
        'ADMIN_ADMIN_PERMISSIONS_CREATE',
        'ADMIN_ADMIN_PERMISSIONS_READ',
        'ADMIN_ADMIN_PERMISSIONS_UPDATE',
        'ADMIN_ADMIN_PERMISSIONS_DELETE',
      ],
      true,
    );

    expect(listAvailableAdminSections(matrix)).toEqual([
      'inicio',
      'participantes',
      'eventos',
      'jueces',
      'clubes',
      'categorias',
      'admins',
      'permisos',
      'ajustes',
    ]);
    expect(matrix.module.events.delete).toBe(true);
    expect(matrix.module.clubs.create).toBe(true);
  });
});
