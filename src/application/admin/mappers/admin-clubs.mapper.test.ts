import {
  mapApiClubDeleteImpact,
  mapApiClubToAdminClub,
  mapCreateClubPayloadToApiRequest,
  mapUpdateClubPayloadToApiRequest,
} from './admin-clubs.mapper';

describe('admin-clubs.mapper', () => {
  it('maps API club payload to admin club view model', () => {
    const mapped = mapApiClubToAdminClub(
      {
        id: 'club-1',
        name: 'Club Uno',
        place: 'La Paz',
        contactEmail: 'club@uno.com',
        description: 'Desc',
        logoUrl: '/logo.png',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      12,
    );

    expect(mapped).toEqual({
      id: 'club-1',
      name: 'Club Uno',
      place: 'La Paz',
      contactEmail: 'club@uno.com',
      description: 'Desc',
      logoUrl: '/logo.png',
      members: 12,
    });
  });

  it('maps create/update payloads to API contract shape', () => {
    const createPayload = mapCreateClubPayloadToApiRequest({
      name: 'Nuevo',
      place: 'Cochabamba',
      contactEmail: 'nuevo@club.com',
      description: 'desc',
      logoUrl: '/logo.webp',
    });

    const updatePayload = mapUpdateClubPayloadToApiRequest({
      id: 'club-1',
      name: 'Editado',
      place: 'Santa Cruz',
      contactEmail: 'edit@club.com',
      description: 'desc2',
      logoUrl: '/logo2.webp',
    });

    expect(createPayload).toEqual({
      name: 'Nuevo',
      place: 'Cochabamba',
      contactEmail: 'nuevo@club.com',
      description: 'desc',
      logoUrl: '/logo.webp',
    });

    expect(updatePayload).toEqual({
      name: 'Editado',
      place: 'Santa Cruz',
      contactEmail: 'edit@club.com',
      description: 'desc2',
      logoUrl: '/logo2.webp',
    });
  });

  it('maps delete-impact contract to domain type', () => {
    expect(
      mapApiClubDeleteImpact({
        clubId: 'club-2',
        clubName: 'Club Dos',
        members: 2,
        events: 1,
      }),
    ).toEqual({
      clubId: 'club-2',
      clubName: 'Club Dos',
      members: 2,
      events: 1,
    });
  });
});

