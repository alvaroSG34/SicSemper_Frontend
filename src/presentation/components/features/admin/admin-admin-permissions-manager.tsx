import { useEffect, useMemo, useState } from 'react';
import type { AdminPermissionEntry } from '@/domain/admin/admin.types';
import type { User } from '@/domain/user/user.types';
import { useAdminAccessControlSlice } from '@/presentation/stores/admin-access-control.slice';
import { useAdminStore } from '@/presentation/stores/admin.store';

type CrudAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
type AdminModuleKey =
  | 'USERS'
  | 'CLUBS'
  | 'EVENTS'
  | 'CATEGORIES'
  | 'EVENT_CATEGORIES'
  | 'JUDGE_ASSIGNMENTS'
  | 'JUDGE_PERMISSIONS'
  | 'ADMIN_PERMISSIONS';

type AdminPermissionManagerProps = {
  headingClassName: string;
  users: User[];
  selectedAdminId: string | null;
  onSelectAdmin: (adminUserId: string) => void;
  onBackToAdmins: () => void;
  loading: boolean;
  canManageAdminPermissions: boolean;
};

const CRUD_ACTIONS: readonly CrudAction[] = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

const MODULES: readonly { key: AdminModuleKey; label: string; description: string }[] = [
  { key: 'USERS', label: 'Users', description: 'Gestión de usuarios ADMIN/PARTICIPANTE/JUEZ' },
  { key: 'CLUBS', label: 'Clubs', description: 'Altas, consultas y bajas de clubes' },
  { key: 'EVENTS', label: 'Events', description: 'Operación completa de eventos' },
  { key: 'CATEGORIES', label: 'Categories', description: 'Mantenimiento de categorías' },
  { key: 'EVENT_CATEGORIES', label: 'EventCategories', description: 'Vínculos evento-categoría' },
  { key: 'JUDGE_ASSIGNMENTS', label: 'JudgeAssignments', description: 'Asignaciones de jueces' },
  { key: 'JUDGE_PERMISSIONS', label: 'JudgePermissions', description: 'Permisos de jueces' },
  { key: 'ADMIN_PERMISSIONS', label: 'AdminPermissions', description: 'Permisos de administradores' },
];

const ACTION_LABEL: Record<CrudAction, string> = {
  CREATE: 'Crear',
  READ: 'Ver',
  UPDATE: 'Editar',
  DELETE: 'Eliminar',
};

const isCrudPermissionForModule = (
  code: string,
): { module: AdminModuleKey; action: CrudAction } | null => {
  const match = /^ADMIN_(.+)_(CREATE|READ|UPDATE|DELETE)$/.exec(code);
  if (!match) {
    return null;
  }

  const [, moduleRaw, actionRaw] = match;
  const moduleKey = moduleRaw as AdminModuleKey;
  const action = actionRaw as CrudAction;

  const isKnownModule = MODULES.some((candidate) => candidate.key === moduleKey);
  if (!isKnownModule) {
    return null;
  }

  return { module: moduleKey, action };
};

