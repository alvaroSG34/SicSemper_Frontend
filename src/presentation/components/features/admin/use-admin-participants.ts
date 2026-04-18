import { useEffect, useMemo, useState } from 'react';
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

const isParticipantOnlyUser = (user: User) =>
  user.roles.includes('PARTICIPANTE') &&
  !user.roles.includes('JUEZ') &&
  !user.roles.includes('ADMIN') &&
  !user.roles.includes('SUPERADMIN');

type ParticipantRoleFilter = 'TODOS' | 'SOLO_PARTICIPANTES';

export const useAdminParticipants = (users: User[]) => {
  const { banParticipant, unbanParticipant, setParticipantVerified } = useAdminOperations();
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantRoleFilter, setParticipantRoleFilter] =
    useState<ParticipantRoleFilter>('SOLO_PARTICIPANTES');
  const [participantDetailModal, setParticipantDetailModal] = useState<User | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!participantDetailModal) {
      return;
    }

    const refreshedUser = users.find((candidate) => candidate.id === participantDetailModal.id);
    if (!refreshedUser) {
      setParticipantDetailModal(null);
      return;
    }

    if (refreshedUser !== participantDetailModal) {
      setParticipantDetailModal(refreshedUser);
    }
  }, [participantDetailModal, users]);

  const participantPool = useMemo(() => {
    if (participantRoleFilter === 'TODOS') {
      return users.filter((candidate) => candidate.roles.includes('PARTICIPANTE'));
    }

    return users.filter(isParticipantOnlyUser);
  }, [participantRoleFilter, users]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = participantSearch.trim().toLowerCase();

    return participantPool.filter((candidate) => {
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : `${candidate.name} ${candidate.email} ${candidate.roles.join(' ')}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesSearch;
    });
  }, [participantPool, participantSearch]);

  const participantKpis = useMemo(() => {
    return {
      total: participantPool.length,
      verified: participantPool.filter((user) => user.verified).length,
      active: participantPool.filter((user) => user.status === 'ACTIVO').length,
    };
  }, [participantPool]);

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

  const canEditParticipantVerification = (user: User) => isParticipantOnlyUser(user);

  const handleSetParticipantVerified = async (userId: string, currentVerified: boolean) => {
    const nextVerified = !currentVerified;
    const confirmationMessage = nextVerified
      ? '¿Confirmas marcar esta cuenta como verificada?'
      : '¿Confirmas revocar la verificacion de esta cuenta?';

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    await executeAction(
      `user:verified:${userId}`,
      nextVerified
        ? 'Cuenta marcada como verificada.'
        : 'Verificacion de cuenta revocada.',
      () => setParticipantVerified(userId, nextVerified),
    );
  };

  return {
    roleLabel,
    participantStatusConfig,
    participantSearch,
    setParticipantSearch,
    participantRoleFilter,
    setParticipantRoleFilter,
    filteredUsers,
    participantKpis,
    participantDetailModal,
    setParticipantDetailModal,
    pendingAction,
    actionFeedback,
    handleBanParticipant,
    canEditParticipantVerification,
    handleSetParticipantVerified,
  };
};

