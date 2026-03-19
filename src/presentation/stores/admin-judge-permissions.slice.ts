import type { JudgePermissionCode } from '@/domain/admin/admin.types';
import { useAdminAccessControlSlice } from './admin-access-control.slice';

export type AdminJudgePermissionsSlice = {
  judgePermissionsMap: ReturnType<typeof useAdminAccessControlSlice>['judgePermissionsMap'];
  judgePermissionsLoading: ReturnType<typeof useAdminAccessControlSlice>['judgePermissionsLoading'];
  judgePermissionsError: ReturnType<typeof useAdminAccessControlSlice>['judgePermissionsError'];
  loadJudgePermissions: (judgeUserId: string) => Promise<void>;
  toggleJudgePermission: (
    judgeUserId: string,
    code: JudgePermissionCode,
    grantedDirectly: boolean,
  ) => Promise<void>;
};

export const useAdminJudgePermissionsSlice = (): AdminJudgePermissionsSlice => {
  const {
    judgePermissionsMap,
    judgePermissionsLoading,
    judgePermissionsError,
    loadJudgePermissions,
    toggleJudgePermission,
  } = useAdminAccessControlSlice();

  return {
    judgePermissionsMap,
    judgePermissionsLoading,
    judgePermissionsError,
    loadJudgePermissions,
    toggleJudgePermission,
  };
};
