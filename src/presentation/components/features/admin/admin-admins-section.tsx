import type { User } from '@/domain/user/user.types';
import { useAdminAdmins } from './use-admin-admins';

type AdminAdminsSectionProps = {
  users: User[];
  headingClassName: string;
  loading: boolean;
  activePermissionAdminId: string | null;
  openAdminPermissionsManager: (targetUser: User) => void;
  canCreateAdmins: boolean;
  canUpdateAdmins: boolean;
  canManageAdminPermissions: boolean;
};

export function AdminAdminsSection({
  users,
  headingClassName,
  loading,
  activePermissionAdminId,
  openAdminPermissionsManager,
  canCreateAdmins,
  canUpdateAdmins,
  canManageAdminPermissions,
}: AdminAdminsSectionProps) {
  const {
    adminSearch,
    setAdminSearch,
    filteredAdminUsers,
    promoteAdminSearch,
    setPromoteAdminSearch,
    promoteAdminSelectedUserId,
    setPromoteAdminSelectedUserId,
    filteredPromotableAdminUsers,
    createAdminForm,
    setCreateAdminForm,
    adminFormModalMode,
    setAdminFormModalMode,
    closeAdminFormModal,
    handlePromoteAdmin,
    handleCreateAdmin,
    handleDemoteAdmin,
    pendingAction,
    actionFeedback,
    adminUsers,
  } = useAdminAdmins({ users });

  return (
    <>
      <section id="admins" className="space-y-5">
        <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className={`${headingClassName} text-[20px] font-semibold text-white`}>Admins activos</h3>
              <p className="text-xs text-[#9C9C9C]">{adminUsers.length} usuario(s) con rol ADMIN</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canUpdateAdmins ? (
                <button
                  type="button"
                  onClick={() => setAdminFormModalMode('promote')}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-[#F59E0B]/60 bg-[#2C2110] px-2.5 text-[11px] font-semibold text-white"
                >
                  Promover
                </button>
              ) : null}
              {canCreateAdmins ? (
                <button
                  type="button"
                  onClick={() => setAdminFormModalMode('create')}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-[#10B981]/60 bg-[#10261E] px-2.5 text-[11px] font-semibold text-white"
                >
                  Crear admin
                </button>
              ) : null}
            </div>
          </div>

          {actionFeedback ? (
            <p
              className={`mb-3 rounded-lg border px-3 py-2 text-xs ${
                actionFeedback.type === 'success'
                  ? 'border-[#14532d] bg-[#052e16] text-[#86efac]'
                  : 'border-[#7f1d1d] bg-[#7f1d1d]/20 text-[#fca5a5]'
              }`}
            >
              {actionFeedback.message}
            </p>
          ) : null}

          <input
            value={adminSearch}
            onChange={(event) => setAdminSearch(event.target.value)}
            placeholder="Buscar admin por nombre o correo"
            className="mb-3 h-10 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
          />
          <div className="space-y-2">
            {filteredAdminUsers.map((candidate) => {
              const isDemoting = pendingAction === `admin:demote:${candidate.id}`;
              const isManagingPermissions = activePermissionAdminId === candidate.id;
              return (
                <article
                  key={candidate.id}
                  className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{candidate.name}</p>
                      <p className="text-xs text-[#8D8D8D]">{candidate.email}</p>
                    </div>
                    <div className="flex gap-2">
                      {canManageAdminPermissions ? (
                        <button
                          type="button"
                          disabled={loading || isDemoting}
                          onClick={() => openAdminPermissionsManager(candidate)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                        >
                          {isManagingPermissions ? 'Permisos activos' : 'Gestionar permisos'}
                        </button>
                      ) : null}
                      {canUpdateAdmins ? (
                        <button
                          type="button"
                          disabled={loading || isDemoting}
                          onClick={() => void handleDemoteAdmin(candidate.id, candidate.name)}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4B1F2A] px-3 text-xs font-semibold text-white"
                        >
                          {isDemoting ? 'Procesando...' : 'Demover'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
            {filteredAdminUsers.length === 0 ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                {adminSearch ? 'No se encontraron admins con ese filtro.' : 'No hay admins registrados.'}
              </p>
            ) : null}
          </div>
        </article>
      </section>

      {adminFormModalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h4 className={`${headingClassName} text-[20px] font-semibold text-white`}>
                  {adminFormModalMode === 'promote' ? 'Promover a ADMIN' : 'Crear admin directo'}
                </h4>
                <p className="mt-0.5 text-xs text-[#9C9C9C]">
                  {adminFormModalMode === 'promote'
                    ? 'Selecciona un usuario existente para asignarle el rol ADMIN.'
                    : 'Crea un nuevo usuario y asignale rol ADMIN.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAdminFormModal}
                disabled={
                  (adminFormModalMode === 'promote' && pendingAction?.startsWith('admin:promote:')) ||
                  (adminFormModalMode === 'create' && pendingAction?.startsWith('admin:create:'))
                }
                className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1] disabled:opacity-50"
              >
                Cerrar
              </button>
            </div>

            {adminFormModalMode === 'promote' ? (
              <div>
                <input
                  value={promoteAdminSearch}
                  onChange={(event) => setPromoteAdminSearch(event.target.value)}
                  placeholder="Filtrar usuarios por nombre o correo"
                  className="mb-2 h-9 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-xs text-white outline-none"
                />
                <select
                  value={promoteAdminSelectedUserId}
                  onChange={(event) => setPromoteAdminSelectedUserId(event.target.value)}
                  className="h-9 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-xs text-white outline-none"
                >
                  <option value="">Selecciona un usuario</option>
                  {filteredPromotableAdminUsers.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} ({candidate.email})
                    </option>
                  ))}
                </select>
                {filteredPromotableAdminUsers.length === 0 ? (
                  <p className="mt-2 text-xs text-[#9C9C9C]">No hay usuarios elegibles con ese filtro.</p>
                ) : null}
                <button
                  type="button"
                  disabled={!promoteAdminSelectedUserId || !!pendingAction}
                  onClick={() => void handlePromoteAdmin()}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#F59E0B] text-xs font-semibold text-[#111111] disabled:opacity-50"
                >
                  {pendingAction?.startsWith('admin:promote:') ? 'Procesando...' : 'Promover a ADMIN'}
                </button>
              </div>
            ) : (
              <div>
                <div className="space-y-2">
                  <input
                    value={createAdminForm.name}
                    onChange={(event) =>
                      setCreateAdminForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Nombre completo"
                    className="h-9 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-xs text-white outline-none"
                  />
                  <input
                    value={createAdminForm.email}
                    onChange={(event) =>
                      setCreateAdminForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="Correo electronico"
                    className="h-9 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-xs text-white outline-none"
                  />
                  <input
                    type="password"
                    value={createAdminForm.password}
                    onChange={(event) =>
                      setCreateAdminForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    placeholder="Contraseña (minimo 8 caracteres)"
                    className="h-9 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-xs text-white outline-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={loading || pendingAction?.startsWith('admin:create:')}
                  onClick={() => void handleCreateAdmin()}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#10B981] px-3 text-xs font-semibold text-[#06140F] disabled:opacity-50"
                >
                  {pendingAction?.startsWith('admin:create:') ? 'Procesando...' : 'Crear admin'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
