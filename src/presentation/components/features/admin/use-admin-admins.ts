import { useMemo, useState } from 'react';
import type { User } from '@/domain/user/user.types';
import { useAdminStore } from '@/presentation/stores/admin.store';
import { useAdminOperations } from './use-admin-operations';

type UseAdminAdminsParams = {
  users: User[];
};

export const useAdminAdmins = ({ users }: UseAdminAdminsParams) => {
  const { createAdmin, promoteToAdmin, demoteAdmin } = useAdminOperations();
  const clearError = useAdminStore((state) => state.clearError);

  const [adminSearch, setAdminSearch] = useState('');
  const [promoteAdminSearch, setPromoteAdminSearch] = useState('');
  const [promoteAdminSelectedUserId, setPromoteAdminSelectedUserId] = useState('');
  const [createAdminForm, setCreateAdminForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [adminFormModalMode, setAdminFormModalMode] = useState<'promote' | 'create' | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const adminUsers = useMemo(
    () =>
      users.filter(
        (candidate) =>
          candidate.roles.includes('ADMIN') && !candidate.roles.includes('SUPERADMIN'),
      ),
    [users],
  );

  const promotableAdminUsers = useMemo(
    () =>
      users.filter(
        (candidate) =>
          !candidate.roles.includes('ADMIN') && !candidate.roles.includes('SUPERADMIN'),
      ),
    [users],
  );

  const filteredAdminUsers = useMemo(() => {
    const query = adminSearch.trim().toLowerCase();
    if (!query) {
      return adminUsers;
    }
    return adminUsers.filter((candidate) =>
      `${candidate.name} ${candidate.email}`.toLowerCase().includes(query),
    );
  }, [adminSearch, adminUsers]);

  const filteredPromotableAdminUsers = useMemo(() => {
    const query = promoteAdminSearch.trim().toLowerCase();
    if (!query) {
      return promotableAdminUsers;
    }
    return promotableAdminUsers.filter((candidate) =>
      `${candidate.name} ${candidate.email}`.toLowerCase().includes(query),
    );
  }, [promotableAdminUsers, promoteAdminSearch]);

  const runAdminAction = async (input: {
    actionKey: string;
    successMessage: string;
    action: () => Promise<void>;
  }) => {
    setPendingAction(input.actionKey);
    setActionFeedback(null);
    clearError();
    await input.action();
    const latestError = useAdminStore.getState().error;
    setPendingAction(null);

    if (latestError) {
      setActionFeedback({
        type: 'error',
        message: latestError,
      });
      return false;
    }

    setActionFeedback({
      type: 'success',
      message: input.successMessage,
    });
    return true;
  };

  const handlePromoteAdmin = async () => {
    if (!promoteAdminSelectedUserId) {
      return;
    }
    const success = await runAdminAction({
      actionKey: `admin:promote:${promoteAdminSelectedUserId}`,
      successMessage: 'Usuario promovido a admin correctamente.',
      action: () => promoteToAdmin(promoteAdminSelectedUserId),
    });
    if (success) {
      setPromoteAdminSearch('');
      setPromoteAdminSelectedUserId('');
      setAdminFormModalMode(null);
    }
  };

  const handleCreateAdmin = async () => {
    const name = createAdminForm.name.trim();
    const email = createAdminForm.email.trim().toLowerCase();
    const password = createAdminForm.password;

    if (!name || !email || !password) {
      setActionFeedback({
        type: 'error',
        message: 'Completa nombre, correo y contrasena para crear el admin.',
      });
      return;
    }

    if (password.length < 8) {
      setActionFeedback({
        type: 'error',
        message: 'La contrasena debe tener al menos 8 caracteres.',
      });
      return;
    }

    const success = await runAdminAction({
      actionKey: `admin:create:${email}`,
      successMessage: 'Admin creado correctamente.',
      action: () =>
        createAdmin({
          name,
          email,
          password,
        }),
    });

    if (success) {
      setCreateAdminForm({
        name: '',
        email: '',
        password: '',
      });
      setAdminFormModalMode(null);
    }
  };

  const closeAdminFormModal = () => {
    if (adminFormModalMode === 'promote' && pendingAction?.startsWith('admin:promote:')) {
      return;
    }
    if (adminFormModalMode === 'create' && pendingAction?.startsWith('admin:create:')) {
      return;
    }
    setAdminFormModalMode(null);
  };

  const handleDemoteAdmin = async (userId: string, userName: string) => {
    const confirmed = window.confirm(`Deseas quitar el rol ADMIN a ${userName}?`);
    if (!confirmed) {
      return;
    }

    await runAdminAction({
      actionKey: `admin:demote:${userId}`,
      successMessage: 'Rol ADMIN removido correctamente.',
      action: () => demoteAdmin(userId),
    });
  };

  return {
    adminSearch,
    setAdminSearch,
    filteredAdminUsers,
    promoteAdminSearch,
    setPromoteAdminSearch,
    promoteAdminSelectedUserId,
    setPromoteAdminSelectedUserId,
    filteredPromotableAdminUsers,
    createAdminForm,
    setCreateAdminForm,
    adminFormModalMode,
    setAdminFormModalMode,
    closeAdminFormModal,
    handlePromoteAdmin,
    handleCreateAdmin,
    handleDemoteAdmin,
    pendingAction,
    actionFeedback,
    adminUsers,
  };
};

