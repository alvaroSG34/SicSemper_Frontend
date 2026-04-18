import { useCallback, useMemo, useRef, useState, type FormEvent } from 'react';
import type {
  AdminClub,
  CatalogCategory,
  CatalogEvent,
  CatalogEventStatus,
  CatalogSubcategory,
  EventCategoryOption,
  EventDeleteImpact,
  JudgeAssignmentScope,
} from '@/domain/admin/admin.types';
import { adminUploadsService } from '@/application/admin/services/admin-uploads.service';
import { useAdminOperations } from './use-admin-operations';
import { useAdminStore } from '@/presentation/stores/admin.store';
import {
  combineLaPazDateAndTimeToUtcIso,
  splitUtcIsoToLaPazDateAndTime,
  toLaPazDateTimeTimestamp,
} from '@/core/utils/event-datetime';

type EventModalMode = 'create' | 'edit';

type EventFormState = {
  organizerClubId: string;
  name: string;
  place: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: CatalogEventStatus;
  description: string;
  imageUrl: string;
};

type EventCategoryRemovalImpact = {
  removedEventCategoryIds: string[];
  removedCategoryNames: string[];
  removedAssignmentsCount: number;
};

type EventCategoryTreeNode = {
  id: string;
  name: string;
  depth: number;
  children: EventCategoryTreeNode[];
};

type EventCategoryNodeSelectionState = {
  checked: boolean;
  indeterminate: boolean;
  selectedLeaves: number;
  totalLeaves: number;
};

const emptyEventForm: EventFormState = {
  organizerClubId: '',
  name: '',
  place: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  status: 'BORRADOR',
  description: '',
  imageUrl: '',
};

export const eventStatusOptions: CatalogEventStatus[] = ['ACTIVO', 'PAUSADO', 'BORRADOR'];

type UseAdminEventsParams = {
  events: CatalogEvent[];
  clubs: AdminClub[];
  categories: CatalogCategory[];
  subcategories: CatalogSubcategory[];
  eventCategories: EventCategoryOption[];
  assignments: JudgeAssignmentScope[];
  canReadJudgeAssignments: boolean;
};

