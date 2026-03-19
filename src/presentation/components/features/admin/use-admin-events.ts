import { useMemo, useRef, useState, type FormEvent } from 'react';
import type {
  AdminClub,
  CatalogCategory,
  CatalogEvent,
  CatalogEventStatus,
  CatalogSubcategory,
  EventCategoryOption,
  EventDeleteImpact,
} from '@/domain/admin/admin.types';
import { useAdminOperations } from './use-admin-operations';
import { useAdminStore } from '@/presentation/stores/admin.store';

type EventModalMode = 'create' | 'edit';

type EventFormState = {
  organizerClubId: string;
  name: string;
  place: string;
  startDate: string;
  endDate: string;
  status: CatalogEventStatus;
  description: string;
  imageUrl: string;
};

const emptyEventForm: EventFormState = {
  organizerClubId: '',
  name: '',
  place: '',
  startDate: '',
  endDate: '',
  status: 'BORRADOR',
  description: '',
  imageUrl: '',
};

export const eventStatusOptions: CatalogEventStatus[] = [
  'ACTIVO',
  'PAUSADO',
  'BORRADOR',
];

const toDateInputValue = (value: string | null | undefined) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (isoMatch?.[1]) {
    return isoMatch[1];
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
};

type UseAdminEventsParams = {
  events: CatalogEvent[];
  clubs: AdminClub[];
  categories: CatalogCategory[];
  subcategories: CatalogSubcategory[];
  eventCategories: EventCategoryOption[];
};

