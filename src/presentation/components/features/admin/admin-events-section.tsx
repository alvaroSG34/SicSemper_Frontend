<<<<<<< Updated upstream
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
=======
import { ImageWithSkeleton } from '@/presentation/components/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Clock3 } from 'lucide-react';
>>>>>>> Stashed changes
import type {
  AdminClub,
  CatalogCategory,
  CatalogEvent,
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

export function AdminEventsSection({
  events,
  clubs,
  categories,
  subcategories,
  eventCategories,
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
    toggleCategorySelection,
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
    categoryItems,
    subcategoriesByCategoryId,
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
    assignments,
    canReadJudgeAssignments,
  });

  const {
    selectedEventId,
    setSelectedEventId,
    eligibleJudges,
    selectedCategoryNodes,
    assignedJudgeIds,
    judgeSubcategoryDraft,
    setJudgeSubcategoryDraft,
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
            ) : selectedCategoryNodes.length === 0 ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                Este evento no tiene categorias/subcategorias vinculadas para asignar jueces.
              </p>
            ) : (
              <JudgeEventAssignmentBoard
                judges={eligibleJudges}
                assignedJudgeIds={assignedJudgeIds}
                selectionsByJudge={judgeSubcategoryDraft}
                categories={selectedCategoryNodes}
                pending={Boolean(pendingAssignmentAction)}
                canManage={canManageJudgeAssignments}
                onAssignJudge={assignJudgeToEventDraft}
                onUnassignJudge={unassignJudgeFromEventDraft}
                onSetJudgeSelections={setJudgeSubcategoryDraft}
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
          <div className="w-full max-w-2xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h4 className={`${headingClassName} text-[20px] font-semibold text-white`}>
                  {eventModalMode === 'create' ? 'Crear evento' : 'Editar evento'}
                </h4>
                <p className="mt-0.5 text-xs text-[#9C9C9C]">Paso {eventModalStep} de 2</p>
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
                  Selecciona las categorias disponibles en este evento. Las subcategorias se incluyen automaticamente.
                </p>
                {categoryItems.length === 0 ? (
                  <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                    No hay categorias creadas aun. Puedes vincularlas despues en la seccion Categorias.
                  </p>
                ) : (
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {categoryItems.map((category) => {
                      const isSelected = eventModalSelectedCategoryIds.has(category.id);
                      const subs = subcategoriesByCategoryId.get(category.id) ?? [];
                      return (
                        <label
                          key={category.id}
                          className={`block cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                            isSelected
                              ? 'border-[#5B68F1] bg-[rgba(91,104,241,0.12)]'
                              : 'border-[#2D2D2D] bg-[#121212]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCategorySelection(category.id)}
                              className="h-4 w-4 accent-[#5B68F1]"
                            />
                            <span className="text-sm font-semibold text-white">{category.name}</span>
                            {subs.length > 0 ? (
                              <span className="text-xs text-[#9C9C9C]">{subs.length} subcategoria(s)</span>
                            ) : null}
                          </div>
                          {isSelected && subs.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5 pl-7">
                              {subs.map((subcategory) => (
                                <span
                                  key={subcategory.id}
                                  className="rounded-full border border-[#5B68F1]/40 bg-[rgba(91,104,241,0.15)] px-2 py-0.5 text-[11px] text-[#A8AFFF]"
                                >
                                  {subcategory.name}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </label>
                      );
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

