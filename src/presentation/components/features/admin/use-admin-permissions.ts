import { useMemo, useState } from 'react';
import type { AdminPermission } from '@/domain/admin/admin.types';

export const useAdminPermissions = (permissions: AdminPermission[]) => {
  const [permissionSearch, setPermissionSearch] = useState('');

  const filteredPermissions = useMemo(() => {
    const normalizedQuery = permissionSearch.trim().toLowerCase();

    return permissions.filter((permission) => {
      if (!normalizedQuery) {
        return true;
      }

      return `${permission.code} ${permission.name} ${permission.description ?? ''}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [permissionSearch, permissions]);

  return {
    permissionSearch,
    setPermissionSearch,
    filteredPermissions,
  };
};
