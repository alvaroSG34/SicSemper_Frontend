import { useAdminOperationsSlice } from './admin-operations.slice';

export type AdminClubsSlice = {
  createClub: ReturnType<typeof useAdminOperationsSlice>['createClub'];
  updateClub: ReturnType<typeof useAdminOperationsSlice>['updateClub'];
  getClubDeleteImpact: ReturnType<typeof useAdminOperationsSlice>['getClubDeleteImpact'];
  removeClub: ReturnType<typeof useAdminOperationsSlice>['removeClub'];
};

export const useAdminClubsSlice = (): AdminClubsSlice => {
  const { createClub, updateClub, getClubDeleteImpact, removeClub } = useAdminOperationsSlice();

  return {
    createClub,
    updateClub,
    getClubDeleteImpact,
    removeClub,
  };
};
