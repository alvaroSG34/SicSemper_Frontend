import { useAdminOperationsSlice } from './admin-operations.slice';

export type AdminJudgesSlice = {
  promoteToJudge: ReturnType<typeof useAdminOperationsSlice>['promoteToJudge'];
  demoteJudge: ReturnType<typeof useAdminOperationsSlice>['demoteJudge'];
};

export const useAdminJudgesSlice = (): AdminJudgesSlice => {
  const { promoteToJudge, demoteJudge } = useAdminOperationsSlice();

  return {
    promoteToJudge,
    demoteJudge,
  };
};