export const useAdminEvents = ({
  events,
  clubs,
  categories,
  subcategories,
  eventCategories,
  assignments,
  canReadJudgeAssignments,
}: UseAdminEventsParams) => {
  const { createEventAndLinkCategories, updateEventAndLinkCategories, getEventDeleteImpact, removeEvent } =
    useAdminOperations();
  const clearError = useAdminStore((state) => state.clearError);

  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState<'TODOS' | CatalogEventStatus>('TODOS');
  const [eventModalMode, setEventModalMode] = useState<EventModalMode | null>(null);
  const [eventModalStep, setEventModalStep] = useState<1 | 2>(1);
  const [eventModalSelectedLeafIds, setEventModalSelectedLeafIds] = useState<Set<string>>(
    new Set(),
  );
  const [eventModalTargetId, setEventModalTargetId] = useState<string | null>(null);
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

  const subcategoriesByParentId = useMemo(() => {
    const map = new Map<string, CatalogSubcategory[]>();
    subcategories.forEach((subcategory) => {
      const current = map.get(subcategory.categoryId) ?? [];
      current.push(subcategory);
      map.set(subcategory.categoryId, current);
    });

    for (const [parentId, children] of map.entries()) {
      map.set(
        parentId,
        [...children].sort((left, right) => left.name.localeCompare(right.name)),
      );
    }

    return map;
  }, [subcategories]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = eventSearch.trim().toLowerCase();

    return events.filter((eventItem) => {
      const matchesStatus = eventStatusFilter === 'TODOS' ? true : eventItem.status === eventStatusFilter;
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : `${eventItem.name} ${eventItem.place ?? ''} ${eventItem.description ?? ''}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [eventSearch, eventStatusFilter, events]);

  const eventModalCategoryTree = useMemo<EventCategoryTreeNode[]>(() => {
    const buildChildren = (
      parentId: string,
      depth: number,
      ancestry: Set<string>,
    ): EventCategoryTreeNode[] => {
      const children = subcategoriesByParentId.get(parentId) ?? [];
      if (depth >= 3) {
        return [];
      }

      return children.map((child) => {
        if (ancestry.has(child.id)) {
          return {
            id: child.id,
            name: child.name,
            depth: depth + 1,
            children: [],
          };
        }

        const nextAncestry = new Set(ancestry);
        nextAncestry.add(child.id);
        return {
          id: child.id,
          name: child.name,
          depth: depth + 1,
          children: buildChildren(child.id, depth + 1, nextAncestry),
        };
      });
    };

    return [...categories]
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((rootCategory) => ({
        id: rootCategory.id,
        name: rootCategory.name,
        depth: 1,
        children: buildChildren(rootCategory.id, 1, new Set<string>([rootCategory.id])),
      }));
  }, [categories, subcategoriesByParentId]);

  const categoryLeafIdsByNodeId = useMemo(() => {
    const map = new Map<string, string[]>();

    const visitNode = (node: EventCategoryTreeNode): string[] => {
      if (node.children.length === 0) {
        map.set(node.id, [node.id]);
        return [node.id];
      }

      const leafIds = Array.from(
        new Set(node.children.flatMap((childNode) => visitNode(childNode))),
      );
      map.set(node.id, leafIds);
      return leafIds;
    };

    eventModalCategoryTree.forEach((rootNode) => {
      visitNode(rootNode);
    });

    return map;
  }, [eventModalCategoryTree]);

  const allLeafNodeIds = useMemo(
    () =>
      new Set(
        [...categoryLeafIdsByNodeId.entries()]
          .filter(([nodeId, leafIds]) => leafIds.length === 1 && leafIds[0] === nodeId)
          .map(([nodeId]) => nodeId),
      ),
    [categoryLeafIdsByNodeId],
  );

  const collectSelectedLeafCategoryIds = useCallback(
    () =>
      [...eventModalSelectedLeafIds].filter((leafId) =>
        allLeafNodeIds.has(leafId),
      ),
    [allLeafNodeIds, eventModalSelectedLeafIds],
  );

  const getCategoryNodeSelectionState = useCallback(
    (nodeId: string): EventCategoryNodeSelectionState => {
      const leafIds = categoryLeafIdsByNodeId.get(nodeId) ?? [];
      if (leafIds.length === 0) {
        return {
          checked: false,
          indeterminate: false,
          selectedLeaves: 0,
          totalLeaves: 0,
        };
      }

      const selectedLeaves = leafIds.filter((leafId) =>
        eventModalSelectedLeafIds.has(leafId),
      ).length;

      return {
        checked: selectedLeaves === leafIds.length,
        indeterminate: selectedLeaves > 0 && selectedLeaves < leafIds.length,
        selectedLeaves,
        totalLeaves: leafIds.length,
      };
    },
    [categoryLeafIdsByNodeId, eventModalSelectedLeafIds],
  );

  const eventModalCategoryRemovalImpact = useMemo<EventCategoryRemovalImpact>(() => {
    if (eventModalMode !== 'edit' || !eventModalTargetId) {
      return {
        removedEventCategoryIds: [],
        removedCategoryNames: [],
        removedAssignmentsCount: 0,
      };
    }

    const desiredLeafCategoryIds = new Set(collectSelectedLeafCategoryIds());
    const currentLinks = eventCategories.filter((entry) => entry.eventId === eventModalTargetId);
    const removedLinks = currentLinks.filter(
      (entry) => !desiredLeafCategoryIds.has(entry.categoryId),
    );
    const removedEventCategoryIds = removedLinks.map((entry) => entry.id);
    const removedEventCategorySet = new Set(removedEventCategoryIds);
    const removedAssignmentsCount = canReadJudgeAssignments
      ? assignments.filter(
          (assignment) =>
            assignment.eventId === eventModalTargetId &&
            removedEventCategorySet.has(assignment.eventCategoryId),
        ).length
      : 0;

    return {
      removedEventCategoryIds,
      removedCategoryNames: removedLinks.map((entry) => entry.name),
      removedAssignmentsCount,
    };
  }, [
    assignments,
    canReadJudgeAssignments,
    eventCategories,
    eventModalMode,
    eventModalTargetId,
    collectSelectedLeafCategoryIds,
  ]);

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
        message: error instanceof Error ? error.message : 'No se pudo completar la accion.',
      });
      return false;
    } finally {
      setPendingAction((current) => (current === actionKey ? null : current));
    }
  };

  const toggleCategorySelection = useCallback((categoryId: string) => {
    const leafIds = categoryLeafIdsByNodeId.get(categoryId) ?? [];
    if (leafIds.length === 0) {
      return;
    }

    setEventModalSelectedLeafIds((prev) => {
      const next = new Set(prev);

      const allSelected = leafIds.every((leafId) => next.has(leafId));
      for (const leafId of leafIds) {
        if (allSelected) {
          next.delete(leafId);
        } else {
          next.add(leafId);
        }
      }

      return next;
    });
  }, [categoryLeafIdsByNodeId]);

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
    setEventModalSelectedLeafIds(new Set());
    setEventModalError(null);
  };

  const openEditEventModal = (eventItem: CatalogEvent) => {
    setActionFeedback(null);
    clearError();
    setEventModalError(null);
    const startDateTime = splitUtcIsoToLaPazDateAndTime(eventItem.startDate);
    const endDateTime = splitUtcIsoToLaPazDateAndTime(eventItem.endDate);

    setEventModalMode('edit');
    setEventModalTargetId(eventItem.id);
    setEventModalStep(1);
    setEventForm({
      organizerClubId: eventItem.organizerClubId ?? clubs[0]?.id ?? '',
      name: eventItem.name,
      place: eventItem.place ?? '',
      startDate: startDateTime.date,
      startTime: startDateTime.time,
      endDate: endDateTime.date,
      endTime: endDateTime.time,
      status: eventItem.status,
      description: eventItem.description ?? '',
      imageUrl: eventItem.imageUrl ?? '',
    });

    const normalizedLeafIds = new Set<string>();
    eventCategories
      .filter((entry) => entry.eventId === eventItem.id)
      .forEach((entry) => {
        const leafIds = categoryLeafIdsByNodeId.get(entry.categoryId) ?? [];
        leafIds.forEach((leafId) => {
          if (allLeafNodeIds.has(leafId)) {
            normalizedLeafIds.add(leafId);
          }
        });
      });
    setEventModalSelectedLeafIds(normalizedLeafIds);
  };

  const closeEventModal = () => {
    if (pendingAction === 'event:create') {
      return;
    }
    if (eventModalTargetId && pendingAction === `event:update:${eventModalTargetId}`) {
      return;
    }

    setEventModalMode(null);
    setEventModalTargetId(null);
    setEventForm(emptyEventForm);
    setEventModalStep(1);
    setEventModalSelectedLeafIds(new Set());
    setEventModalError(null);
    if (eventImageFileInputRef.current) {
      eventImageFileInputRef.current.value = '';
    }
  };

  const handleEventImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) {
      return;
    }

    setIsEventImageUploading(true);
    try {
      const data = await adminUploadsService.uploadEventImage(file);
      setEventForm((prev) => ({ ...prev, imageUrl: data.url }));
      setEventModalError(null);
    } catch (error) {
      setEventModalError(
        error instanceof Error
          ? error.message
          : 'No se pudo subir la imagen del evento.',
      );
    } finally {
      setIsEventImageUploading(false);
    }
  };

  const handleSubmitEventModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (clubs.length === 0) {
      setEventModalError('Primero debes crear un club para asignarlo como organizador del evento.');
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
      !eventForm.startTime ||
      !eventForm.endDate ||
      !eventForm.endTime ||
      !eventForm.description.trim()
    ) {
      setEventModalError('Completa todos los campos requeridos para guardar el evento.');
      return;
    }

    const startTimestamp = toLaPazDateTimeTimestamp(eventForm.startDate, eventForm.startTime);
    const endTimestamp = toLaPazDateTimeTimestamp(eventForm.endDate, eventForm.endTime);

    if (startTimestamp === null || endTimestamp === null) {
      setEventModalError('La fecha u hora ingresada no es valida.');
      return;
    }

    if (startTimestamp > endTimestamp) {
      setEventModalError('La fecha y hora de inicio no puede ser mayor que la fecha y hora de fin.');
      return;
    }

    setEventModalError(null);
    setEventModalStep(2);
  };

  const handleFinalizeEventModal = async () => {
    if (!eventModalMode) {
      return;
    }
    if (eventModalMode === 'edit' && !eventModalTargetId) {
      return;
    }

    setEventModalError(null);

    const startDateIso = combineLaPazDateAndTimeToUtcIso(eventForm.startDate, eventForm.startTime);
    const endDateIso = combineLaPazDateAndTimeToUtcIso(eventForm.endDate, eventForm.endTime);

    if (!startDateIso || !endDateIso) {
      setEventModalError('La fecha u hora ingresada no es valida.');
      return;
    }

    const allCategoryIds = collectSelectedLeafCategoryIds();
    const actionKey = eventModalMode === 'create' ? 'event:create' : `event:update:${eventModalTargetId}`;

    const success = await executeAction(
      actionKey,
      eventModalMode === 'create' ? 'Evento creado correctamente.' : 'Evento actualizado correctamente.',
      async () => {
        if (eventModalMode === 'create') {
          await createEventAndLinkCategories(
            {
              organizerClubId: eventForm.organizerClubId,
              name: eventForm.name,
              status: eventForm.status,
              place: eventForm.place,
              startDate: startDateIso,
              endDate: endDateIso,
              description: eventForm.description,
              imageUrl: eventForm.imageUrl || undefined,
            },
            allCategoryIds,
          );
        } else if (eventModalTargetId) {
          await updateEventAndLinkCategories(
            {
              id: eventModalTargetId,
              organizerClubId: eventForm.organizerClubId,
              name: eventForm.name,
              status: eventForm.status,
              place: eventForm.place,
              startDate: startDateIso,
              endDate: endDateIso,
              description: eventForm.description,
              imageUrl: eventForm.imageUrl || undefined,
            },
            allCategoryIds,
          );
        }

        clearError();
      },
    );

    if (success) {
      closeEventModal();
    }
  };

  const openEventDeleteImpactModal = async (eventId: string, eventName: string) => {
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
    if (eventDeleteImpactModal && pendingAction === `event:delete:${eventDeleteImpactModal.eventId}`) {
      return;
    }
    setEventDeleteImpactModal(null);
  };

  const confirmDeleteEvent = async () => {
    if (!eventDeleteImpactModal) {
      return;
    }

    const { eventId } = eventDeleteImpactModal;
    const success = await executeAction(`event:delete:${eventId}`, 'Evento eliminado correctamente.', () =>
      removeEvent(eventId),
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
    (eventModalTargetId ? pendingAction === `event:update:${eventModalTargetId}` : false);

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
    eventModalSelectedLeafIds,
    toggleCategorySelection,
    eventModalCategoryTree,
    getCategoryNodeSelectionState,
    eventModalError,
    eventForm,
    setEventForm,
    eventImageFileInputRef,
    isEventImageUploading,
    handleEventImageFileChange,
    handleSubmitEventModal,
    isEventModalPending,
    eventModalCategoryRemovalImpact,
    handleFinalizeEventModal,
    closeEventModal,
    pendingAction,
    eventDeleteImpactModal,
    openEventDeleteImpactModal,
    closeEventDeleteImpactModal,
    confirmDeleteEvent,
  };
};