export const useAdminEvents = ({
  events,
  clubs,
  categories,
  subcategories,
  eventCategories,
}: UseAdminEventsParams) => {
  const {
    createEventAndLinkCategories,
    updateEventAndLinkCategories,
    getEventDeleteImpact,
    removeEvent,
  } = useAdminOperations();
  const clearError = useAdminStore((state) => state.clearError);

  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState<
    'TODOS' | CatalogEventStatus
  >('TODOS');
  const [eventModalMode, setEventModalMode] = useState<EventModalMode | null>(
    null,
  );
  const [eventModalStep, setEventModalStep] = useState<1 | 2>(1);
  const [eventModalSelectedCategoryIds, setEventModalSelectedCategoryIds] =
    useState<Set<string>>(new Set());
  const [eventModalTargetId, setEventModalTargetId] = useState<string | null>(
    null,
  );
  const [eventModalError, setEventModalError] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>(emptyEventForm);
  const [isEventImageUploading, setIsEventImageUploading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [eventDeleteImpactModal, setEventDeleteImpactModal] = useState<{
    eventId: string;
    eventName: string;
    impact: EventDeleteImpact | null;
    loading: boolean;
    error: string | null;
  } | null>(null);

  const eventImageFileInputRef = useRef<HTMLInputElement | null>(null);

  const subcategoriesByCategoryId = useMemo(() => {
    const map = new Map<string, CatalogSubcategory[]>();
    subcategories.forEach((subcategory) => {
      const current = map.get(subcategory.categoryId) ?? [];
      current.push(subcategory);
      map.set(subcategory.categoryId, current);
    });
    return map;
  }, [subcategories]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = eventSearch.trim().toLowerCase();

    return events.filter((eventItem) => {
      const matchesStatus =
        eventStatusFilter === 'TODOS'
          ? true
          : eventItem.status === eventStatusFilter;
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : `${eventItem.name} ${eventItem.place ?? ''} ${eventItem.description ?? ''}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [eventSearch, eventStatusFilter, events]);

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
        setActionFeedback({ type: 'error', message: latestError });
        return false;
      }

      setActionFeedback({ type: 'success', message: successMessage });
      return true;
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo completar la accion.',
      });
      return false;
    } finally {
      setPendingAction((current) => (current === actionKey ? null : current));
    }
  };

  const openCreateEventModal = () => {
    setActionFeedback(null);
    clearError();
    setEventModalMode('create');
    setEventModalTargetId(null);
    setEventForm({
      ...emptyEventForm,
      organizerClubId: clubs[0]?.id ?? '',
    });
    setEventModalStep(1);
    setEventModalSelectedCategoryIds(new Set());
    setEventModalError(null);
  };

  const openEditEventModal = (eventItem: CatalogEvent) => {
    setActionFeedback(null);
    clearError();
    setEventModalError(null);
    setEventModalMode('edit');
    setEventModalTargetId(eventItem.id);
    setEventModalStep(1);
    setEventForm({
      organizerClubId: eventItem.organizerClubId ?? clubs[0]?.id ?? '',
      name: eventItem.name,
      place: eventItem.place ?? '',
      startDate: toDateInputValue(eventItem.startDate),
      endDate: toDateInputValue(eventItem.endDate),
      status: eventItem.status,
      description: eventItem.description ?? '',
      imageUrl: eventItem.imageUrl ?? '',
    });

    const rootCategoryIds = new Set(categories.map((category) => category.id));
    const linkedRootIds = new Set(
      eventCategories
        .filter(
          (entry) =>
            entry.eventId === eventItem.id &&
            rootCategoryIds.has(entry.categoryId),
        )
        .map((entry) => entry.categoryId),
    );
    setEventModalSelectedCategoryIds(linkedRootIds);
  };

  const closeEventModal = () => {
    if (pendingAction === 'event:create') {
      return;
    }
    if (
      eventModalTargetId &&
      pendingAction === `event:update:${eventModalTargetId}`
    ) {
      return;
    }

    setEventModalMode(null);
    setEventModalTargetId(null);
    setEventForm(emptyEventForm);
    setEventModalStep(1);
    setEventModalSelectedCategoryIds(new Set());
    setEventModalError(null);
    if (eventImageFileInputRef.current) {
      eventImageFileInputRef.current.value = '';
    }
  };

  const handleEventImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) {
      return;
    }

    setIsEventImageUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const response = await fetch('/api/upload/event-image', {
        method: 'POST',
        body: fd,
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setEventModalError(data.error ?? 'No se pudo subir la imagen del evento.');
        return;
      }

      const data = (await response.json()) as { url: string };
      setEventForm((prev) => ({ ...prev, imageUrl: data.url }));
      setEventModalError(null);
    } catch {
      setEventModalError('No se pudo subir la imagen del evento.');
    } finally {
      setIsEventImageUploading(false);
    }
  };

  const handleSubmitEventModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (clubs.length === 0) {
      setEventModalError(
        'Primero debes crear un club para asignarlo como organizador del evento.',
      );
      return;
    }

    if (!eventForm.organizerClubId) {
      setEventModalError('Selecciona el club organizador del evento.');
      return;
    }

    if (
      !eventForm.name.trim() ||
      !eventForm.place.trim() ||
      !eventForm.startDate ||
      !eventForm.endDate ||
      !eventForm.description.trim()
    ) {
      setEventModalError(
        'Completa todos los campos requeridos para guardar el evento.',
      );
      return;
    }

    if (eventForm.startDate > eventForm.endDate) {
      setEventModalError(
        'La fecha de inicio no puede ser mayor que la fecha de fin.',
      );
      return;
    }

    setEventModalError(null);
    if (eventModalMode === 'create' || eventModalMode === 'edit') {
      setEventModalStep(2);
    }
  };

  const collectCategoryAndSubcategoryIds = () => {
    const allCategoryIds: string[] = [];
    for (const rootId of eventModalSelectedCategoryIds) {
      allCategoryIds.push(rootId);
      (subcategoriesByCategoryId.get(rootId) ?? []).forEach((subcategory) =>
        allCategoryIds.push(subcategory.id),
      );
    }
    return allCategoryIds;
  };

  const handleConfirmCreateEvent = async () => {
    const allCategoryIds = collectCategoryAndSubcategoryIds();
    const success = await executeAction(
      'event:create',
      'Evento creado correctamente.',
      () =>
        createEventAndLinkCategories(
          {
            organizerClubId: eventForm.organizerClubId,
            name: eventForm.name,
            status: eventForm.status,
            place: eventForm.place,
            startDate: eventForm.startDate,
            endDate: eventForm.endDate,
            description: eventForm.description,
            imageUrl: eventForm.imageUrl || undefined,
          },
          allCategoryIds,
        ),
    );

    if (success) {
      closeEventModal();
    }
  };

  const handleConfirmUpdateEvent = async () => {
    if (!eventModalTargetId) return;

    const allCategoryIds = collectCategoryAndSubcategoryIds();
    const success = await executeAction(
      `event:update:${eventModalTargetId}`,
      'Evento actualizado correctamente.',
      () =>
        updateEventAndLinkCategories(
          {
            id: eventModalTargetId,
            organizerClubId: eventForm.organizerClubId,
            name: eventForm.name,
            status: eventForm.status,
            place: eventForm.place,
            startDate: eventForm.startDate,
            endDate: eventForm.endDate,
            description: eventForm.description,
            imageUrl: eventForm.imageUrl || undefined,
          },
          allCategoryIds,
        ),
    );

    if (success) {
      closeEventModal();
    }
  };

  const openEventDeleteImpactModal = async (
    eventId: string,
    eventName: string,
  ) => {
    setActionFeedback(null);
    clearError();
    setEventDeleteImpactModal({
      eventId,
      eventName,
      impact: null,
      loading: true,
      error: null,
    });

    try {
      const impact = await getEventDeleteImpact(eventId);
      setEventDeleteImpactModal((prev) =>
        prev && prev.eventId === eventId
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
        error instanceof Error
          ? error.message
          : 'No se pudo calcular el impacto de eliminacion para este evento.';
      setEventDeleteImpactModal((prev) =>
        prev && prev.eventId === eventId
          ? {
              ...prev,
              loading: false,
              error: message,
            }
          : prev,
      );
    }
  };

  const closeEventDeleteImpactModal = () => {
    if (
      eventDeleteImpactModal &&
      pendingAction === `event:delete:${eventDeleteImpactModal.eventId}`
    ) {
      return;
    }
    setEventDeleteImpactModal(null);
  };

  const confirmDeleteEvent = async () => {
    if (!eventDeleteImpactModal) {
      return;
    }

    const { eventId } = eventDeleteImpactModal;
    const success = await executeAction(
      `event:delete:${eventId}`,
      'Evento eliminado correctamente.',
      () => removeEvent(eventId),
    );

    if (success) {
      if (eventModalMode === 'edit' && eventModalTargetId === eventId) {
        closeEventModal();
      }
      setEventDeleteImpactModal(null);
    }
  };

  const isEventModalPending =
    pendingAction === 'event:create' ||
    (eventModalTargetId
      ? pendingAction === `event:update:${eventModalTargetId}`
      : false);

  return {
    actionFeedback,
    filteredEvents,
    eventSearch,
    setEventSearch,
    eventStatusFilter,
    setEventStatusFilter,
    eventStatusOptions,
    openCreateEventModal,
    openEditEventModal,
    eventModalMode,
    eventModalStep,
    setEventModalStep,
    eventModalSelectedCategoryIds,
    setEventModalSelectedCategoryIds,
    eventModalError,
    eventForm,
    setEventForm,
    eventImageFileInputRef,
    isEventImageUploading,
    handleEventImageFileChange,
    handleSubmitEventModal,
    isEventModalPending,
    handleConfirmCreateEvent,
    handleConfirmUpdateEvent,
    closeEventModal,
    categoryItems: categories,
    subcategoriesByCategoryId,
    pendingAction,
    eventDeleteImpactModal,
    openEventDeleteImpactModal,
    closeEventDeleteImpactModal,
    confirmDeleteEvent,
  };
};

