import type { Event } from "@/domain/event/event.types";
import { findEventById } from "@/domain/event/event.model";
import { mockEvents } from "@/infrastructure/mock/mock-events";

export interface EventsService {
  getEvents(): Promise<Event[]>;
  getEventById(eventId: string): Promise<Event | null>;
}

const cloneEvent = (event: Event): Event => ({ ...event });

export const eventsService: EventsService = {
  async getEvents() {
    return mockEvents.map(cloneEvent);
  },
  async getEventById(eventId) {
    const event = findEventById(mockEvents, eventId);
    return event ? cloneEvent(event) : null;
  },
};
