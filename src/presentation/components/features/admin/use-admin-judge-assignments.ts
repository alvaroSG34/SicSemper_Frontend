import { useMemo, useState } from 'react';
import type {
  CatalogEvent,
  EventCategoryOption,
  JudgeAssignmentScope,
} from '@/domain/admin/admin.types';
import type { User } from '@/domain/user/user.types';
import { useAdminStore } from '@/presentation/stores/admin.store';
import { useAdminOperations } from './use-admin-operations';

type JudgeAssignmentModalState = {
  userId: string;
  userName: string;
};

type UseAdminJudgeAssignmentsParams = {
  assignments: JudgeAssignmentScope[];
  events: CatalogEvent[];
  eventCategories: EventCategoryOption[];
};

export const useAdminJudgeAssignments = ({
  assignments,
  events,
  eventCategories,
}: UseAdminJudgeAssignmentsParams) => {
  const { assignJudgeScope, removeJudgeScope } = useAdminOperations();
  const clearError = useAdminStore((state) => state.clearError);

  const [judgeAssignmentModal, setJudgeAssignmentModal] =
    useState<JudgeAssignmentModalState | null>(null);
  const [selectedEventCategoryId, setSelectedEventCategoryId] = useState('');
  const [pendingAssignmentAction, setPendingAssignmentAction] = useState<string | null>(null);
  const [assignmentFeedback, setAssignmentFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const eventById = useMemo(
    () => new Map(events.map((event) => [event.id, event] as const)),
    [events],
  );
  const eventCategoryById = useMemo(
    () => new Map(eventCategories.map((entry) => [entry.id, entry] as const)),
    [eventCategories],
  );

  const activeJudgeAssignments = useMemo(() => {
    if (!judgeAssignmentModal) {
      return [];
    }

    return assignments
      .filter((assignment) => assignment.judgeUserId === judgeAssignmentModal.userId)
      .map((assignment) => {
        const event = eventById.get(assignment.eventId);
        const eventCategory = eventCategoryById.get(assignment.eventCategoryId);
        return {
          ...assignment,
          eventName: event?.name ?? 'Evento',
          scopeName: eventCategory?.name ?? assignment.eventCategoryId,
        };
      });
  }, [assignments, eventById, eventCategoryById, judgeAssignmentModal]);

  const availableEventCategories = useMemo(() => {
    if (!judgeAssignmentModal) {
      return [];
    }

    const assignedSet = new Set(
      assignments
        .filter((assignment) => assignment.judgeUserId === judgeAssignmentModal.userId)
        .map((assignment) => assignment.eventCategoryId),
    );

    return eventCategories.filter((entry) => !assignedSet.has(entry.id));
  }, [assignments, eventCategories, judgeAssignmentModal]);

  const executeAssignmentAction = async (
    actionKey: string,
    successMessage: string,
    action: () => Promise<void>,
  ) => {
    setPendingAssignmentAction(actionKey);
    setAssignmentFeedback(null);
    clearError();

    try {
      await action();
      const latestError = useAdminStore.getState().error;
      if (latestError) {
        setAssignmentFeedback({
          type: 'error',
          message: latestError,
        });
        return false;
      }

      setAssignmentFeedback({
        type: 'success',
        message: successMessage,
      });
      return true;
    } catch (error) {
      setAssignmentFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo completar la accion.',
      });
      return false;
    } finally {
      setPendingAssignmentAction((current) => (current === actionKey ? null : current));
    }
  };

  const openJudgeAssignmentsModal = (targetUser: User) => {
    setJudgeAssignmentModal({
      userId: targetUser.id,
      userName: targetUser.name,
    });
    setSelectedEventCategoryId('');
    setAssignmentFeedback(null);
  };

  const closeJudgeAssignmentsModal = () => {
    if (pendingAssignmentAction) {
      return;
    }

    setJudgeAssignmentModal(null);
    setSelectedEventCategoryId('');
    setAssignmentFeedback(null);
  };

  const handleAssignScope = async () => {
    if (!judgeAssignmentModal || !selectedEventCategoryId) {
      return;
    }

    const selectedCategory = eventCategoryById.get(selectedEventCategoryId);
    if (!selectedCategory) {
      setAssignmentFeedback({
        type: 'error',
        message: 'Selecciona un alcance valido.',
      });
      return;
    }

    const success = await executeAssignmentAction(
      `judge-assignment:create:${judgeAssignmentModal.userId}:${selectedEventCategoryId}`,
      'Alcance asignado correctamente.',
      () =>
        assignJudgeScope({
          judgeUserId: judgeAssignmentModal.userId,
          eventId: selectedCategory.eventId,
          eventCategoryId: selectedEventCategoryId,
        }),
    );

    if (success) {
      setSelectedEventCategoryId('');
    }
  };

  const handleRemoveScope = async (assignmentId: string) => {
    const confirmed = window.confirm('¿Seguro que deseas remover este alcance del juez?');
    if (!confirmed) {
      return;
    }

    await executeAssignmentAction(
      `judge-assignment:remove:${assignmentId}`,
      'Alcance removido correctamente.',
      () => removeJudgeScope(assignmentId),
    );
  };

  return {
    judgeAssignmentModal,
    openJudgeAssignmentsModal,
    closeJudgeAssignmentsModal,
    selectedEventCategoryId,
    setSelectedEventCategoryId,
    activeJudgeAssignments,
    availableEventCategories,
    pendingAssignmentAction,
    assignmentFeedback,
    handleAssignScope,
    handleRemoveScope,
  };
};

