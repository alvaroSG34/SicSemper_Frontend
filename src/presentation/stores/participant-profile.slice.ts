import { useParticipantStore } from "./participant.store";

export type ParticipantProfileSlice = {
  loadDashboard: (userId?: string) => Promise<void>;
};

export const useParticipantProfileSlice = (): ParticipantProfileSlice => {
  const loadDashboard = useParticipantStore((state) => state.loadDashboard);

  return {
    loadDashboard,
  };
};
