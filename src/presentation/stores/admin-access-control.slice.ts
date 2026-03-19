import { useAdminStore } from "./admin.store";

export type AdminAccessControlSlice = {
  adminPermissionsMap: ReturnType<typeof useAdminStore.getState>["adminPermissionsMap"];
  adminPermissionsLoading: ReturnType<typeof useAdminStore.getState>["adminPermissionsLoading"];
  adminPermissionsError: ReturnType<typeof useAdminStore.getState>["adminPermissionsError"];
  loadAdminPermissions: (adminUserId: string) => Promise<void>;
  toggleAdminPermission: ReturnType<typeof useAdminStore.getState>["toggleAdminPermission"];
  judgePermissionsMap: ReturnType<typeof useAdminStore.getState>["judgePermissionsMap"];
  judgePermissionsLoading: ReturnType<typeof useAdminStore.getState>["judgePermissionsLoading"];
  judgePermissionsError: ReturnType<typeof useAdminStore.getState>["judgePermissionsError"];
  loadJudgePermissions: (judgeUserId: string) => Promise<void>;
  toggleJudgePermission: ReturnType<typeof useAdminStore.getState>["toggleJudgePermission"];
};

export const useAdminAccessControlSlice = (): AdminAccessControlSlice => {
  const adminPermissionsMap = useAdminStore((state) => state.adminPermissionsMap);
  const adminPermissionsLoading = useAdminStore((state) => state.adminPermissionsLoading);
  const adminPermissionsError = useAdminStore((state) => state.adminPermissionsError);
  const loadAdminPermissions = useAdminStore((state) => state.loadAdminPermissions);
  const toggleAdminPermission = useAdminStore((state) => state.toggleAdminPermission);

  const judgePermissionsMap = useAdminStore((state) => state.judgePermissionsMap);
  const judgePermissionsLoading = useAdminStore((state) => state.judgePermissionsLoading);
  const judgePermissionsError = useAdminStore((state) => state.judgePermissionsError);
  const loadJudgePermissions = useAdminStore((state) => state.loadJudgePermissions);
  const toggleJudgePermission = useAdminStore((state) => state.toggleJudgePermission);

  return {
    adminPermissionsMap,
    adminPermissionsLoading,
    adminPermissionsError,
    loadAdminPermissions,
    toggleAdminPermission,
    judgePermissionsMap,
    judgePermissionsLoading,
    judgePermissionsError,
    loadJudgePermissions,
    toggleJudgePermission,
  };
};
