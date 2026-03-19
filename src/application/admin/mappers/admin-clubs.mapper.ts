import type { AdminClub, ClubDeleteImpact, CreateClubPayload, UpdateClubPayload } from '@/domain/admin/admin.types';
import type {
  ApiAdminClub,
  ApiClubDeleteImpact,
  ApiCreateClubRequest,
  ApiUpdateClubRequest,
} from '../contracts/admin-clubs.contract';

export const mapApiClubToAdminClub = (club: ApiAdminClub, members: number): AdminClub => ({
  id: club.id,
  name: club.name,
  place: club.place,
  contactEmail: club.contactEmail,
  description: club.description,
  logoUrl: club.logoUrl,
  members,
});

export const mapCreateClubPayloadToApiRequest = (
  payload: CreateClubPayload,
): ApiCreateClubRequest => ({
  name: payload.name,
  place: payload.place,
  contactEmail: payload.contactEmail,
  description: payload.description,
  logoUrl: payload.logoUrl,
});

export const mapUpdateClubPayloadToApiRequest = (
  payload: UpdateClubPayload,
): ApiUpdateClubRequest => ({
  name: payload.name,
  place: payload.place,
  contactEmail: payload.contactEmail,
  description: payload.description,
  logoUrl: payload.logoUrl,
});

export const mapApiClubDeleteImpact = (
  impact: ApiClubDeleteImpact,
): ClubDeleteImpact => ({
  clubId: impact.clubId,
  clubName: impact.clubName,
  members: impact.members,
  events: impact.events,
});

