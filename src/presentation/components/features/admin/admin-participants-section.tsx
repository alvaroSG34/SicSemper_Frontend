import { ImageWithSkeleton } from '@/presentation/components/ui';
import type { User } from '@/domain/user/user.types';
import { useAdminParticipants } from './use-admin-participants';

type AdminParticipantsSectionProps = {
  users: User[];
  headingClassName: string;
  canUpdateUsers: boolean;
};

const getParticipantInitial = (user: User) => {
  const source = user.name?.trim() || user.email?.trim() || 'P';
  return source.charAt(0).toUpperCase();
};

const ParticipantAvatar = ({ user }: { user: User }) => {
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
          {getParticipantInitial(user)}
        </div>
      )}
    </div>
  );
};

export function AdminParticipantsSection({
  users,
  headingClassName,
  canUpdateUsers,
}: AdminParticipantsSectionProps) {
  const {
    roleLabel,
    participantStatusConfig,
    participantSearch,
    setParticipantSearch,
    participantRoleFilter,
    setParticipantRoleFilter,
    filteredUsers,
    participantKpis,
    participantDetailModal,
    setParticipantDetailModal,
    pendingAction,
    actionFeedback,
    handleBanParticipant,
  } = useAdminParticipants(users);

  return (
    <>
      <section
        id="participantes"
        className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className={`${headingClassName} text-[20px] font-semibold text-white`}>Participantes</h3>
          <span className="text-xs text-[#9C9C9C]">Gestion de participantes registrados</span>
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

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
            <p className="text-[11px] text-[#9C9C9C]">Total</p>
            <p className="text-2xl font-semibold text-white">{participantKpis.total}</p>
          </div>
          <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
            <p className="text-[11px] text-[#9C9C9C]">Verificados</p>
            <p className="text-2xl font-semibold text-green-400">{participantKpis.verified}</p>
          </div>
          <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
            <p className="text-[11px] text-[#9C9C9C]">Activos</p>
            <p className="text-2xl font-semibold text-[#A8AFFF]">{participantKpis.active}</p>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <input
            value={participantSearch}
            onChange={(event) => setParticipantSearch(event.target.value)}
            placeholder="Buscar por nombre o correo"
            className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
          />
          <select
            value={participantRoleFilter}
            onChange={(event) =>
              setParticipantRoleFilter(event.target.value as 'TODOS' | 'SOLO_PARTICIPANTES')
            }
            className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
          >
            <option value="TODOS">Todos</option>
            <option value="SOLO_PARTICIPANTES">Solo participantes</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((candidate) => {
            const statusCfg =
              participantStatusConfig[candidate.status ?? ''] ??
              participantStatusConfig['INACTIVO'];
            return (
              <article
                key={candidate.id}
                className="flex flex-col gap-3 rounded-xl bg-[#1A1A1A] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <ParticipantAvatar user={candidate} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{candidate.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusCfg.className}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#8D8D8D]">{candidate.email}</p>
                    {candidate.club ? (
                      <p className="mt-1 text-[11px] text-[#9C9C9C]">
                        Club: <span className="text-[#D1D1D1]">{candidate.club.name}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-[#9C9C9C]">Sin club asignado</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setParticipantDetailModal(candidate)}
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-[18px] border border-[#2D2D2D] bg-[#1E1E1E] px-4 text-xs font-semibold text-[#D1D1D1]"
                >
                  Ver mas detalles
                </button>
              </article>
            );
          })}
          {filteredUsers.length === 0 ? (
            <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
              No se encontraron participantes con los filtros seleccionados.
            </p>
          ) : null}
        </div>
      </section>

      {participantDetailModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ParticipantAvatar user={participantDetailModal} />
                <div className="min-w-0">
                  <h4 className={`${headingClassName} truncate text-[20px] font-semibold text-white`}>
                    {participantDetailModal.name}
                  </h4>
                  <p className="mt-0.5 truncate text-xs text-[#9C9C9C]">{participantDetailModal.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setParticipantDetailModal(null)}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
              >
                Cerrar
              </button>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const s =
                    participantStatusConfig[participantDetailModal.status ?? ''] ??
                    participantStatusConfig['INACTIVO'];
                  return (
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.className}`}>
                      {s.label}
                    </span>
                  );
                })()}
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    participantDetailModal.verified
                      ? 'bg-green-900/40 text-green-400'
                      : 'bg-yellow-900/40 text-yellow-400'
                  }`}
                >
                  {participantDetailModal.verified ? 'Cuenta verificada' : 'Sin verificar'}
                </span>
                {participantDetailModal.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full border border-[#2C2C2C] bg-[#1E1E1E] px-2.5 py-1 text-[11px] text-[#D7D7D7]"
                  >
                    {roleLabel[role as keyof typeof roleLabel] ?? role}
                  </span>
                ))}
              </div>

              <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9C9C9C]">
                  Datos personales
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] text-[#9C9C9C]">CI / Documento</p>
                    <p className="text-sm text-white">{participantDetailModal.ci ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9C9C9C]">Telefono</p>
                    <p className="text-sm text-white">{participantDetailModal.phone ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9C9C9C]">Pais</p>
                    <p className="text-sm text-white">{participantDetailModal.country ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9C9C9C]">Ciudad</p>
                    <p className="text-sm text-white">{participantDetailModal.city ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9C9C9C]">Fecha de nacimiento</p>
                    <p className="text-sm text-white">
                      {participantDetailModal.birthDate
                        ? new Date(participantDetailModal.birthDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9C9C9C]">Miembro desde</p>
                    <p className="text-sm text-white">
                      {participantDetailModal.createdAt
                        ? new Date(participantDetailModal.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#9C9C9C]">Club</p>
                {participantDetailModal.club ? (
                  <p className="text-sm font-semibold text-white">{participantDetailModal.club.name}</p>
                ) : (
                  <p className="text-sm text-[#9C9C9C]">Sin club asignado</p>
                )}
              </div>

              <div className="pt-1">
                {canUpdateUsers ? (
                  participantDetailModal.status === 'SUSPENDIDO' ? (
                    <button
                      type="button"
                      disabled={pendingAction === `user:ban:${participantDetailModal.id}`}
                      onClick={() => void handleBanParticipant(participantDetailModal.id, true)}
                      className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-[#2D2D2D] bg-[#121212] text-xs font-semibold text-[#D1D1D1] disabled:opacity-50"
                    >
                      {pendingAction === `user:ban:${participantDetailModal.id}`
                        ? 'Procesando...'
                        : 'Quitar suspension'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={pendingAction === `user:ban:${participantDetailModal.id}`}
                      onClick={() => void handleBanParticipant(participantDetailModal.id, false)}
                      className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-red-600/20 text-xs font-semibold text-red-400 hover:bg-red-600/30 disabled:opacity-50"
                    >
                      {pendingAction === `user:ban:${participantDetailModal.id}`
                        ? 'Procesando...'
                        : 'Banear participante'}
                    </button>
                  )
                ) : (
                  <p className="rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 py-2 text-xs text-[#9C9C9C]">
                    Solo lectura: no tienes permiso para actualizar usuarios.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

