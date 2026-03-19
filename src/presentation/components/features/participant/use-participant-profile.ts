import { useAuthStore } from "@/presentation/stores";
import { useParticipantProfileSlice } from "@/presentation/stores/participant-profile.slice";
import { participantService } from "@/application/participant/participant.service";

export const useParticipantProfile = () => {
  const user = useAuthStore((state) => state.user);
  const { loadDashboard } = useParticipantProfileSlice();

  const handleProfileUpdated = () => {
    void loadDashboard(user?.id);
  };

  return {
    getProfile: participantService.getProfile,
    updateProfile: participantService.updateProfile,
    handleProfileUpdated,
  };
};
