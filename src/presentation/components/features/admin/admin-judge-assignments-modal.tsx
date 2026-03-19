import type { EventCategoryOption } from '@/domain/admin/admin.types';

type JudgeAssignmentModalState = {
  userId: string;
  userName: string;
};

type ActiveAssignmentItem = {
  id: string;
  eventName: string;
  scopeName: string;
};

type AdminJudgeAssignmentsModalProps = {
  headingClassName: string;
  modal: JudgeAssignmentModalState | null;
  selectedEventCategoryId: string;
  onSelectEventCategoryId: (value: string) => void;
  availableEventCategories: EventCategoryOption[];
  activeAssignments: ActiveAssignmentItem[];
  pendingAction: string | null;
  feedback: {
    type: 'success' | 'error';
    message: string;
  } | null;
  onClose: () => void;
  onAssign: () => Promise<void>;
  onRemove: (assignmentId: string) => Promise<void>;
  canManageJudgeAssignments: boolean;
};

export function AdminJudgeAssignmentsModal({
  headingClassName,
  modal,
  selectedEventCategoryId,
  onSelectEventCategoryId,
  availableEventCategories,
  activeAssignments,
  pendingAction,
  feedback,
  onClose,
  onAssign,
  onRemove,
  canManageJudgeAssignments,
}: AdminJudgeAssignmentsModalProps) {
  if (!modal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h4 className={`${headingClassName} text-[20px] font-semibold text-white`}>
              Alcances de {modal.userName}
            </h4>
            <p className="mt-0.5 text-xs text-[#9C9C9C]">Asignacion de evento/categoria por juez</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
          >
            Cerrar
          </button>
        </div>

        {feedback ? (
          <p
            className={`mb-4 rounded-lg border px-3 py-2 text-xs ${
              feedback.type === 'success'
                ? 'border-[#14532d] bg-[#052e16] text-[#86efac]'
                : 'border-[#7f1d1d] bg-[#7f1d1d]/20 text-[#fca5a5]'
            }`}
          >
            {feedback.message}
          </p>
        ) : null}

        <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <select
            value={selectedEventCategoryId}
            onChange={(event) => onSelectEventCategoryId(event.target.value)}
            className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
          >
            <option value="">Selecciona un alcance disponible</option>
            {availableEventCategories.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedEventCategoryId || !!pendingAction || !canManageJudgeAssignments}
            onClick={() => void onAssign()}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#14532d] px-4 text-xs font-semibold text-white disabled:opacity-50"
          >
            {pendingAction?.startsWith('judge-assignment:create:') ? 'Asignando...' : 'Asignar alcance'}
          </button>
        </div>

        <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
          {activeAssignments.map((assignment) => (
            <article key={assignment.id} className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{assignment.eventName}</p>
                  <p className="text-xs text-[#9C9C9C]">{assignment.scopeName}</p>
                </div>
                <button
                  type="button"
                  disabled={
                    pendingAction === `judge-assignment:remove:${assignment.id}` ||
                    !canManageJudgeAssignments
                  }
                  onClick={() => void onRemove(assignment.id)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4B1F2A] px-3 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {pendingAction === `judge-assignment:remove:${assignment.id}`
                    ? 'Removiendo...'
                    : 'Remover'}
                </button>
              </div>
            </article>
          ))}
          {activeAssignments.length === 0 ? (
            <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
              Este juez no tiene alcances asignados.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
