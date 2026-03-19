import { useAdminOperationsSlice } from './admin-operations.slice';

export type AdminAdminsSlice = {
  createAdmin: ReturnType<typeof useAdminOperationsSlice>['createAdmin'];
  promoteToAdmin: ReturnType<typeof useAdminOperationsSlice>['promoteToAdmin'];
  demoteAdmin: ReturnType<typeof useAdminOperationsSlice>['demoteAdmin'];
};

export const useAdminAdminsSlice = (): AdminAdminsSlice => {
  const { createAdmin, promoteToAdmin, demoteAdmin } = useAdminOperationsSlice();

  return {
    createAdmin,
    promoteToAdmin,
    demoteAdmin,
  };
};
