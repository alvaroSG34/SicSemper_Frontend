import type { Identifier } from "@/core/types";

export type EventStatus = "DRAFT" | "UPCOMING" | "ONGOING" | "FINISHED";

export type Event = {
  id: Identifier;
  name: string;
  category: string;
  status: EventStatus;
  countdown: string;
};
