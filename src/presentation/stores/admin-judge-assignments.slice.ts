import { useAdminOperationsSlice } from './admin-operations.slice';

export type AdminJudgeAssignmentsSlice = {
  assignJudgeScope: ReturnType<typeof useAdminOperationsSlice>['assignJudgeScope'];
  removeJudgeScope: ReturnType<typeof useAdminOperationsSlice>['removeJudgeScope'];
};

export const useAdminJudgeAssignmentsSlice = (): AdminJudgeAssignmentsSlice => {
  const { assignJudgeScope, removeJudgeScope } = useAdminOperationsSlice();

  return {
    assignJudgeScope,
    removeJudgeScope,
  };
};
