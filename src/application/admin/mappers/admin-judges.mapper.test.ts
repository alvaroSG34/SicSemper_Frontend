import { describe, expect, it } from 'vitest';
import {
  mapApiJudgeUserToDomainUser,
  mapApiJudgeAssignmentToJudgeAssignmentScope,
  mapApiJudgePermissionEntry,
  mapAssignJudgeScopePayloadToApiRequest,
  mapJudgePermissionCodeToApiRequest,
} from './admin-judges.mapper';

describe('admin-judges.mapper', () => {
  it('maps judge user contract to domain user', () => {
    const result = mapApiJudgeUserToDomainUser({
      id: 'judge-1',
      name: 'Judge One',
      email: 'judge@example.com',
      ci: null,
      country: 'Bolivia',
      city: 'La Paz',
      phone: null,
      status: 'ACTIVO',
      verified: true,
      birthDate: null,
      club: null,
      roles: ['JUEZ'],
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    });

    expect(result).toEqual({
      id: 'judge-1',
      name: 'Judge One',
      email: 'judge@example.com',
      ci: null,
      country: 'Bolivia',
      city: 'La Paz',
      phone: null,
      status: 'ACTIVO',
      verified: true,
      birthDate: null,
      club: null,
      roles: ['JUEZ'],
      createdAt: '2026-03-16T00:00:00.000Z',
    });
  });

  it('maps judge assignment contract to domain scope', () => {
    const result = mapApiJudgeAssignmentToJudgeAssignmentScope({
      id: 'assignment-1',
      judgeUserId: 'judge-1',
      judgeName: 'Judge One',
      judgeRoles: ['JUEZ'],
      eventId: 'event-1',
      eventName: 'Event One',
      eventCategoryId: 'event-category-1',
      categoryId: 'category-1',
      categoryName: 'Bodybuilding',
      categoryParentId: null,
      categoryParentName: null,
      createdAt: '2026-03-16T12:00:00.000Z',
    });

    expect(result).toEqual({
      id: 'assignment-1',
      judgeUserId: 'judge-1',
      eventId: 'event-1',
      eventCategoryId: 'event-category-1',
      createdAt: '2026-03-16T12:00:00.000Z',
    });
  });

  it('maps assign scope payload to api request', () => {
    const result = mapAssignJudgeScopePayloadToApiRequest({
      judgeUserId: 'judge-1',
      eventId: 'event-1',
      eventCategoryId: 'event-category-1',
    });

    expect(result).toEqual({
      judgeUserId: 'judge-1',
      eventId: 'event-1',
      eventCategoryId: 'event-category-1',
    });
  });

  it('maps judge permission entry contract to domain entry', () => {
    const result = mapApiJudgePermissionEntry({
      code: 'JUDGE_REVIEW_START',
      granted: true,
      grantedByRole: false,
      grantedDirectly: true,
      grantedAt: '2026-03-16T12:00:00.000Z',
      grantedBy: { id: 'actor-1', name: 'Admin' },
    });

    expect(result).toEqual({
      code: 'JUDGE_REVIEW_START',
      granted: true,
      grantedByRole: false,
      grantedDirectly: true,
      grantedAt: '2026-03-16T12:00:00.000Z',
      grantedBy: { id: 'actor-1', name: 'Admin' },
    });
  });

  it('maps judge permission code to api request', () => {
    const result = mapJudgePermissionCodeToApiRequest('JUDGE_MODELS_READ');

    expect(result).toEqual({
      permission: 'JUDGE_MODELS_READ',
    });
  });
});
