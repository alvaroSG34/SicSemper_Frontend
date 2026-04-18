import { useAdminOperationsSlice } from './admin-operations.slice';

export type AdminParticipantsSlice = {
  banParticipant: ReturnType<typeof useAdminOperationsSlice>['banParticipant'];
  unbanParticipant: ReturnType<typeof useAdminOperationsSlice>['unbanParticipant'];
  setParticipantVerified: ReturnType<typeof useAdminOperationsSlice>['setParticipantVerified'];
};

export const useAdminParticipantsSlice = (): AdminParticipantsSlice => {
  const { banParticipant, unbanParticipant, setParticipantVerified } = useAdminOperationsSlice();

  return {
    banParticipant,
    unbanParticipant,
    setParticipantVerified,
  };
};
