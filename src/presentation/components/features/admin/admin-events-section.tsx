import { ImageWithSkeleton } from '@/presentation/components/ui';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CalendarDays, Check, ChevronRight, Clock3, Layers, Search } from 'lucide-react';
import type {
  AdminClub,
  CatalogCategory,
  CatalogEvent,
  CatalogScale,
  CatalogSubcategory,
  EventCategoryOption,
  JudgeAssignmentScope,
} from '@/domain/admin/admin.types';
import type { User } from '@/domain/user/user.types';
import { useAdminEvents } from './use-admin-events';
import { JudgeEventAssignmentBoard } from './judge-event-assignment-board';
import { useAdminJudgeAssignments } from './use-admin-judge-assignments';
import { formatEventDateRangeInLaPaz } from '@/core/utils/event-datetime';

type AdminEventsSectionProps = {
  events: CatalogEvent[];
  clubs: AdminClub[];
  categories: CatalogCategory[];
  subcategories: CatalogSubcategory[];
  eventCategories: EventCategoryOption[];
  scales: CatalogScale[];
  users: User[];
  assignments: JudgeAssignmentScope[];
  headingClassName: string;
  loading?: boolean;
  canCreateEvents: boolean;
  canUpdateEvents: boolean;
  canDeleteEvents: boolean;
  canReadJudgeAssignments: boolean;
  canManageJudgeAssignments: boolean;
};

