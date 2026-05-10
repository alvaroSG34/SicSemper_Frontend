import type { Event } from "@/domain/event/event.types";
import { apiRequest } from "@/infrastructure/api/http-client";

export interface EventsService {
  getEvents(): Promise<Event[]>;
  getEventById(eventId: string): Promise<Event | null>;
}

export const eventsService: EventsService = {
  async getEvents() {
    return apiRequest<Event[]>("/participant/events/upcoming");
  },
  async getEventById(eventId) {
    try {
      return await apiRequest<Event>(`/participant/events/${encodeURIComponent(eventId)}`);
    } catch {
      return null;
    }
  },
};
