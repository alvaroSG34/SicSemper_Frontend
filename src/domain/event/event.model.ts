import type { Event } from "./event.types";

export const findEventById = (events: Event[], eventId: string): Event | undefined => {
  return events.find((event) => event.id === eventId);
};
