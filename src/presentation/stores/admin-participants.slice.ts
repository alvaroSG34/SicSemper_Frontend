import { useAdminOperationsSlice } from './admin-operations.slice';

export type AdminParticipantsSlice = {
  banParticipant: ReturnType<typeof useAdminOperationsSlice>['banParticipant'];
  unbanParticipant: ReturnType<typeof useAdminOperationsSlice>['unbanParticipant'];
};

export const useAdminParticipantsSlice = (): AdminParticipantsSlice => {
  const { banParticipant, unbanParticipant } = useAdminOperationsSlice();

  return {
    banParticipant,
    unbanParticipant,
  };
};
