import { describe, expect, it } from 'vitest';
import {
  mapApiEventDeleteImpact,
  mapApiEventToCatalogEvent,
  mapCreateEventPayloadToApiRequest,
  mapUpdateEventPayloadToApiRequest,
} from './admin-events.mapper';

describe('admin-events.mapper', () => {
  it('maps api event to catalog event', () => {
    const result = mapApiEventToCatalogEvent({
      id: 'evt-1',
      name: 'Open Nacional',
      organizerClubId: 'club-1',
      organizerClub: { id: 'club-1', name: 'Club A' },
      place: null,
      startDate: null,
      endDate: null,
      status: 'BORRADOR',
      description: null,
      imageUrl: null,
      createdAt: '2026-03-15T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    });

    expect(result).toEqual({
      id: 'evt-1',
      name: 'Open Nacional',
      organizerClubId: 'club-1',
      status: 'BORRADOR',
      place: '',
      startDate: '',
      endDate: '',
      description: '',
      imageUrl: '',
      createdAt: '2026-03-15T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    });
  });

  it('maps create payload to api request', () => {
    const request = mapCreateEventPayloadToApiRequest({
      organizerClubId: 'club-1',
      name: 'Open Nacional',
      status: 'ACTIVO',
      place: 'La Paz',
      startDate: '2026-05-10',
      endDate: '2026-05-12',
      description: 'Edicion nacional',
      imageUrl: 'https://cdn/img.jpg',
    });

    expect(request.organizerClubId).toBe('club-1');
    expect(request.name).toBe('Open Nacional');
    expect(request.status).toBe('ACTIVO');
  });

  it('maps update payload to api request', () => {
    const request = mapUpdateEventPayloadToApiRequest({
      id: 'evt-1',
      organizerClubId: 'club-1',
      name: 'Open Nacional',
      status: 'PAUSADO',
      place: 'La Paz',
      startDate: '2026-05-10',
      endDate: '2026-05-12',
      description: 'Edicion nacional',
      imageUrl: 'https://cdn/img.jpg',
    });

    expect(request.organizerClubId).toBe('club-1');
    expect(request.status).toBe('PAUSADO');
  });

  it('maps event delete-impact contract to domain type', () => {
    const result = mapApiEventDeleteImpact({
      eventId: 'evt-1',
      eventName: 'Open Nacional',
      eventCategories: 3,
      judgeAssignments: 5,
      registrations: 20,
      models: 18,
    });

    expect(result).toEqual({
      eventId: 'evt-1',
      eventName: 'Open Nacional',
      eventCategories: 3,
      judgeAssignments: 5,
      registrations: 20,
      models: 18,
    });
  });
});
