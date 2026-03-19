import type { ParticipantDashboardData } from "@/domain/participant/participant.types";
import { useParticipantStore } from "./participant.store";

export type ParticipantHomeSlice = {
  dashboard: ParticipantDashboardData | null;
  selectEvent: (eventId: string) => Promise<boolean>;
};

export const useParticipantHomeSlice = (): ParticipantHomeSlice => {
  const dashboard = useParticipantStore((state) => state.dashboard);
  const selectEvent = useParticipantStore((state) => state.selectEvent);

  return {
    dashboard,
    selectEvent,
  };
};