export function AdminAdminPermissionsManager({
  headingClassName,
  users,
  selectedAdminId,
  onSelectAdmin,
  onBackToAdmins,
  loading,
  canManageAdminPermissions,
}: AdminPermissionManagerProps) {
  const {
    adminPermissionsMap,
    adminPermissionsLoading,
    adminPermissionsError,
    loadAdminPermissions,
    toggleAdminPermission,
  } = useAdminAccessControlSlice();
  const clearError = useAdminStore((state) => state.clearError);

  const [adminSearch, setAdminSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<AdminModuleKey>('USERS');
  const [bulkActionKey, setBulkActionKey] = useState<string | null>(null);

  const adminUsers = useMemo(
    () =>
      users.filter(
        (candidate) =>
          candidate.roles.includes('ADMIN') && !candidate.roles.includes('SUPERADMIN'),
      ),
    [users],
  );

  const filteredAdmins = useMemo(() => {
    const query = adminSearch.trim().toLowerCase();
    if (!query) {
      return adminUsers;
    }

    return adminUsers.filter((candidate) =>
      `${candidate.name} ${candidate.email}`.toLowerCase().includes(query),
    );
  }, [adminSearch, adminUsers]);

  const selectedAdmin =
    adminUsers.find((candidate) => candidate.id === selectedAdminId) ??
    (adminUsers.length > 0 ? adminUsers[0] : null);

  useEffect(() => {
    if (!selectedAdminId && adminUsers.length > 0) {
      onSelectAdmin(adminUsers[0].id);
      return;
    }

    if (selectedAdminId && !adminUsers.some((candidate) => candidate.id === selectedAdminId) && adminUsers.length > 0) {
      onSelectAdmin(adminUsers[0].id);
    }
  }, [adminUsers, onSelectAdmin, selectedAdminId]);

  useEffect(() => {
    if (!selectedAdmin) {
      return;
    }
    void loadAdminPermissions(selectedAdmin.id);
  }, [loadAdminPermissions, selectedAdmin]);

  const selectedEntries = useMemo(
    () => (selectedAdmin ? adminPermissionsMap[selectedAdmin.id] ?? [] : []),
    [adminPermissionsMap, selectedAdmin],
  );

  const permissionsByModule = useMemo(() => {
    const initial = Object.fromEntries(
      MODULES.map((module) => [
        module.key,
        Object.fromEntries(CRUD_ACTIONS.map((action) => [action, null])) as Record<
          CrudAction,
          AdminPermissionEntry | null
        >,
      ]),
    ) as Record<AdminModuleKey, Record<CrudAction, AdminPermissionEntry | null>>;

    for (const entry of selectedEntries) {
      const parsed = isCrudPermissionForModule(entry.code);
      if (!parsed) {
        continue;
      }
      initial[parsed.module][parsed.action] = entry;
    }

    return initial;
  }, [selectedEntries]);

  const activeModuleConfig = MODULES.find((module) => module.key === selectedModule) ?? MODULES[0];
  const activeModuleEntries = permissionsByModule[activeModuleConfig.key];
  const activeModuleValues = CRUD_ACTIONS
    .map((action) => activeModuleEntries[action])
    .filter((entry): entry is AdminPermissionEntry => Boolean(entry));

  const selectedAdminError = selectedAdmin ? adminPermissionsError[selectedAdmin.id] : null;
  const selectedAdminLoading = selectedAdmin ? adminPermissionsLoading[selectedAdmin.id] : false;

  const runToggle = async (entry: AdminPermissionEntry) => {
    if (!selectedAdmin) {
      return;
    }

    const shouldRevoke = entry.granted;
    clearError();
    await toggleAdminPermission(selectedAdmin.id, entry.code, shouldRevoke);
  };

  const runGrantAllCrud = async () => {
    if (!selectedAdmin) {
      return;
    }

    const key = `${selectedAdmin.id}:${activeModuleConfig.key}:grant-all`;
    setBulkActionKey(key);
    clearError();
    try {
      for (const entry of activeModuleValues) {
        if (entry.granted) {
          continue;
        }
        await toggleAdminPermission(selectedAdmin.id, entry.code, false);
      }
    } finally {
      setBulkActionKey(null);
    }
  };

  const runDeactivateAllCrud = async () => {
    if (!selectedAdmin) {
      return;
    }

    const key = `${selectedAdmin.id}:${activeModuleConfig.key}:deactivate-all`;
    setBulkActionKey(key);
    clearError();
    try {
      for (const entry of activeModuleValues) {
        if (!entry.granted) {
          continue;
        }
        await toggleAdminPermission(selectedAdmin.id, entry.code, true);
      }
    } finally {
      setBulkActionKey(null);
    }
  };

  return (
    <section id="admins-permisos" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-4 sm:p-5 xl:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={`${headingClassName} text-[20px] font-semibold text-white`}>Gestor de permisos de ADMIN</h3>
          <p className="text-xs text-[#9C9C9C]">Vista dedicada sin scroll para edición por módulo y CRUD</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBackToAdmins}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
          >
            Volver a admins
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px,1fr]">
        <article className="rounded-2xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[1.2px] text-[#AFAFAF]">Selector de admin</p>
          <input
            value={adminSearch}
            onChange={(event) => setAdminSearch(event.target.value)}
            placeholder="Buscar admin por nombre o correo"
            className="mb-2 h-9 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-xs text-white outline-none"
          />
          <select
            value={selectedAdmin?.id ?? ''}
            onChange={(event) => onSelectAdmin(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
          >
            {filteredAdmins.length === 0 ? <option value="">Sin admins disponibles</option> : null}
            {filteredAdmins.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name} ({candidate.email})
              </option>
            ))}
          </select>

          {selectedAdmin ? (
            <div className="mt-3 rounded-xl border border-[#2D2D2D] bg-[#171717] p-3">
              <p className="text-sm font-semibold text-white">{selectedAdmin.name}</p>
              <p className="text-xs text-[#9C9C9C]">{selectedAdmin.email}</p>
              <p className="mt-2 text-[11px] text-[#AFAFAF]">{activeModuleValues.length} permiso(s) CRUD en módulo activo</p>
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-[#2D2D2D] bg-[#171717] p-3 text-xs text-[#9C9C9C]">
              No hay administradores para gestionar.
            </p>
          )}
        </article>

        <article className="rounded-2xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[1.2px] text-[#AFAFAF]">Módulos</p>
          <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {MODULES.map((module) => {
              const moduleEntries = permissionsByModule[module.key];
              const grantedCount = CRUD_ACTIONS.reduce((acc, action) => {
                const entry = moduleEntries[action];
                return acc + (entry?.granted ? 1 : 0);
              }, 0);
              const isActive = module.key === activeModuleConfig.key;
              return (
                <button
                  key={module.key}
                  type="button"
                  onClick={() => setSelectedModule(module.key)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs ${
                    isActive
                      ? 'border-[#5B68F1] bg-[rgba(91,104,241,0.16)] text-[#DDE2FF]'
                      : 'border-[#2D2D2D] bg-[#171717] text-[#BDBDBD]'
                  }`}
                >
                  <p className="font-semibold">{module.label}</p>
                  <p className="text-[11px] opacity-80">{grantedCount}/4 activos</p>
                </button>
              );
            })}
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2D2D2D] bg-[#171717] px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-white">{activeModuleConfig.label}</p>
              <p className="text-[11px] text-[#9C9C9C]">{activeModuleConfig.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  !canManageAdminPermissions ||
                  !selectedAdmin ||
                  !!bulkActionKey ||
                  selectedAdminLoading ||
                  loading
                }
                onClick={() => void runGrantAllCrud()}
                className="inline-flex h-8 items-center justify-center rounded-md border border-[#14532d] bg-[#0B2318] px-2.5 text-[11px] font-semibold text-[#9EE6B5] disabled:opacity-50"
              >
                {bulkActionKey?.endsWith('grant-all') ? 'Aplicando...' : 'Activar todo CRUD'}
              </button>
              <button
                type="button"
                disabled={
                  !canManageAdminPermissions ||
                  !selectedAdmin ||
                  !!bulkActionKey ||
                  selectedAdminLoading ||
                  loading
                }
                onClick={() => void runDeactivateAllCrud()}
                className="inline-flex h-8 items-center justify-center rounded-md border border-[#7f1d1d] bg-[#3A1414] px-2.5 text-[11px] font-semibold text-[#F6B2B2] disabled:opacity-50"
              >
                {bulkActionKey?.endsWith('deactivate-all') ? 'Aplicando...' : 'Desactivar todo CRUD'}
              </button>
            </div>
          </div>

          {selectedAdminError ? (
            <p className="mb-3 rounded-lg border border-[#7f1d1d] bg-[#7f1d1d]/20 px-3 py-2 text-xs text-[#fca5a5]">
              {selectedAdminError}
            </p>
          ) : null}

          {selectedAdminLoading ? (
            <p className="rounded-xl border border-[#2D2D2D] bg-[#171717] px-4 py-3 text-sm text-[#9C9C9C]">
              Cargando permisos del administrador...
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CRUD_ACTIONS.map((action) => {
                const entry = activeModuleEntries[action];
                if (!entry) {
                  return (
                    <article key={action} className="rounded-xl border border-[#2D2D2D] bg-[#171717] p-3">
                      <p className="text-[11px] font-semibold tracking-[1.2px] text-[#9C9C9C]">
                        {ACTION_LABEL[action]}
                      </p>
                      <p className="mt-2 text-xs text-[#8E8E8E]">Sin permiso mapeado para esta acción</p>
                    </article>
                  );
                }

                const actionKey = `admin-perm:toggle:${selectedAdmin?.id}:${entry.code}`;
                const isToggling = Boolean(adminPermissionsLoading[actionKey]);
                const isEnabled = entry.granted;

                return (
                  <article key={entry.code} className="rounded-xl border border-[#2D2D2D] bg-[#171717] p-3">
                    <p className="text-[11px] font-semibold tracking-[1.2px] text-[#AFAFAF]">
                      {ACTION_LABEL[action]} · {entry.code}
                    </p>
                    <button
                      type="button"
                      disabled={
                        !canManageAdminPermissions ||
                        isToggling ||
                        loading ||
                        !selectedAdmin
                      }
                      onClick={() => void runToggle(entry)}
                      aria-pressed={isEnabled}
                      className="mt-3 inline-flex h-8 min-w-[170px] items-center justify-between rounded-md border border-[#2D2D2D] bg-[#101010] px-3 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      <span>
                        {isToggling
                          ? 'Procesando...'
                          : isEnabled
                            ? 'Activado'
                            : 'Desactivado'}
                      </span>
                      <span
                        className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                          isEnabled ? 'bg-[#10B981]' : 'bg-[#3A3A3A]'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
