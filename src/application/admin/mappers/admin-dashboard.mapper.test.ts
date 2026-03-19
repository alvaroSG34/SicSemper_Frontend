import { describe, expect, it } from 'vitest';
import type { ApiAdminDashboardResponse } from '../contracts/admin-dashboard.contract';
import {
  buildCatalogFromApiAdminDashboard,
  mapApiAdminDashboardActivityToActivityLogItem,
  mapApiAdminDashboardClubToAdminClub,
} from './admin-dashboard.mapper';

const dashboardFixture = (): ApiAdminDashboardResponse => ({
  kpis: {
    activeUsers: 5,
    activeEvents: 2,
    openIncidents: 1,
    registeredModels: 10,
  },
  effectivePermissions: ['ADMIN_DASHBOARD_READ'],
  users: [
    {
      id: 'user-1',
      name: 'User One',
      email: 'user1@example.com',
      ci: null,
      country: null,
      city: null,
      phone: null,
      status: 'ACTIVO',
      verified: true,
      birthDate: null,
      club: { id: 'club-1', name: 'Club Uno' },
      roles: ['PARTICIPANTE'],
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    },
    {
      id: 'user-2',
      name: 'User Two',
      email: 'user2@example.com',
      ci: null,
      country: null,
      city: null,
      phone: null,
      status: 'ACTIVO',
      verified: true,
      birthDate: null,
      club: null,
      roles: ['JUEZ'],
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    },
  ],
  clubs: [
    {
      id: 'club-1',
      name: 'Club Uno',
      place: 'La Paz',
      contactEmail: 'club@example.com',
      description: null,
      logoUrl: null,
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    },
  ],
  catalog: {
    events: [
      {
        id: 'event-1',
        name: 'Event Uno',
        organizerClubId: 'club-1',
        organizerClub: { id: 'club-1', name: 'Club Uno' },
        place: 'La Paz',
        startDate: '2026-04-01T00:00:00.000Z',
        endDate: '2026-04-02T00:00:00.000Z',
        status: 'ACTIVO',
        description: null,
        imageUrl: null,
        createdAt: '2026-03-16T00:00:00.000Z',
        updatedAt: '2026-03-16T00:00:00.000Z',
      },
    ],
    categories: [
      {
        id: 'cat-root',
        name: 'Root Cat',
        parentId: null,
        parent: null,
        childCount: 1,
        createdAt: '2026-03-16T00:00:00.000Z',
        updatedAt: '2026-03-16T00:00:00.000Z',
      },
      {
        id: 'cat-child',
        name: 'Child Cat',
        parentId: 'cat-root',
        parent: { id: 'cat-root', name: 'Root Cat' },
        childCount: 0,
        createdAt: '2026-03-16T00:00:00.000Z',
        updatedAt: '2026-03-16T00:00:00.000Z',
      },
    ],
    eventCategories: [
      {
        id: 'ev-cat-1',
        eventId: 'event-1',
        categoryId: 'cat-root',
        eventName: 'Event Uno',
        categoryName: 'Root Cat',
        categoryParentId: null,
        categoryParentName: null,
        createdAt: '2026-03-16T00:00:00.000Z',
        updatedAt: '2026-03-16T00:00:00.000Z',
      },
      {
        id: 'ev-cat-2',
        eventId: 'event-1',
        categoryId: 'cat-child',
        eventName: 'Event Uno',
        categoryName: 'Child Cat',
        categoryParentId: 'cat-root',
        categoryParentName: 'Root Cat',
        createdAt: '2026-03-16T00:00:00.000Z',
        updatedAt: '2026-03-16T00:00:00.000Z',
      },
    ],
  },
  assignments: [
    {
      id: 'assignment-1',
      judgeUserId: 'user-2',
      judgeName: 'User Two',
      judgeRoles: ['JUEZ'],
      eventId: 'event-1',
      eventName: 'Event Uno',
      eventCategoryId: 'ev-cat-2',
      categoryId: 'cat-child',
      categoryName: 'Child Cat',
      categoryParentId: 'cat-root',
      categoryParentName: 'Root Cat',
      createdAt: '2026-03-16T00:00:00.000Z',
    },
  ],
  permissions: {
    total: 0,
    items: [],
  },
  alerts: [],
  activity: [
    {
      id: 'activity-1',
      title: 'A1',
      detail: 'D1',
      createdAt: '2026-03-16T00:00:00.000Z',
      actor: null,
    },
  ],
});

describe('admin-dashboard.mapper', () => {
  it('maps dashboard activity item to domain activity log item', () => {
    const result = mapApiAdminDashboardActivityToActivityLogItem(dashboardFixture().activity[0]!);

    expect(result).toEqual({
      id: 'activity-1',
      title: 'A1',
      detail: 'D1',
      createdAt: '2026-03-16T00:00:00.000Z',
    });
  });

  it('maps dashboard club to domain club with members count', () => {
    const dashboard = dashboardFixture();
    const result = mapApiAdminDashboardClubToAdminClub(dashboard.clubs[0]!, dashboard.users);

    expect(result).toEqual({
      id: 'club-1',
      name: 'Club Uno',
      place: 'La Paz',
      contactEmail: 'club@example.com',
      description: null,
      logoUrl: null,
      members: 1,
    });
  });

  it('builds catalog from dashboard payload', () => {
    const result = buildCatalogFromApiAdminDashboard(dashboardFixture());

    expect(result.events).toHaveLength(1);
    expect(result.categories).toHaveLength(1);
    expect(result.subcategories).toHaveLength(1);
    expect(result.eventCategories).toHaveLength(2);
    expect(result.subcategories[0]).toEqual({
      id: 'cat-child',
      categoryId: 'cat-root',
      name: 'Child Cat',
    });
  });
});
