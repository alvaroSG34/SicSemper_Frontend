import type { Event } from "@/domain/event/event.types";

export const mockEvents: Event[] = [
  {
    id: "e-1",
    name: "Copa Nacional de Modelismo",
    category: "Aviones",
    status: "UPCOMING",
    countdown: "12d 04h",
  },
  {
    id: "e-2",
    name: "Gran Premio de Blindados",
    category: "Tanques",
    status: "ONGOING",
    countdown: "01d 09h",
  },
];
