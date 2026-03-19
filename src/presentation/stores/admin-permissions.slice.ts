import type { AdminPermissionCode } from '@/domain/admin/admin.types';
import { useAdminAccessControlSlice } from './admin-access-control.slice';

export type AdminPermissionsSlice = {
  adminPermissionsMap: ReturnType<typeof useAdminAccessControlSlice>['adminPermissionsMap'];
  adminPermissionsLoading: ReturnType<typeof useAdminAccessControlSlice>['adminPermissionsLoading'];
  adminPermissionsError: ReturnType<typeof useAdminAccessControlSlice>['adminPermissionsError'];
  loadAdminPermissions: (adminUserId: string) => Promise<void>;
  toggleAdminPermission: (
    adminUserId: string,
    code: AdminPermissionCode,
    shouldRevoke: boolean,
  ) => Promise<void>;
};

export const useAdminPermissionsSlice = (): AdminPermissionsSlice => {
  const {
    adminPermissionsMap,
    adminPermissionsLoading,
    adminPermissionsError,
    loadAdminPermissions,
    toggleAdminPermission,
  } = useAdminAccessControlSlice();

  return {
    adminPermissionsMap,
    adminPermissionsLoading,
    adminPermissionsError,
    loadAdminPermissions,
    toggleAdminPermission,
  };
};
