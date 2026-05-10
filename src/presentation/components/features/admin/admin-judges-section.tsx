import { ImageWithSkeleton } from '@/presentation/components/ui';
import type { JudgeAssignmentScope } from '@/domain/admin/admin.types';
import type { User } from '@/domain/user/user.types';
import { AdminJudgePermissionsModal } from './admin-judge-permissions-modal';
import { useAdminJudgePermissions } from './use-admin-judge-permissions';
import { useAdminJudges } from './use-admin-judges';

type AdminJudgesSectionProps = {
  users: User[];
  assignments: JudgeAssignmentScope[];
  headingClassName: string;
  canManageJudgeRole: boolean;
  canCreateJudge: boolean;
  canReadJudgePermissions: boolean;
  canManageJudgePermissions: boolean;
};

const getJudgeInitial = (user: User) => {
  const source = user.name?.trim() || user.email?.trim() || 'J';
  return source.charAt(0).toUpperCase();
};

const JudgeAvatar = ({ user }: { user: User }) => {
  const hasPhoto = Boolean(user.photoUrl?.trim());

  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#2D2D2D] bg-[#151515]">
      {hasPhoto ? (
        <ImageWithSkeleton
          src={user.photoUrl as string}
          alt={`Foto de perfil de ${user.name}`}
          width={48}
          height={48}
          sizes="48px"
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#9C9C9C]">
          {getJudgeInitial(user)}
        </div>
      )}
    </div>
  );
};

