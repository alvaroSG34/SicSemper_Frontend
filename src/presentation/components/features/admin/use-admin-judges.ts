import { useMemo, useState } from 'react';
import type { JudgeAssignmentScope } from '@/domain/admin/admin.types';
import type { User } from '@/domain/user/user.types';
import { useAdminStore } from '@/presentation/stores/admin.store';
import { useAdminOperations } from './use-admin-operations';

type UseAdminJudgesParams = {
  users: User[];
  assignments: JudgeAssignmentScope[];
};

export const useAdminJudges = ({ users, assignments }: UseAdminJudgesParams) => {
  const { promoteToJudge, demoteJudge, createJudge } = useAdminOperations();
  const clearError = useAdminStore((state) => state.clearError);

  const [judgeSearch, setJudgeSearch] = useState('');
  const [addJudgeModalOpen, setAddJudgeModalOpen] = useState(false);
  const [addJudgeSearch, setAddJudgeSearch] = useState('');
  const [addJudgeSelectedUserId, setAddJudgeSelectedUserId] = useState('');
  const [createJudgeModalOpen, setCreateJudgeModalOpen] = useState(false);
  const [createJudgeForm, setCreateJudgeForm] = useState({
    name: '',
    email: '',
    password: '',
    birthDate: '',
    ci: '',
    country: '',
    city: '',
    phone: '',
    clubId: '',
  });
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const judgeUsers = useMemo(
    () => users.filter((candidate) => candidate.roles.includes('JUEZ')),
    [users],
  );

  const filteredJudgeUsers = useMemo(() => {
    const query = judgeSearch.trim().toLowerCase();
    if (!query) return judgeUsers;
    return judgeUsers.filter((judge) => `${judge.name} ${judge.email}`.toLowerCase().includes(query));
  }, [judgeUsers, judgeSearch]);

  const judgeAssignmentCount = useMemo(() => {
    const counts = new Map<string, number>();
    assignments.forEach((assignment) => {
      counts.set(assignment.judgeUserId, (counts.get(assignment.judgeUserId) ?? 0) + 1);
    });
    return counts;
  }, [assignments]);

  const nonJudgeUsers = useMemo(
    () => users.filter((candidate) => !candidate.roles.includes('JUEZ')),
    [users],
  );

  const filteredNonJudgeUsers = useMemo(() => {
    const query = addJudgeSearch.trim().toLowerCase();
    if (!query) return nonJudgeUsers;
    return nonJudgeUsers.filter((candidate) =>
      `${candidate.name} ${candidate.email}`.toLowerCase().includes(query),
    );
  }, [nonJudgeUsers, addJudgeSearch]);

  const executeAction = async (
    actionKey: string,
    successMessage: string,
    action: () => Promise<void>,
  ) => {
    setPendingAction(actionKey);
    setActionFeedback(null);
    clearError();

    try {
      await action();
      const latestError = useAdminStore.getState().error;
      if (latestError) {
        setActionFeedback({
          type: 'error',
          message: latestError,
        });
        return false;
      }

      setActionFeedback({
        type: 'success',
        message: successMessage,
      });
      return true;
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo completar la accion.',
      });
      return false;
    } finally {
      setPendingAction((current) => (current === actionKey ? null : current));
    }
  };

  const openAddJudgeModal = () => {
    setActionFeedback(null);
    clearError();
    setAddJudgeModalOpen(true);
    setAddJudgeSearch('');
    setAddJudgeSelectedUserId('');
  };

  const closeAddJudgeModal = () => {
    if (pendingAction?.startsWith('judge:promote:')) {
      return;
    }
    setAddJudgeModalOpen(false);
    setAddJudgeSearch('');
    setAddJudgeSelectedUserId('');
  };

  const handleAddJudge = async () => {
    if (!addJudgeSelectedUserId) {
      return;
    }

    const success = await executeAction(
      `judge:promote:${addJudgeSelectedUserId}`,
      'Usuario promovido a juez correctamente.',
      () => promoteToJudge(addJudgeSelectedUserId),
    );

    if (success) {
      closeAddJudgeModal();
    }
  };

  const openCreateJudgeModal = () => {
    setActionFeedback(null);
    clearError();
    setCreateJudgeModalOpen(true);
    setCreateJudgeForm({
      name: '',
      email: '',
      password: '',
      birthDate: '',
      ci: '',
      country: '',
      city: '',
      phone: '',
      clubId: '',
    });
  };

  const closeCreateJudgeModal = () => {
    if (pendingAction?.startsWith('judge:create:')) {
      return;
    }
    setCreateJudgeModalOpen(false);
    setCreateJudgeForm({
      name: '',
      email: '',
      password: '',
      birthDate: '',
      ci: '',
      country: '',
      city: '',
      phone: '',
      clubId: '',
    });
  };

  const handleCreateJudge = async () => {
    const name = createJudgeForm.name.trim();
    const email = createJudgeForm.email.trim().toLowerCase();
    const password = createJudgeForm.password;

    if (!name || !email || !password) {
      setActionFeedback({
        type: 'error',
        message: 'Nombre, correo y contrasena son obligatorios para crear un juez.',
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

    const success = await executeAction(
      `judge:create:${email}`,
      'Juez creado correctamente.',
      () =>
        createJudge({
          name,
          email,
          password,
          birthDate: createJudgeForm.birthDate || undefined,
          ci: createJudgeForm.ci || undefined,
          country: createJudgeForm.country || undefined,
          city: createJudgeForm.city || undefined,
          phone: createJudgeForm.phone || undefined,
          clubId: createJudgeForm.clubId || undefined,
        }),
    );

    if (success) {
      closeCreateJudgeModal();
    }
  };

  const handleToggleJudgeRole = async (userId: string, hasJudgeRole: boolean) => {
    if (hasJudgeRole) {
      const confirmed = window.confirm('¿Seguro que deseas quitar el rol de juez a este usuario?');
      if (!confirmed) {
        return;
      }
    }

    await executeAction(
      `user:judge:${userId}`,
      hasJudgeRole
        ? 'Rol de juez removido correctamente.'
        : 'Usuario promovido a juez correctamente.',
      () => (hasJudgeRole ? demoteJudge(userId) : promoteToJudge(userId)),
    );
  };

  return {
    actionFeedback,
    judgeUsers,
    judgeSearch,
    setJudgeSearch,
    filteredJudgeUsers,
    judgeAssignmentCount,
    addJudgeModalOpen,
    openAddJudgeModal,
    closeAddJudgeModal,
    addJudgeSearch,
    setAddJudgeSearch,
    addJudgeSelectedUserId,
    setAddJudgeSelectedUserId,
    filteredNonJudgeUsers,
    handleAddJudge,
    createJudgeModalOpen,
    openCreateJudgeModal,
    closeCreateJudgeModal,
    createJudgeForm,
    setCreateJudgeForm,
    handleCreateJudge,
    handleToggleJudgeRole,
    pendingAction,
  };
};

