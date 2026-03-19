import { useMemo, useState } from 'react';
import type { JudgePermissionEntry } from '@/domain/admin/admin.types';
import type { User } from '@/domain/user/user.types';
import { useAdminStore } from '@/presentation/stores/admin.store';
import { useAdminAccessControlSlice } from '@/presentation/stores/admin-access-control.slice';

type JudgePermissionModalState = {
  userId: string;
  userName: string;
};

export const useAdminJudgePermissions = () => {
  const {
    judgePermissionsMap,
    judgePermissionsLoading,
    judgePermissionsError,
    loadJudgePermissions,
    toggleJudgePermission,
  } = useAdminAccessControlSlice();
  const clearError = useAdminStore((state) => state.clearError);

  const [judgePermissionSearch, setJudgePermissionSearch] = useState('');
  const [judgePermissionModal, setJudgePermissionModal] =
    useState<JudgePermissionModalState | null>(null);

  const activeJudgePermissionEntries = useMemo<JudgePermissionEntry[]>(() => {
    if (!judgePermissionModal) {
      return [];
    }

    return judgePermissionsMap[judgePermissionModal.userId] ?? [];
  }, [judgePermissionModal, judgePermissionsMap]);

  const filteredJudgePermissionEntries = useMemo(() => {
    const query = judgePermissionSearch.trim().toLowerCase();
    if (!query) {
      return activeJudgePermissionEntries;
    }

    return activeJudgePermissionEntries.filter((entry) =>
      `${entry.code} ${entry.granted ? 'granted' : 'revoked'}`
        .toLowerCase()
        .includes(query),
    );
  }, [activeJudgePermissionEntries, judgePermissionSearch]);

  const openJudgePermissionsModal = async (targetUser: User) => {
    clearError();
    setJudgePermissionSearch('');
    setJudgePermissionModal({
      userId: targetUser.id,
      userName: targetUser.name,
    });
    await loadJudgePermissions(targetUser.id);
  };

  const closeJudgePermissionsModal = () => {
    setJudgePermissionModal(null);
    setJudgePermissionSearch('');
  };

  const handleToggleJudgePermission = async (entry: JudgePermissionEntry) => {
    if (!judgePermissionModal) {
      return;
    }

    try {
      await toggleJudgePermission(
        judgePermissionModal.userId,
        entry.code,
        entry.grantedDirectly,
      );
    } catch {
      // Error state is already persisted in store.
    }
  };

  return {
    judgePermissionSearch,
    setJudgePermissionSearch,
    judgePermissionModal,
    filteredJudgePermissionEntries,
    judgePermissionsLoading,
    judgePermissionsError,
    openJudgePermissionsModal,
    closeJudgePermissionsModal,
    handleToggleJudgePermission,
  };
};
