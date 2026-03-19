import { useMemo, useState } from 'react';
import type { UserRole } from '@/domain/user/user.types';
import type { User } from '@/domain/user/user.types';
import { useAdminOperations } from './use-admin-operations';

const roleLabel: Record<UserRole, string> = {
  PARTICIPANTE: 'Participante',
  JUEZ: 'Juez',
  ADMIN: 'Admin',
  SUPERADMIN: 'Superadmin',
};

const participantStatusConfig: Record<string, { label: string; className: string }> = {
  ACTIVO: { label: 'Activo', className: 'bg-green-900/40 text-green-400' },
  INACTIVO: { label: 'Inactivo', className: 'bg-[#2D2D2D] text-[#9C9C9C]' },
  SUSPENDIDO: { label: 'Suspendido', className: 'bg-red-900/40 text-red-400' },
};

export const useAdminParticipants = (users: User[]) => {
  const { banParticipant, unbanParticipant } = useAdminOperations();
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantDetailModal, setParticipantDetailModal] = useState<User | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = participantSearch.trim().toLowerCase();

    return users.filter((candidate) => {
      if (!candidate.roles.includes('PARTICIPANTE')) return false;
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : `${candidate.name} ${candidate.email} ${candidate.roles.join(' ')}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesSearch;
    });
  }, [users, participantSearch]);

  const participantKpis = useMemo(() => {
    const participants = users.filter((user) => user.roles.includes('PARTICIPANTE'));
    return {
      total: participants.length,
      verified: participants.filter((user) => user.verified).length,
      active: participants.filter((user) => user.status === 'ACTIVO').length,
    };
  }, [users]);

  const executeAction = async (
    actionKey: string,
    successMessage: string,
    action: () => Promise<void>,
  ) => {
    setPendingAction(actionKey);
    setActionFeedback(null);

    try {
      await action();
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

  const handleBanParticipant = async (userId: string, isBanned: boolean) => {
    const success = await executeAction(
      `user:ban:${userId}`,
      isBanned ? 'Suspension levantada.' : 'Participante suspendido.',
      () => (isBanned ? unbanParticipant(userId) : banParticipant(userId)),
    );

    if (success) {
      setParticipantDetailModal(null);
    }
  };

  return {
    roleLabel,
    participantStatusConfig,
    participantSearch,
    setParticipantSearch,
    filteredUsers,
    participantKpis,
    participantDetailModal,
    setParticipantDetailModal,
    pendingAction,
    actionFeedback,
    handleBanParticipant,
  };
};