const TriStateCheckbox = ({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) => (
  <input
    type="checkbox"
    checked={checked}
    ref={(input) => {
      if (input) {
        input.indeterminate = indeterminate;
      }
    }}
    onChange={onChange}
    className="h-4 w-4 accent-[#5B68F1]"
  />
);

export function AdminEventsSection({
  events,
  clubs,
  categories,
  subcategories,
  eventCategories,
  scales,
  users,
  assignments,
  headingClassName,
  loading = false,
  canCreateEvents,
  canUpdateEvents,
  canDeleteEvents,
  canReadJudgeAssignments,
  canManageJudgeAssignments,
}: AdminEventsSectionProps) {
  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const startTimeInputRef = useRef<HTMLInputElement | null>(null);
  const endDateInputRef = useRef<HTMLInputElement | null>(null);
  const endTimeInputRef = useRef<HTMLInputElement | null>(null);

  const openNativePicker = (input: HTMLInputElement | null) => {
    if (!input) {
      return;
    }

    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === 'function') {
      pickerInput.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  const {
    actionFeedback,
    filteredEvents,
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
    eventModalScaleConfigLoading,
    availableScales,
    eventModalScaleCategorySearch,
    setEventModalScaleCategorySearch,
    eventModalScaleSubcategorySearch,
    setEventModalScaleSubcategorySearch,
    eventModalScaleSpecialtySearch,
    setEventModalScaleSpecialtySearch,
    eventModalSelectedScaleCategoryId,
    eventModalSelectedScaleSubcategoryId,
    eventModalSelectedScaleLeafId,
    filteredStep3ScaleCategories,
    filteredStep3ScaleSubcategories,
    filteredStep3ScaleSpecialties,
    selectStep3ScaleCategory,
    selectStep3ScaleSubcategory,
    selectStep3ScaleSpecialty,
    step3ScaleProgress,
    activeStep3ScaleSpecialty,
    eventModalScaleDraftIds,
    markAllStep3ScaleDraft,
    clearStep3ScaleDraft,
    toggleStep3ScaleDraftId,
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
  } = useAdminEvents({
    events,
    clubs,
    categories,
    subcategories,
    eventCategories,
    scales,
    assignments,
    canReadJudgeAssignments,
  });

  const {
    selectedEventId,
    setSelectedEventId,
    eligibleJudges,
    selectedCategoryTree,
    assignedJudgeIds,
    judgeSubcategoryDraft,
    toggleJudgeCategoryNode,
    getJudgeNodeSelectionState,
    assignJudgeToEventDraft,
    unassignJudgeFromEventDraft,
    judgeValidationIssues,
    pendingAssignmentAction,
    assignmentFeedback,
    handleSaveAssignments,
  } = useAdminJudgeAssignments({
    users,
    assignments,
    events,
    categories,
    subcategories,
    eventCategories,
    canManageJudgeAssignments,
  });

  const [managedEventId, setManagedEventId] = useState<string | null>(null);
  const [expandedCategoryNodeIds, setExpandedCategoryNodeIds] = useState<Set<string>>(
    new Set(),
  );

  const managedEvent = useMemo(
    () => (managedEventId ? events.find((eventItem) => eventItem.id === managedEventId) ?? null : null),
    [events, managedEventId],
  );

  useEffect(() => {
    if (!managedEvent) {
      return;
    }
    if (selectedEventId !== managedEvent.id) {
      setSelectedEventId(managedEvent.id);
    }
  }, [managedEvent, selectedEventId, setSelectedEventId]);

  const handleOpenJudgeManager = (eventId: string) => {
    setManagedEventId(eventId);
    setSelectedEventId(eventId);
  };

  const handleCloseJudgeManager = () => {
    setManagedEventId(null);
  };

  const toggleCategoryNodeExpanded = (nodeId: string) => {
    setExpandedCategoryNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const selectedLeafCount = useMemo(
    () => eventModalSelectedLeafIds.size,
    [eventModalSelectedLeafIds],
  );
  const totalLeafCount = useMemo(
    () =>
      eventModalCategoryTree.reduce(
        (accumulator, rootNode) =>
          accumulator + getCategoryNodeSelectionState(rootNode.id).totalLeaves,
        0,
      ),
    [eventModalCategoryTree, getCategoryNodeSelectionState],
  );

  const handleFinalizeWithGuard = async () => {
    if (eventModalMode === 'edit' && eventModalCategoryRemovalImpact.removedEventCategoryIds.length > 0) {
      const confirmMessage =
        canReadJudgeAssignments && eventModalCategoryRemovalImpact.removedAssignmentsCount > 0
          ? `Se quitaran ${eventModalCategoryRemovalImpact.removedEventCategoryIds.length} alcance(s) del evento y se eliminaran ${eventModalCategoryRemovalImpact.removedAssignmentsCount} asignacion(es) de jueces asociadas. Deseas continuar?`
          : `Se quitaran ${eventModalCategoryRemovalImpact.removedEventCategoryIds.length} alcance(s) del evento. Deseas continuar?`;
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
    }

    await handleFinalizeEventModal();
  };

  const isManagingEventReady = Boolean(managedEvent && selectedEventId === managedEvent.id);
  const isAssignmentPending = pendingAssignmentAction === `judge-assignment:sync:${selectedEventId}`;

  return (
    <>
      <section id="eventos" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className={`${headingClassName} text-[20px] font-semibold text-white`}>Eventos</h3>
            <span className="text-xs text-[#9C9C9C]">Catalogo de eventos con edicion y eliminacion</span>
          </div>
          {canCreateEvents ? (
            <button
              type="button"
              onClick={openCreateEventModal}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white"
            >
              Crear evento
            </button>
          ) : null}
        </div>

        {actionFeedback ? (
          <p
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
              actionFeedback.type === 'success'
                ? 'border-[#14532d] bg-[#052e16] text-[#86efac]'
                : 'border-[#7f1d1d] bg-[#7f1d1d]/20 text-[#fca5a5]'
            }`}
          >
            {actionFeedback.message}
          </p>
        ) : null}

      

        <div className="mt-4 space-y-3">
          {filteredEvents.map((item) => {
            const isDeleting = pendingAction === `event:delete:${item.id}`;
            const isManaging = managedEventId === item.id;
            return (
              <article
                key={item.id}
                className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4 md:flex md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md border border-[#2D2D2D] bg-[#0B0B0B]">
                    {item.imageUrl ? (
                      <ImageWithSkeleton
                        src={item.imageUrl}
                        alt={`Imagen de ${item.name}`}
                        width={240}
                        height={160}
                        sizes="96px"
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-[#7F7F7F]">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <span className="rounded-full border border-[#2D2D2D] bg-[#101010] px-2 py-0.5 text-[11px] text-[#B8B8B8]">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#9C9C9C]">{item.place || 'Sin lugar definido'}</p>
                    <p className="mt-1 text-xs text-[#9C9C9C]">
                      {formatEventDateRangeInLaPaz(item.startDate, item.endDate)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
                  {canReadJudgeAssignments ? (
                    <button
                      type="button"
                      disabled={loading || isDeleting}
                      onClick={() => handleOpenJudgeManager(item.id)}
                      className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold text-white ${
                        isManaging
                          ? 'border border-[#5B68F1] bg-[rgba(91,104,241,0.2)]'
                          : 'border border-[#2D2D2D]'
                      }`}
                    >
                      {isManaging ? 'Gestionando jueces' : 'Gestionar jueces'}
                    </button>
                  ) : null}
                  {canUpdateEvents ? (
                    <button
                      type="button"
                      disabled={loading || isDeleting}
                      onClick={() => openEditEventModal(item)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                    >
                      Editar
                    </button>
                  ) : null}
                  {canDeleteEvents ? (
                    <button
                      type="button"
                      disabled={loading || isDeleting}
                      onClick={() => void openEventDeleteImpactModal(item.id, item.name)}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4B1F2A] px-3 text-xs font-semibold text-white"
                    >
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
          {filteredEvents.length === 0 ? (
            <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
              No se encontraron eventos con los filtros seleccionados.
            </p>
          ) : null}
        </div>
      </section>

      {canReadJudgeAssignments && managedEvent ? (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-6xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className={`${headingClassName} text-[20px] font-semibold text-white`}>
                  Gestionar jueces por evento
                </h4>
                <p className="text-xs text-[#9C9C9C]">{managedEvent.name}</p>
              </div>
              <button
                type="button"
                onClick={handleCloseJudgeManager}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
              >
                Cerrar
              </button>
            </div>

            {assignmentFeedback ? (
              <p
                className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                  assignmentFeedback.type === 'success'
                    ? 'border-[#14532d] bg-[#052e16] text-[#86efac]'
                    : 'border-[#7f1d1d] bg-[#7f1d1d]/20 text-[#fca5a5]'
                }`}
              >
                {assignmentFeedback.message}
              </p>
            ) : null}

            {!canManageJudgeAssignments ? (
              <p className="mb-4 rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                No tienes permisos para crear/eliminar asignaciones. Puedes revisar en modo lectura.
              </p>
            ) : null}

            {!isManagingEventReady ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                Preparando gestor de asignaciones...
              </p>
            ) : selectedCategoryTree.length === 0 ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                Este evento no tiene categorias/subcategorias vinculadas para asignar jueces.
              </p>
            ) : (
              <JudgeEventAssignmentBoard
                judges={eligibleJudges}
                assignedJudgeIds={assignedJudgeIds}
                selectionsByJudge={judgeSubcategoryDraft}
                categoryTree={selectedCategoryTree}
                pending={Boolean(pendingAssignmentAction)}
                canManage={canManageJudgeAssignments}
                onAssignJudge={assignJudgeToEventDraft}
                onUnassignJudge={unassignJudgeFromEventDraft}
                onToggleJudgeNode={toggleJudgeCategoryNode}
                getJudgeNodeSelectionState={getJudgeNodeSelectionState}
                validationIssues={judgeValidationIssues}
                leftTitle="Lista de jueces no asignados"
                rightTitle="Lista de jueces asignados"
              />
            )}
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-[#2D2D2D] bg-[#0F0F0F] px-4 py-3">
                <button
                  type="button"
                  disabled={isAssignmentPending || !canManageJudgeAssignments || !isManagingEventReady}
                  onClick={() => void handleSaveAssignments()}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isAssignmentPending ? 'Guardando asignaciones...' : 'Guardar asignaciones'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {eventModalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-7xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h4 className={`${headingClassName} text-[20px] font-semibold text-white`}>
                  {eventModalMode === 'create' ? 'Crear evento' : 'Editar evento'}
                </h4>
                <p className="mt-0.5 text-xs text-[#9C9C9C]">Paso {eventModalStep} de 3</p>
              </div>
              <button
                type="button"
                onClick={closeEventModal}
                disabled={isEventModalPending}
                className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
              >
                Cerrar
              </button>
            </div>

            {eventModalStep === 1 ? (
              <form onSubmit={(event) => void handleSubmitEventModal(event)} className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                  Club organizador
                  <select
                    value={eventForm.organizerClubId}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        organizerClubId: event.target.value,
                      }))
                    }
                    className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                  >
                    <option value="">Selecciona club</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name} - {club.place}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                  Nombre
                  <input
                    value={eventForm.name}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                  Lugar
                  <input
                    value={eventForm.place}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        place: event.target.value,
                      }))
                    }
                    className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                  Fecha inicio
                  <div className="relative">
                    <input
                      ref={startDateInputRef}
                      type="date"
                      value={eventForm.startDate}
                      onChange={(event) =>
                        setEventForm((prev) => ({
                          ...prev,
                          startDate: event.target.value,
                        }))
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 pr-10 text-sm text-white outline-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0"
                    />
                    <button
                      type="button"
                      onClick={() => openNativePicker(startDateInputRef.current)}
                      className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-white hover:bg-white/10"
                      aria-label="Abrir selector de fecha de inicio"
                    >
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  </div>
                </label>

                <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                  Hora inicio
                  <div className="relative">
                    <input
                      ref={startTimeInputRef}
                      type="time"
                      value={eventForm.startTime}
                      onChange={(event) =>
                        setEventForm((prev) => ({
                          ...prev,
                          startTime: event.target.value,
                        }))
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 pr-10 text-sm text-white outline-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0"
                    />
                    <button
                      type="button"
                      onClick={() => openNativePicker(startTimeInputRef.current)}
                      className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-white hover:bg-white/10"
                      aria-label="Abrir selector de hora de inicio"
                    >
                      <Clock3 className="h-4 w-4" />
                    </button>
                  </div>
                </label>

                <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                  Fecha fin
                  <div className="relative">
                    <input
                      ref={endDateInputRef}
                      type="date"
                      value={eventForm.endDate}
                      onChange={(event) =>
                        setEventForm((prev) => ({
                          ...prev,
                          endDate: event.target.value,
                        }))
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 pr-10 text-sm text-white outline-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0"
                    />
                    <button
                      type="button"
                      onClick={() => openNativePicker(endDateInputRef.current)}
                      className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-white hover:bg-white/10"
                      aria-label="Abrir selector de fecha de fin"
                    >
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  </div>
                </label>

                <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                  Hora fin
                  <div className="relative">
                    <input
                      ref={endTimeInputRef}
                      type="time"
                      value={eventForm.endTime}
                      onChange={(event) =>
                        setEventForm((prev) => ({
                          ...prev,
                          endTime: event.target.value,
                        }))
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 pr-10 text-sm text-white outline-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0"
                    />
                    <button
                      type="button"
                      onClick={() => openNativePicker(endTimeInputRef.current)}
                      className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-white hover:bg-white/10"
                      aria-label="Abrir selector de hora de fin"
                    >
                      <Clock3 className="h-4 w-4" />
                    </button>
                  </div>
                </label>

                <label className="flex flex-col gap-1 text-xs text-[#A8A8A8] md:col-span-2">
                  Estado
                  <select
                    value={eventForm.status}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        status: event.target.value as (typeof eventStatusOptions)[number],
                      }))
                    }
                    className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                  >
                    {eventStatusOptions.map((status) => (
                      <option key={`modal-${status}`} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="md:col-span-2">
                  <p className="text-xs text-[#A8A8A8]">Imagen del evento (opcional)</p>
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-[#2D2D2D] bg-[#101010] p-3">
                    <div className="h-16 w-24 overflow-hidden rounded-md border border-[#2D2D2D] bg-[#0B0B0B]">
                      {eventForm.imageUrl ? (
                        <ImageWithSkeleton
                          src={eventForm.imageUrl}
                          alt="Imagen del evento"
                          width={240}
                          height={160}
                          sizes="96px"
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-[#7F7F7F]">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => eventImageFileInputRef.current?.click()}
                        disabled={isEventImageUploading || isEventModalPending}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                      >
                        {isEventImageUploading ? 'Subiendo...' : 'Seleccionar imagen'}
                      </button>
                      {eventForm.imageUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setEventForm((prev) => ({
                              ...prev,
                              imageUrl: '',
                            }))
                          }
                          disabled={isEventImageUploading || isEventModalPending}
                          className="inline-flex h-9 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#B8B8B8]"
                        >
                          Quitar imagen
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <input
                    ref={eventImageFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => void handleEventImageFileChange(event)}
                    className="hidden"
                  />
                </div>

                <label className="flex flex-col gap-1 text-xs text-[#A8A8A8] md:col-span-2">
                  Descripcion
                  <textarea
                    value={eventForm.description}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    className="min-h-[96px] rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-sm text-white outline-none"
                  />
                </label>

                {eventModalError ? (
                  <p className="rounded-lg border border-[#7f1d1d] bg-[#7f1d1d]/20 px-3 py-2 text-xs text-[#fca5a5] md:col-span-2">
                    {eventModalError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isEventModalPending || (eventModalMode === 'create' ? !canCreateEvents : !canUpdateEvents)}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white md:col-span-2"
                >
                  {isEventModalPending ? 'Guardando...' : 'Siguiente'}
                </button>
              </form>
            ) : null}

            {eventModalStep === 2 ? (
              <div>
                <p className="mb-4 text-sm text-[#AAAAAA]">
                  Selecciona exactamente las categorias disponibles. Puedes marcar padres para seleccionar o desmarcar todo su descendiente.
                </p>
                <p className="mb-3 text-xs text-[#9C9C9C]">
                  Seleccionadas: {selectedLeafCount} de {totalLeafCount} categorias.
                </p>
                {eventModalCategoryTree.length === 0 ? (
                  <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                    No hay categorias creadas aun. Puedes vincularlas despues en la seccion Categorias.
                  </p>
                ) : (
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {eventModalCategoryTree.map((rootNode) => {
                      const renderNode = (
                        node: (typeof eventModalCategoryTree)[number],
                      ): ReactNode => {
                        const hasChildren = node.children.length > 0;
                        const selectionState = getCategoryNodeSelectionState(node.id);
                        const isExpanded = hasChildren && expandedCategoryNodeIds.has(node.id);

                        return (
                          <div
                            key={node.id}
                            className={`rounded-xl border px-3 py-2 ${
                              selectionState.checked
                                ? 'border-[#5B68F1] bg-[rgba(91,104,241,0.12)]'
                                : selectionState.indeterminate
                                  ? 'border-[#3f478f] bg-[rgba(63,71,143,0.15)]'
                                  : 'border-[#2D2D2D] bg-[#121212]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <TriStateCheckbox
                                checked={selectionState.checked}
                                indeterminate={selectionState.indeterminate}
                                onChange={() => toggleCategorySelection(node.id)}
                              />
                              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                                {node.name}
                              </span>
                              <span className="text-[11px] text-[#A8A8A8]">
                                {selectionState.selectedLeaves}/{selectionState.totalLeaves}
                              </span>
                              {hasChildren ? (
                                <button
                                  type="button"
                                  onClick={() => toggleCategoryNodeExpanded(node.id)}
                                  className="rounded-md border border-[#2D2D2D] px-2 py-1 text-[11px] text-white"
                                >
                                  {isExpanded ? 'Ocultar' : 'Ver'}
                                </button>
                              ) : null}
                            </div>
                            {hasChildren && isExpanded ? (
                              <div className="mt-2 space-y-2 border-l border-[#2D2D2D] pl-3">
                                {node.children.map((childNode) => renderNode(childNode))}
                              </div>
                            ) : null}
                          </div>
                        );
                      };

                      return renderNode(rootNode);
                    })}
                  </div>
                )}

                {eventModalError ? (
                  <p className="mt-3 rounded-lg border border-[#7f1d1d] bg-[#7f1d1d]/20 px-3 py-2 text-xs text-[#fca5a5]">
                    {eventModalError}
                  </p>
                ) : null}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={isEventModalPending}
                    onClick={() => setEventModalStep(1)}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-[#2D2D2D] text-sm font-semibold text-white"
                  >
                    Atras
                  </button>
                  <button
                    type="button"
                    disabled={isEventModalPending || (eventModalMode === 'create' ? !canCreateEvents : !canUpdateEvents)}
                    onClick={() => setEventModalStep(3)}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#5B68F1] text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            ) : null}

            {eventModalStep === 3 ? (
              <div>
                <div className="overflow-hidden rounded-xl border border-[#2D2D2D] bg-[#0D0D0F]">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#1E1E23] px-4 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(91,104,241,0.24)] text-[#99A4FF]">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-white">
                          Escalas permitidas por categoria
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[#8E8E95]">
                          {eventModalMode === 'create' ? 'Crear evento' : 'Editar evento'} - Selecciona una especialidad para configurar sus escalas
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-[#14532d] bg-[rgba(20,83,45,0.22)] px-3 py-1 text-xs font-semibold text-[#4ADE80]">
                      {step3ScaleProgress.configuredCount} / {step3ScaleProgress.totalCount} configuradas
                    </span>
                  </div>

                  <div className="grid gap-px bg-[#1E1E23] lg:grid-cols-4">
                    <section className="bg-[#0D0D0F]">
                      <div className="border-b border-[#1E1E23] px-3 py-2">
                        <label className="relative block">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64646D]" />
                          <input
                            value={eventModalScaleCategorySearch}
                            onChange={(event) => setEventModalScaleCategorySearch(event.target.value)}
                            placeholder="Buscar categoria..."
                            className="h-9 w-full rounded-md border border-[#24242A] bg-[#121216] pl-8 pr-3 text-xs text-white outline-none placeholder:text-[#5E5E66]"
                          />
                        </label>
                        <p className="mt-2 text-[10px] font-semibold tracking-[1.6px] text-[#5E5E66]">CATEGORIAS</p>
                      </div>
                      <div className="max-h-[280px] overflow-y-auto px-2 py-2 lg:max-h-[420px]">
                        {filteredStep3ScaleCategories.length === 0 ? (
                          <p className="rounded-md border border-[#24242A] bg-[#111116] px-3 py-2 text-xs text-[#6F6F76]">
                            Sin categorias.
                          </p>
                        ) : (
                          filteredStep3ScaleCategories.map((category) => {
                            const selected = eventModalSelectedScaleCategoryId === category.id;
                            return (
                              <button
                                key={`scale-category-${category.id}`}
                                type="button"
                                onClick={() => selectStep3ScaleCategory(category.id)}
                                className={`mb-1 flex w-full items-center justify-between rounded-md border px-3 py-2 text-left ${
                                  selected
                                    ? 'border-[#5B68F1] bg-[rgba(91,104,241,0.16)]'
                                    : 'border-transparent bg-[#111116] hover:border-[#2B2B32]'
                                }`}
                              >
                                <div>
                                  <p className="text-sm font-semibold text-white">{category.name}</p>
                                  <p className="text-[11px] text-[#7C7C86]">
                                    {category.subcategoriesCount} subcategorias · {category.specialtiesCount} especialidades
                                  </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-[#6D72B8]" />
                              </button>
                            );
                          })
                        )}
                      </div>
                    </section>

                    <section className="bg-[#0D0D0F]">
                      <div className="border-b border-[#1E1E23] px-3 py-2">
                        <label className="relative block">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64646D]" />
                          <input
                            value={eventModalScaleSubcategorySearch}
                            onChange={(event) => setEventModalScaleSubcategorySearch(event.target.value)}
                            placeholder="Buscar subcategoria..."
                            className="h-9 w-full rounded-md border border-[#24242A] bg-[#121216] pl-8 pr-3 text-xs text-white outline-none placeholder:text-[#5E5E66]"
                          />
                        </label>
                        <p className="mt-2 text-[10px] font-semibold tracking-[1.6px] text-[#5E5E66]">SUBCATEGORIAS</p>
                      </div>
                      <div className="max-h-[280px] overflow-y-auto px-2 py-2 lg:max-h-[420px]">
                        {filteredStep3ScaleSubcategories.length === 0 ? (
                          <p className="rounded-md border border-[#24242A] bg-[#111116] px-3 py-2 text-xs text-[#6F6F76]">
                            Sin subcategorias.
                          </p>
                        ) : (
                          filteredStep3ScaleSubcategories.map((subcategory) => {
                            const selected = eventModalSelectedScaleSubcategoryId === subcategory.id;
                            return (
                              <button
                                key={`scale-subcategory-${subcategory.categoryId}-${subcategory.id}`}
                                type="button"
                                onClick={() => selectStep3ScaleSubcategory(subcategory.id)}
                                className={`mb-1 flex w-full items-center justify-between rounded-md border px-3 py-2 text-left ${
                                  selected
                                    ? 'border-[#5B68F1] bg-[rgba(91,104,241,0.16)]'
                                    : 'border-transparent bg-[#111116] hover:border-[#2B2B32]'
                                }`}
                              >
                                <div>
                                  <p className="text-sm font-semibold text-white">{subcategory.name}</p>
                                  <p className="text-[11px] text-[#7C7C86]">
                                    {subcategory.specialtiesCount} especialidades
                                  </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-[#6D72B8]" />
                              </button>
                            );
                          })
                        )}
                      </div>
                    </section>

                    <section className="bg-[#0D0D0F]">
                      <div className="border-b border-[#1E1E23] px-3 py-2">
                        <label className="relative block">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64646D]" />
                          <input
                            value={eventModalScaleSpecialtySearch}
                            onChange={(event) => setEventModalScaleSpecialtySearch(event.target.value)}
                            placeholder="Buscar especialidad..."
                            className="h-9 w-full rounded-md border border-[#24242A] bg-[#121216] pl-8 pr-3 text-xs text-white outline-none placeholder:text-[#5E5E66]"
                          />
                        </label>
                        <p className="mt-2 text-[10px] font-semibold tracking-[1.6px] text-[#5E5E66]">ESPECIALIDADES</p>
                      </div>
                      <div className="max-h-[280px] overflow-y-auto px-2 py-2 lg:max-h-[420px]">
                        {filteredStep3ScaleSpecialties.length === 0 ? (
                          <p className="rounded-md border border-[#24242A] bg-[#111116] px-3 py-2 text-xs text-[#6F6F76]">
                            Sin especialidades.
                          </p>
                        ) : (
                          filteredStep3ScaleSpecialties.map((specialty) => {
                            const selected = eventModalSelectedScaleLeafId === specialty.id;
                            return (
                              <button
                                key={`scale-specialty-${specialty.id}`}
                                type="button"
                                onClick={() => selectStep3ScaleSpecialty(specialty.id)}
                                className={`mb-1 w-full rounded-md border px-3 py-2 text-left ${
                                  selected
                                    ? 'border-[#5B68F1] bg-[rgba(91,104,241,0.16)]'
                                    : 'border-transparent bg-[#111116] hover:border-[#2B2B32]'
                                }`}
                              >
                                <p className="text-sm font-semibold text-white">{specialty.name}</p>
                                <p className="mt-0.5 text-[11px] text-[#41D87D]">
                                  {specialty.activeScalesCount} escalas activas
                                </p>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </section>

                    <section className="bg-[#0D0D0F]">
                      <div className="border-b border-[#1E1E23] px-3 py-2">
                        <p className="text-[10px] font-semibold tracking-[1.6px] text-[#5E5E66]">ESCALAS PERMITIDAS</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={markAllStep3ScaleDraft}
                              disabled={!eventModalSelectedScaleLeafId || availableScales.length === 0}
                              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D5D5DB] disabled:opacity-40"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Marcar todas
                            </button>
                            <button
                              type="button"
                              onClick={clearStep3ScaleDraft}
                              disabled={!eventModalSelectedScaleLeafId}
                              className="inline-flex h-8 items-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#B6B6BD] disabled:opacity-40"
                            >
                              Limpiar
                            </button>
                          </div>
                          <span className="rounded-full bg-[#17171C] px-2.5 py-1 text-[10px] font-semibold text-[#9A9AA4]">
                            {eventModalScaleDraftIds.length} / {availableScales.length} activas
                          </span>
                        </div>
                      </div>

                      <div className="max-h-[280px] overflow-y-auto px-2 py-2 lg:max-h-[420px]">
                        {eventModalScaleConfigLoading ? (
                          <p className="rounded-md border border-[#24242A] bg-[#111116] px-3 py-2 text-xs text-[#6F6F76]">
                            Cargando configuracion de escalas...
                          </p>
                        ) : null}

                        {!eventModalScaleConfigLoading && !activeStep3ScaleSpecialty ? (
                          <p className="rounded-md border border-[#24242A] bg-[#111116] px-3 py-2 text-xs text-[#6F6F76]">
                            Selecciona una especialidad para configurar sus escalas.
                          </p>
                        ) : null}

                        {!eventModalScaleConfigLoading && activeStep3ScaleSpecialty
                          ? availableScales.map((scale) => {
                              const checked = eventModalScaleDraftIds.includes(scale.id);
                              return (
                                <button
                                  key={`step3-scale-${activeStep3ScaleSpecialty.id}-${scale.id}`}
                                  type="button"
                                  onClick={() => toggleStep3ScaleDraftId(scale.id)}
                                  className={`mb-1 flex w-full items-center justify-between rounded-md border px-3 py-2 text-left ${
                                    checked
                                      ? 'border-[#166534] bg-[rgba(22,101,52,0.25)]'
                                      : 'border-[#2B2B31] bg-[#141419]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${
                                        checked
                                          ? 'border-[#22C55E] bg-[#22C55E] text-[#04140A]'
                                          : 'border-[#4A4A52] bg-transparent'
                                      }`}
                                    >
                                      {checked ? <Check className="h-3 w-3" /> : null}
                                    </span>
                                    <div>
                                      <p className={`text-sm font-semibold ${checked ? 'text-[#4ADE80]' : 'text-[#E5E5E8]'}`}>
                                        {scale.value}
                                      </p>
                                      <p className="text-[11px] text-[#6F6F76]">Escala disponible del catalogo</p>
                                    </div>
                                  </div>
                                  <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                                      checked
                                        ? 'bg-[rgba(34,197,94,0.18)] text-[#4ADE80]'
                                        : 'bg-[#1E1E23] text-[#7D7D86]'
                                    }`}
                                  >
                                    {checked ? 'ACTIVA' : 'INACTIVA'}
                                  </span>
                                </button>
                              );
                            })
                          : null}
                      </div>

                      <div className="border-t border-[#1E1E23] px-3 py-2">
                        <p className="text-center text-[11px] text-[#6F6F76]">
                          Los cambios se guardan automaticamente al marcar o desmarcar escalas.
                        </p>
                      </div>
                    </section>
                  </div>
                </div>

                {eventModalError ? (
                  <p className="mt-3 rounded-lg border border-[#7f1d1d] bg-[#7f1d1d]/20 px-3 py-2 text-xs text-[#fca5a5]">
                    {eventModalError}
                  </p>
                ) : null}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={isEventModalPending}
                    onClick={() => setEventModalStep(2)}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-[#2D2D2D] text-sm font-semibold text-white"
                  >
                    Atras
                  </button>
                  <button
                    type="button"
                    disabled={isEventModalPending || (eventModalMode === 'create' ? !canCreateEvents : !canUpdateEvents)}
                    onClick={() => void handleFinalizeWithGuard()}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#5B68F1] text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {isEventModalPending
                      ? eventModalMode === 'create'
                        ? 'Creando...'
                        : 'Guardando...'
                      : eventModalMode === 'create'
                        ? 'Crear evento'
                        : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {eventDeleteImpactModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#4B1F2A] bg-[#161616] p-5 sm:p-6">
            <div className="mb-3">
              <p className="text-xs font-semibold tracking-[1.4px] text-[#FCA5A5]">CONFIRMACION DE BORRADO</p>
              <h4 className={`${headingClassName} mt-1 text-[20px] font-semibold text-white`}>Eliminar evento</h4>
              <p className="mt-1 text-sm text-[#BFBFBF]">{eventDeleteImpactModal.eventName}</p>
            </div>

            {eventDeleteImpactModal.loading ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                Calculando impacto...
              </p>
            ) : null}

            {eventDeleteImpactModal.error ? (
              <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
                {eventDeleteImpactModal.error}
              </p>
            ) : null}

            {eventDeleteImpactModal.impact ? (
              <div className="space-y-3">
                <p className="text-sm text-[#D5D5D5]">
                  Si continuas, tambien se eliminaran los siguientes datos relacionados:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Vinculos evento-categoria</p>
                    <p className="text-lg font-semibold text-white">{eventDeleteImpactModal.impact.eventCategories}</p>
                  </div>
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Asignaciones de jueces</p>
                    <p className="text-lg font-semibold text-white">{eventDeleteImpactModal.impact.judgeAssignments}</p>
                  </div>
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Inscripciones</p>
                    <p className="text-lg font-semibold text-white">{eventDeleteImpactModal.impact.registrations}</p>
                  </div>
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Maquetas registradas</p>
                    <p className="text-lg font-semibold text-white">{eventDeleteImpactModal.impact.models}</p>
                  </div>
                </div>
                {eventDeleteImpactModal.impact.registrations > 0 || eventDeleteImpactModal.impact.models > 0 ? (
                  <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
                    Advertencia: esta accion puede eliminar inscripciones y maquetas ya cargadas.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={closeEventDeleteImpactModal}
                disabled={pendingAction === `event:delete:${eventDeleteImpactModal.eventId}`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteEvent()}
                disabled={
                  !canDeleteEvents ||
                  eventDeleteImpactModal.loading ||
                  !!eventDeleteImpactModal.error ||
                  pendingAction === `event:delete:${eventDeleteImpactModal.eventId}`
                }
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7f1d1d] px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pendingAction === `event:delete:${eventDeleteImpactModal.eventId}`
                  ? 'Eliminando...'
                  : 'Eliminar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

