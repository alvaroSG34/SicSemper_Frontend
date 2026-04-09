import { useMemo, useRef, useState, type FormEvent } from 'react';
import { adminUploadsService } from '@/application/admin/services/admin-uploads.service';
import type { AdminClub, ClubDeleteImpact } from '@/domain/admin/admin.types';
import { useAdminOperations } from './use-admin-operations';

type ClubModalMode = 'create' | 'edit';

type ClubFormState = {
  name: string;
  place: string;
  contactEmail: string;
  description: string;
  logoUrl: string;
};

const emptyClubForm: ClubFormState = {
  name: '',
  place: '',
  contactEmail: '',
  description: '',
  logoUrl: '',
};

export const useAdminClubs = (clubs: AdminClub[]) => {
  const { createClub, updateClub, getClubDeleteImpact, removeClub } = useAdminOperations();

  const [clubSearch, setClubSearch] = useState('');
  const [clubModalMode, setClubModalMode] = useState<ClubModalMode | null>(null);
  const [clubModalTargetId, setClubModalTargetId] = useState<string | null>(null);
  const [clubForm, setClubForm] = useState<ClubFormState>(emptyClubForm);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [clubDeleteImpactModal, setClubDeleteImpactModal] = useState<{
    clubId: string;
    clubName: string;
    impact: ClubDeleteImpact | null;
    loading: boolean;
    error: string | null;
  } | null>(null);

  const logoFileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredClubs = useMemo(() => {
    const normalizedQuery = clubSearch.trim().toLowerCase();

    return clubs.filter((club) => {
      if (!normalizedQuery) {
        return true;
      }

      return `${club.name} ${club.place} ${club.contactEmail} ${club.description ?? ''}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [clubs, clubSearch]);

  const executeAction = async (
    actionKey: string,
    successMessage: string,
    action: () => Promise<void>,
  ) => {
    setPendingAction(actionKey);
    setActionFeedback(null);

    try {
      await action();
      setActionFeedback({ type: 'success', message: successMessage });
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

  const openCreateClubModal = () => {
    setActionFeedback(null);
    setClubModalMode('create');
    setClubModalTargetId(null);
    setClubForm(emptyClubForm);
  };

  const openEditClubModal = (club: AdminClub) => {
    setActionFeedback(null);
    setClubModalMode('edit');
    setClubModalTargetId(club.id);
    setClubForm({
      name: club.name,
      place: club.place,
      contactEmail: club.contactEmail,
      description: club.description ?? '',
      logoUrl: club.logoUrl ?? '',
    });
  };

  const closeClubModal = () => {
    if (pendingAction === 'club:create') {
      return;
    }

    if (clubModalTargetId && pendingAction === `club:update:${clubModalTargetId}`) {
      return;
    }

    setClubModalMode(null);
    setClubModalTargetId(null);
    setClubForm(emptyClubForm);
  };

  const handleLogoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) {
      return;
    }

    setIsLogoUploading(true);

    try {
      const data = await adminUploadsService.uploadClubLogo(file);
      setClubForm((prev) => ({ ...prev, logoUrl: data.url as string }));
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo subir el logo del club.',
      });
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleSubmitClubModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!clubForm.name.trim() || !clubForm.place.trim() || !clubForm.contactEmail.trim()) {
      setActionFeedback({
        type: 'error',
        message: 'Completa nombre, lugar y correo de contacto del club.',
      });
      return;
    }

    const normalizedEmail = clubForm.contactEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setActionFeedback({ type: 'error', message: 'Ingresa un correo de contacto valido.' });
      return;
    }

    if (clubModalMode === 'create') {
      const success = await executeAction('club:create', 'Club creado correctamente.', () =>
        createClub({
          name: clubForm.name,
          place: clubForm.place,
          contactEmail: normalizedEmail,
          description: clubForm.description || undefined,
          logoUrl: clubForm.logoUrl || undefined,
        }),
      );

      if (success) {
        closeClubModal();
      }
      return;
    }

    if (clubModalMode === 'edit' && clubModalTargetId) {
      const success = await executeAction(`club:update:${clubModalTargetId}`, 'Club actualizado correctamente.', () =>
        updateClub({
          id: clubModalTargetId,
          name: clubForm.name,
          place: clubForm.place,
          contactEmail: normalizedEmail,
          description: clubForm.description || undefined,
          logoUrl: clubForm.logoUrl || undefined,
        }),
      );

      if (success) {
        closeClubModal();
      }
    }
  };

  const openClubDeleteImpactModal = async (clubId: string, clubName: string) => {
    setActionFeedback(null);
    setClubDeleteImpactModal({
      clubId,
      clubName,
      impact: null,
      loading: true,
      error: null,
    });

    try {
      const impact = await getClubDeleteImpact(clubId);
      setClubDeleteImpactModal((prev) =>
        prev && prev.clubId === clubId
          ? {
              ...prev,
              impact,
              loading: false,
              error: null,
            }
          : prev,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo calcular el impacto de eliminacion del club.';
      setClubDeleteImpactModal((prev) =>
        prev && prev.clubId === clubId
          ? {
              ...prev,
              loading: false,
              error: message,
            }
          : prev,
      );
    }
  };

  const closeClubDeleteImpactModal = () => {
    if (clubDeleteImpactModal && pendingAction === `club:delete:${clubDeleteImpactModal.clubId}`) {
      return;
    }

    setClubDeleteImpactModal(null);
  };

  const confirmDeleteClub = async () => {
    if (!clubDeleteImpactModal) {
      return;
    }

    const { clubId } = clubDeleteImpactModal;
    const success = await executeAction(`club:delete:${clubId}`, 'Club eliminado correctamente.', () =>
      removeClub(clubId),
    );

    if (success) {
      if (clubModalMode === 'edit' && clubModalTargetId === clubId) {
        closeClubModal();
      }
      setClubDeleteImpactModal(null);
    }
  };

  const isClubModalPending =
    pendingAction === 'club:create' ||
    (clubModalTargetId ? pendingAction === `club:update:${clubModalTargetId}` : false);

  return {
    actionFeedback,
    clubSearch,
    setClubSearch,
    filteredClubs,
    openCreateClubModal,
    openEditClubModal,
    clubModalMode,
    closeClubModal,
    clubForm,
    setClubForm,
    isLogoUploading,
    logoFileInputRef,
    handleLogoFileChange,
    handleSubmitClubModal,
    isClubModalPending,
    pendingAction,
    clubDeleteImpactModal,
    openClubDeleteImpactModal,
    closeClubDeleteImpactModal,
    confirmDeleteClub,
  };
};


