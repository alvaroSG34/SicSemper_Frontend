import type {
  CatalogEvent,
  CreateEventPayload,
  EventDeleteImpact,
  UpdateEventPayload,
} from '@/domain/admin/admin.types';
import type {
  ApiAdminEvent,
  ApiCreateEventRequest,
  ApiEventDeleteImpact,
  ApiUpdateEventRequest,
} from '../contracts/admin-events.contract';

export const mapApiEventToCatalogEvent = (event: ApiAdminEvent): CatalogEvent => ({
  id: event.id,
  name: event.name,
  organizerClubId: event.organizerClubId,
  status: event.status,
  place: event.place ?? '',
  startDate: event.startDate ?? '',
  endDate: event.endDate ?? '',
  description: event.description ?? '',
  imageUrl: event.imageUrl ?? '',
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
});

export const mapCreateEventPayloadToApiRequest = (
  payload: CreateEventPayload,
): ApiCreateEventRequest => ({
  organizerClubId: payload.organizerClubId,
  name: payload.name,
  status: payload.status,
  place: payload.place,
  startDate: payload.startDate,
  endDate: payload.endDate,
  description: payload.description,
  imageUrl: payload.imageUrl,
});

export const mapUpdateEventPayloadToApiRequest = (
  payload: UpdateEventPayload,
): ApiUpdateEventRequest => ({
  organizerClubId: payload.organizerClubId,
  name: payload.name,
  status: payload.status,
  place: payload.place,
  startDate: payload.startDate,
  endDate: payload.endDate,
  description: payload.description,
  imageUrl: payload.imageUrl,
});

export const mapApiEventDeleteImpact = (
  impact: ApiEventDeleteImpact,
): EventDeleteImpact => ({
  eventId: impact.eventId,
  eventName: impact.eventName,
  eventCategories: impact.eventCategories,
  judgeAssignments: impact.judgeAssignments,
  registrations: impact.registrations,
  models: impact.models,
});
