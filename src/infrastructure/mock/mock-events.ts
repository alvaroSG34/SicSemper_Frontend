import type { Event } from "@/domain/event/event.types";

export const mockEvents: Event[] = [
  {
    id: "e-1",
    name: "SicSemper Design Summit",
    category: "UX/UI",
    status: "UPCOMING",
    countdown: "12d 04h",
  },
  {
    id: "e-2",
    name: "Frontend Challenge",
    category: "Development",
    status: "ONGOING",
    countdown: "01d 09h",
  },
];
