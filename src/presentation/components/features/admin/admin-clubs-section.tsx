import Image from 'next/image';
import type { AdminClub } from '@/domain/admin/admin.types';
import { useAdminClubs } from './use-admin-clubs';

type AdminClubsSectionProps = {
  clubs: AdminClub[];
  headingClassName: string;
  canCreateClubs: boolean;
  canUpdateClubs: boolean;
  canDeleteClubs: boolean;
};

export function AdminClubsSection({
  clubs,
  headingClassName,
  canCreateClubs,
  canUpdateClubs,
  canDeleteClubs,
}: AdminClubsSectionProps) {
  const {
    actionFeedback,
    clubSearch,
    setClubSearch,
    filteredClubs,
    openCreateClubModal,
    openEditClubModal,
    clubModalMode,
    closeClubModal,
    clubForm,
    setClubForm,
    isLogoUploading,
    logoFileInputRef,
    handleLogoFileChange,
    handleSubmitClubModal,
    isClubModalPending,
    pendingAction,
    clubDeleteImpactModal,
    openClubDeleteImpactModal,
    closeClubDeleteImpactModal,
    confirmDeleteClub,
  } = useAdminClubs(clubs);

  return (
    <>
      <section id="clubes" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className={`${headingClassName} text-[20px] font-semibold text-white`}>Clubes</h3>
            <span className="text-xs text-[#9C9C9C]">Gestion de clubes organizadores</span>
          </div>
          {canCreateClubs ? (
            <button
              type="button"
              onClick={openCreateClubModal}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white"
            >
              Crear club
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

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <input
            value={clubSearch}
            onChange={(event) => setClubSearch(event.target.value)}
            placeholder="Buscar por nombre, lugar o correo"
            className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
          />
          <p className="flex h-10 items-center rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 text-xs text-[#9C9C9C]">
            {filteredClubs.length} club(es) visibles
          </p>
        </div>

        <div className="space-y-3">
          {filteredClubs.map((club) => {
            const isDeleting = pendingAction === `club:delete:${club.id}`;
            return (
              <article
                key={club.id}
                className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4 md:flex md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[#2D2D2D] bg-[#0B0B0B]">
                    {club.logoUrl ? (
                      <Image
                        src={club.logoUrl}
                        alt={`Logo ${club.name}`}
                        width={128}
                        height={128}
                        sizes="64px"
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl text-[#7F7F7F]">
                        {(club.name.trim().charAt(0) || 'C').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{club.name}</p>
                    <p className="mt-1 text-xs text-[#8D8D8D]">{club.place}</p>
                    <p className="mt-1 text-xs text-[#8D8D8D]">{club.contactEmail}</p>
                    <p className="mt-3 text-[13px] text-[#CFCFCF]">{club.members} miembros activos</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 md:mt-0">
                  {canUpdateClubs ? (
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => openEditClubModal(club)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                    >
                      Editar
                    </button>
                  ) : null}
                  {canDeleteClubs ? (
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => void openClubDeleteImpactModal(club.id, club.name)}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4B1F2A] px-3 text-xs font-semibold text-white"
                    >
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
          {filteredClubs.length === 0 ? (
            <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
              Aun no hay clubes registrados en la base de datos.
            </p>
          ) : null}
        </div>
      </section>

      {clubModalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className={`${headingClassName} text-[20px] font-semibold text-white`}>
                {clubModalMode === 'create' ? 'Crear club' : 'Editar club'}
              </h4>
              <button
                type="button"
                onClick={closeClubModal}
                disabled={isClubModalPending}
                className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={(event) => void handleSubmitClubModal(event)} className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                Nombre
                <input
                  value={clubForm.name}
                  onChange={(event) => setClubForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                Lugar
                <input
                  value={clubForm.place}
                  onChange={(event) => setClubForm((prev) => ({ ...prev, place: event.target.value }))}
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-[#A8A8A8] md:col-span-2">
                Correo de contacto
                <input
                  type="email"
                  value={clubForm.contactEmail}
                  onChange={(event) =>
                    setClubForm((prev) => ({ ...prev, contactEmail: event.target.value }))
                  }
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-[#A8A8A8] md:col-span-2">
                Descripcion
                <textarea
                  value={clubForm.description}
                  onChange={(event) => setClubForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="min-h-[96px] rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-sm text-white outline-none"
                />
              </label>

              <div className="flex flex-col gap-2 md:col-span-2">
                <span className="text-xs text-[#A8A8A8]">Logotipo del club</span>
                <div className="flex items-center gap-3">
                  {clubForm.logoUrl ? (
                    <Image
                      src={clubForm.logoUrl}
                      alt="Logo"
                      width={56}
                      height={56}
                      sizes="56px"
                      className="h-14 w-14 rounded-lg border border-[#2D2D2D] object-contain bg-[#101010] p-1"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-[#2D2D2D] bg-[#101010] text-[10px] text-[#555]">
                      Sin logo
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      disabled={isLogoUploading || isClubModalPending}
                      onClick={() => logoFileInputRef.current?.click()}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1] disabled:opacity-50"
                    >
                      {isLogoUploading ? 'Subiendo...' : 'Seleccionar imagen'}
                    </button>
                    {clubForm.logoUrl ? (
                      <button
                        type="button"
                        onClick={() => setClubForm((prev) => ({ ...prev, logoUrl: '' }))}
                        className="text-left text-[11px] text-[#fca5a5] hover:underline"
                      >
                        Quitar logotipo
                      </button>
                    ) : null}
<<<<<<< Updated upstream
                    <p className="text-[10px] text-[#666]">JPEG, PNG, WebP · max. 2 MB</p>
=======
                    <p className="text-[10px] text-[#666]">JPEG, PNG, WebP - max. 2 MB</p>
>>>>>>> Stashed changes
                  </div>
                </div>
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => void handleLogoFileChange(event)}
                />
              </div>

              <button
                type="submit"
                disabled={
                  isClubModalPending ||
                  (clubModalMode === 'create' ? !canCreateClubs : !canUpdateClubs)
                }
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white md:col-span-2"
              >
                {isClubModalPending
                  ? 'Guardando...'
                  : clubModalMode === 'create'
                    ? 'Crear club'
                    : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {clubDeleteImpactModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#4B1F2A] bg-[#161616] p-5 sm:p-6">
            <div className="mb-3">
              <p className="text-xs font-semibold tracking-[1.4px] text-[#FCA5A5]">CONFIRMACION DE BORRADO</p>
              <h4 className={`${headingClassName} mt-1 text-[20px] font-semibold text-white`}>Eliminar club</h4>
              <p className="mt-1 text-sm text-[#BFBFBF]">{clubDeleteImpactModal.clubName}</p>
            </div>

            {clubDeleteImpactModal.loading ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                Calculando impacto...
              </p>
            ) : null}

            {clubDeleteImpactModal.error ? (
              <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
                {clubDeleteImpactModal.error}
              </p>
            ) : null}

            {clubDeleteImpactModal.impact ? (
              <div className="space-y-3">
                <p className="text-sm text-[#D5D5D5]">Si continuas, se aplicaran los siguientes cambios:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Miembros asociados</p>
                    <p className="text-lg font-semibold text-white">{clubDeleteImpactModal.impact.members}</p>
                  </div>
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Eventos organizados</p>
                    <p className="text-lg font-semibold text-white">{clubDeleteImpactModal.impact.events}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={closeClubDeleteImpactModal}
                disabled={pendingAction === `club:delete:${clubDeleteImpactModal.clubId}`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteClub()}
                disabled={
                  !canDeleteClubs ||
                  clubDeleteImpactModal.loading ||
                  !!clubDeleteImpactModal.error ||
                  (clubDeleteImpactModal.impact
                    ? clubDeleteImpactModal.impact.events > 0
                    : false) ||
                  pendingAction === `club:delete:${clubDeleteImpactModal.clubId}`
                }
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7f1d1d] px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pendingAction === `club:delete:${clubDeleteImpactModal.clubId}`
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