export function AdminJudgesSection({
  users,
  assignments,
  headingClassName,
  canManageJudgeRole,
  canCreateJudge,
  canReadJudgePermissions,
  canManageJudgePermissions,
}: AdminJudgesSectionProps) {
  const {
    actionFeedback,
    judgeUsers,
    judgeSearch,
    setJudgeSearch,
    filteredJudgeUsers,
    judgeAssignmentCount,
    addJudgeModalOpen,
    openAddJudgeModal,
    closeAddJudgeModal,
    addJudgeSearch,
    setAddJudgeSearch,
    addJudgeSelectedUserId,
    setAddJudgeSelectedUserId,
    filteredNonJudgeUsers,
    handleAddJudge,
    createJudgeModalOpen,
    openCreateJudgeModal,
    closeCreateJudgeModal,
    createJudgeForm,
    setCreateJudgeForm,
    handleCreateJudge,
    handleToggleJudgeRole,
    pendingAction,
  } = useAdminJudges({ users, assignments });
  const {
    judgePermissionSearch,
    setJudgePermissionSearch,
    judgePermissionModal,
    filteredJudgePermissionEntries,
    judgePermissionsLoading,
    judgePermissionsError,
    openJudgePermissionsModal,
    closeJudgePermissionsModal,
    handleToggleJudgePermission,
  } = useAdminJudgePermissions();

  return (
    <section id="jueces" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={`${headingClassName} text-[20px] font-semibold text-white`}>Jueces</h3>
          <span className="text-xs text-[#9C9C9C]">{judgeUsers.length} juez/jueces registrado(s)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageJudgeRole ? (
            <button
              type="button"
              onClick={openAddJudgeModal}
              className="inline-flex h-8 items-center justify-center rounded-md border border-[#F59E0B]/60 bg-[#2C2110] px-2.5 text-[11px] font-semibold text-white"
            >
              Promover
            </button>
          ) : null}
          {canCreateJudge ? (
            <button
              type="button"
              onClick={openCreateJudgeModal}
              className="inline-flex h-8 items-center justify-center rounded-md border border-[#10B981]/60 bg-[#10261E] px-2.5 text-[11px] font-semibold text-white"
            >
              Crear juez
            </button>
          ) : null}
        </div>
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

      <div className="mb-4">
        <input
          value={judgeSearch}
          onChange={(event) => setJudgeSearch(event.target.value)}
          placeholder="Buscar juez por nombre o correo"
          className="h-10 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
        />
      </div>

      <div className="space-y-3">
        {filteredJudgeUsers.map((judge) => {
          const assignmentsCount = judgeAssignmentCount.get(judge.id) ?? 0;
          const isRemovingJudge = pendingAction === `user:judge:${judge.id}`;
          return (
            <article
              key={judge.id}
              className="flex flex-col gap-3 rounded-xl border border-[#2D2D2D] bg-[#121212] p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <JudgeAvatar user={judge} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{judge.name}</p>
                  <p className="truncate text-xs text-[#8D8D8D]">{judge.email}</p>
                  <p className="mt-1 text-[11px] text-[#9C9C9C]">
                    {assignmentsCount} alcance(s) asignado(s)
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
                {canManageJudgeRole ? (
                  <button
                    type="button"
                    disabled={isRemovingJudge}
                    onClick={() => void handleToggleJudgeRole(judge.id, true)}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4B1F2A] px-3 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {isRemovingJudge ? 'Procesando...' : 'Quitar rol JUEZ'}
                  </button>
                ) : null}
                {canReadJudgePermissions ? (
                  <button
                    type="button"
                    onClick={() => void openJudgePermissionsModal(judge)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                  >
                    Permisos
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
        {filteredJudgeUsers.length === 0 ? (
          <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
            No hay jueces con ese filtro.
          </p>
        ) : null}
      </div>

      {addJudgeModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2D2D2D] bg-[#111111] p-6">
            <h3 className={`${headingClassName} mb-4 text-[18px] font-semibold text-white`}>Promover a juez</h3>
            <input
              value={addJudgeSearch}
              onChange={(event) => setAddJudgeSearch(event.target.value)}
              placeholder="Buscar usuario por nombre o correo"
              className="mb-3 h-10 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
            />
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {filteredNonJudgeUsers.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => setAddJudgeSelectedUserId(candidate.id)}
                  className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                    addJudgeSelectedUserId === candidate.id
                      ? 'border border-[#5B68F1] bg-[rgba(91,104,241,0.15)]'
                      : 'border border-[#2D2D2D] bg-[#1A1A1A]'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <JudgeAvatar user={candidate} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{candidate.name}</p>
                      <p className="truncate text-xs text-[#8D8D8D]">{candidate.email}</p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredNonJudgeUsers.length === 0 ? (
                <p className="px-4 py-3 text-sm text-[#9C9C9C]">
                  {addJudgeSearch
                    ? 'No se encontraron usuarios.'
                    : 'Todos los usuarios ya son jueces.'}
                </p>
              ) : null}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={!addJudgeSelectedUserId || !!pendingAction}
                onClick={() => void handleAddJudge()}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#5B68F1] text-xs font-semibold text-white disabled:opacity-50"
              >
                {pendingAction?.startsWith('judge:promote:') ? 'Guardando...' : 'Confirmar'}
              </button>
              <button
                type="button"
                onClick={closeAddJudgeModal}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-[#2D2D2D] text-xs font-semibold text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {createJudgeModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2D2D2D] bg-[#111111] p-6">
            <h3 className={`${headingClassName} mb-4 text-[18px] font-semibold text-white`}>Crear juez</h3>
            <div className="grid gap-2">
              <input
                value={createJudgeForm.name}
                onChange={(event) =>
                  setCreateJudgeForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Nombre completo"
                className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
              />
              <input
                value={createJudgeForm.email}
                onChange={(event) =>
                  setCreateJudgeForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="Correo"
                className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
              />
              <input
                type="password"
                value={createJudgeForm.password}
                onChange={(event) =>
                  setCreateJudgeForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Contraseña (min. 8)"
                className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={pendingAction?.startsWith('judge:create:') === true}
                onClick={() => void handleCreateJudge()}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#10B981] text-xs font-semibold text-white disabled:opacity-50"
              >
                {pendingAction?.startsWith('judge:create:') ? 'Creando...' : 'Crear juez'}
              </button>
              <button
                type="button"
                onClick={closeCreateJudgeModal}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-[#2D2D2D] text-xs font-semibold text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AdminJudgePermissionsModal
        headingClassName={headingClassName}
        modal={judgePermissionModal}
        search={judgePermissionSearch}
        onSearchChange={setJudgePermissionSearch}
        entries={filteredJudgePermissionEntries}
        loadingMap={judgePermissionsLoading}
        errorMap={judgePermissionsError}
        onClose={closeJudgePermissionsModal}
        onToggle={handleToggleJudgePermission}
        canManageJudgePermissions={canManageJudgePermissions}
      />
    </section>
  );
}


