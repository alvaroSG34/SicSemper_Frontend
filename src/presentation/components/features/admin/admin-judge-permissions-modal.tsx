import type { JudgePermissionEntry } from '@/domain/admin/admin.types';

type JudgePermissionModalState = {
  userId: string;
  userName: string;
};

type AdminJudgePermissionsModalProps = {
  headingClassName: string;
  modal: JudgePermissionModalState | null;
  search: string;
  onSearchChange: (value: string) => void;
  entries: JudgePermissionEntry[];
  loadingMap: Record<string, boolean>;
  errorMap: Record<string, string | null>;
  onClose: () => void;
  onToggle: (entry: JudgePermissionEntry) => Promise<void>;
  canManageJudgePermissions: boolean;
};

export function AdminJudgePermissionsModal({
  headingClassName,
  modal,
  search,
  onSearchChange,
  entries,
  loadingMap,
  errorMap,
  onClose,
  onToggle,
  canManageJudgePermissions,
}: AdminJudgePermissionsModalProps) {
  if (!modal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h4 className={`${headingClassName} text-[20px] font-semibold text-white`}>
              Permisos de juez: {modal.userName}
            </h4>
            <p className="mt-0.5 text-xs text-[#9C9C9C]">Permisos asignables al rol JUEZ</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
          >
            Cerrar
          </button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por codigo"
            className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
          />
          <p className="flex h-10 items-center rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 text-xs text-[#9C9C9C]">
            {entries.length} permiso(s) visible(s)
          </p>
        </div>

        {errorMap[modal.userId] ? (
          <p className="mb-3 rounded-lg border border-[#7f1d1d] bg-[#7f1d1d]/20 px-3 py-2 text-xs text-[#fca5a5]">
            {errorMap[modal.userId]}
          </p>
        ) : null}

        {loadingMap[modal.userId] ? (
          <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
            Cargando permisos...
          </p>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {entries.map((entry) => {
              const actionKey = `perm:toggle:${modal.userId}:${entry.code}`;
              const isToggling = Boolean(loadingMap[actionKey]);
              return (
                <article key={entry.code} className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[1.2px] text-[#9C9C9C]">{entry.code}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                        {entry.grantedByRole ? (
                          <span className="rounded-full border border-[#2A2F3A] bg-[#1A1E2B] px-2 py-1 text-[#C9D3FF]">
                            Heredado por rol
                          </span>
                        ) : null}
                        {entry.grantedDirectly ? (
                          <span className="rounded-full border border-[#14532d] bg-[#052e16] px-2 py-1 text-[#86efac]">
                            Asignado directo
                          </span>
                        ) : null}
                        {!entry.granted ? (
                          <span className="rounded-full border border-[#2D2D2D] bg-[#1A1A1A] px-2 py-1 text-[#9C9C9C]">
                            No otorgado
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isToggling || !canManageJudgePermissions}
                      onClick={() => void onToggle(entry)}
                      className={`inline-flex h-9 min-w-[140px] items-center justify-center rounded-lg px-3 text-xs font-semibold ${
                        entry.grantedDirectly
                          ? 'bg-[#4B1F2A] text-white'
                          : 'bg-[#14532d] text-white'
                      }`}
                    >
                      {isToggling
                        ? 'Procesando...'
                        : entry.grantedDirectly
                          ? 'Revocar directo'
                          : 'Otorgar directo'}
                    </button>
                  </div>
                </article>
              );
            })}
            {entries.length === 0 ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                No se encontraron permisos con el filtro actual.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
