import { useState, type FormEvent } from 'react';
import type { CatalogScale } from '@/domain/admin/admin.types';
import { useAdminOperations } from './use-admin-operations';
import { useAdminStore } from '@/presentation/stores';

type AdminScalesSectionProps = {
  scales: CatalogScale[];
  headingClassName: string;
  loading?: boolean;
  canCreateScales: boolean;
  canUpdateScales: boolean;
  canDeleteScales: boolean;
};

type ScaleModalMode = 'create' | 'edit';
const SCALE_RATIO_PATTERN = /^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/;

export function AdminScalesSection({
  scales,
  headingClassName,
  loading = false,
  canCreateScales,
  canUpdateScales,
  canDeleteScales,
}: AdminScalesSectionProps) {
  const {
    createScale,
    updateScale,
    getScaleDeleteImpact,
    removeScale,
  } = useAdminOperations();
  const clearError = useAdminStore((state) => state.clearError);

  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [scaleModalMode, setScaleModalMode] = useState<ScaleModalMode | null>(null);
  const [scaleForm, setScaleForm] = useState<{ id: string | null; value: string }>({
    id: null,
    value: '',
  });
  const [scaleModalError, setScaleModalError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    scaleId: string;
    scaleValue: string;
    loading: boolean;
    error: string | null;
    impact: { eventCategoryRules: number; models: number } | null;
  } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const executeAction = async (
    actionKey: string,
    successMessage: string,
    action: () => Promise<void>,
  ) => {
    setPendingAction(actionKey);
    setActionFeedback(null);
    clearError();
    try {
      await action();
      const latestError = useAdminStore.getState().error;
      if (latestError) {
        setActionFeedback({ type: 'error', message: latestError });
        return false;
      }
      setActionFeedback({ type: 'success', message: successMessage });
      return true;
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo completar la accion.',
      });
      return false;
    } finally {
      setPendingAction((current) => (current === actionKey ? null : current));
    }
  };

  const openCreateModal = () => {
    setScaleModalMode('create');
    setScaleForm({ id: null, value: '' });
    setScaleModalError(null);
    setActionFeedback(null);
    clearError();
  };

  const openEditModal = (scale: CatalogScale) => {
    setScaleModalMode('edit');
    setScaleForm({ id: scale.id, value: scale.value });
    setScaleModalError(null);
    setActionFeedback(null);
    clearError();
  };

  const closeScaleModal = () => {
    if (pendingAction === 'scale:create') return;
    if (scaleForm.id && pendingAction === `scale:update:${scaleForm.id}`) return;
    setScaleModalMode(null);
    setScaleForm({ id: null, value: '' });
    setScaleModalError(null);
  };

  const handleSubmitScaleModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = scaleForm.value.trim();
    if (!value) {
      setScaleModalError('Debes ingresar un valor de escala.');
      return;
    }

    const match = SCALE_RATIO_PATTERN.exec(value);
    if (!match) {
      setScaleModalError('La escala debe tener formato N:N (ej. 1:72) y ambos valores deben ser mayores a 0.');
      return;
    }
    const leftNumber = Number(match[1]);
    const rightNumber = Number(match[2]);
    if (
      !Number.isFinite(leftNumber) ||
      !Number.isFinite(rightNumber) ||
      leftNumber <= 0 ||
      rightNumber <= 0
    ) {
      setScaleModalError('La escala debe tener formato N:N (ej. 1:72) y ambos valores deben ser mayores a 0.');
      return;
    }
    setScaleModalError(null);

    if (scaleModalMode === 'create') {
      const success = await executeAction('scale:create', 'Escala creada correctamente.', async () => {
        await createScale({ value });
      });
      if (success) closeScaleModal();
      return;
    }

    if (scaleModalMode === 'edit' && scaleForm.id) {
      const scaleId = scaleForm.id;
      const success = await executeAction(`scale:update:${scaleId}`, 'Escala actualizada correctamente.', async () => {
        await updateScale({ id: scaleId, value });
      });
      if (success) closeScaleModal();
    }
  };

  const openDeleteModal = async (scale: CatalogScale) => {
    setActionFeedback(null);
    clearError();
    setDeleteConfirmText('');
    setDeleteModal({
      scaleId: scale.id,
      scaleValue: scale.value,
      loading: true,
      error: null,
      impact: null,
    });
    try {
      const impact = await getScaleDeleteImpact(scale.id);
      setDeleteModal((prev) =>
        prev && prev.scaleId === scale.id
          ? {
              ...prev,
              loading: false,
              error: null,
              impact: {
                eventCategoryRules: impact.eventCategoryRules,
                models: impact.models,
              },
            }
          : prev,
      );
    } catch (error) {
      setDeleteModal((prev) =>
        prev && prev.scaleId === scale.id
          ? {
              ...prev,
              loading: false,
              error: error instanceof Error ? error.message : 'No se pudo calcular el impacto.',
            }
          : prev,
      );
    }
  };

  const closeDeleteModal = () => {
    if (deleteModal && pendingAction === `scale:delete:${deleteModal.scaleId}`) return;
    setDeleteModal(null);
    setDeleteConfirmText('');
  };

  const confirmDeleteScale = async () => {
    if (!deleteModal) return;
    const scaleId = deleteModal.scaleId;
    const success = await executeAction(`scale:delete:${scaleId}`, 'Escala eliminada correctamente.', async () => {
      await removeScale(scaleId);
    });
    if (success) {
      setDeleteModal(null);
      setDeleteConfirmText('');
    }
  };

  return (
    <>
      <section id="escalas" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className={`${headingClassName} text-[20px] font-semibold text-white`}>Escalas</h3>
            <span className="text-xs text-[#9C9C9C]">Catalogo global de escalas disponibles</span>
          </div>
          {canCreateScales ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white"
            >
              Crear escala
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

        <div className="space-y-3">
          {scales.map((scale) => {
            const isUpdating = pendingAction === `scale:update:${scale.id}`;
            const isDeleting = pendingAction === `scale:delete:${scale.id}`;
            return (
              <article
                key={scale.id}
                className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4 md:flex md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{scale.value}</p>
                  <p className="text-[11px] text-[#9C9C9C]">Creada: {new Date(scale.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
                  {canUpdateScales ? (
                    <button
                      type="button"
                      disabled={loading || isUpdating || isDeleting}
                      onClick={() => openEditModal(scale)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                    >
                      Editar
                    </button>
                  ) : null}
                  {canDeleteScales ? (
                    <button
                      type="button"
                      disabled={loading || isUpdating || isDeleting}
                      onClick={() => void openDeleteModal(scale)}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4B1F2A] px-3 text-xs font-semibold text-white"
                    >
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
          {scales.length === 0 ? (
            <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
              No hay escalas registradas.
            </p>
          ) : null}
        </div>
      </section>

      {scaleModalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className={`${headingClassName} text-[20px] font-semibold text-white`}>
                {scaleModalMode === 'create' ? 'Crear escala' : 'Editar escala'}
              </h4>
              <button
                type="button"
                onClick={closeScaleModal}
                className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
              >
                Cerrar
              </button>
            </div>
            <form onSubmit={(event) => void handleSubmitScaleModal(event)} className="grid gap-3">
              <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                Valor de escala
                <input
                  value={scaleForm.value}
                  onChange={(event) =>
                    setScaleForm((prev) => ({
                      ...prev,
                      value: event.target.value,
                    }))
                  }
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                  placeholder="Ej. 1:72"
                />
              </label>
              {scaleModalError ? (
                <p className="rounded-lg border border-[#7f1d1d] bg-[#7f1d1d]/20 px-3 py-2 text-xs text-[#fca5a5]">
                  {scaleModalError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={
                  pendingAction === 'scale:create' ||
                  (scaleForm.id ? pendingAction === `scale:update:${scaleForm.id}` : false) ||
                  (scaleModalMode === 'create' ? !canCreateScales : !canUpdateScales)
                }
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white"
              >
                {pendingAction === 'scale:create' ||
                (scaleForm.id ? pendingAction === `scale:update:${scaleForm.id}` : false)
                  ? 'Guardando...'
                  : scaleModalMode === 'create'
                    ? 'Crear escala'
                    : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {deleteModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#4B1F2A] bg-[#161616] p-5 sm:p-6">
            <div className="mb-3">
              <p className="text-xs font-semibold tracking-[1.4px] text-[#FCA5A5]">CONFIRMACION DE BORRADO</p>
              <h4 className={`${headingClassName} mt-1 text-[20px] font-semibold text-white`}>Eliminar escala</h4>
              <p className="mt-1 text-sm text-[#BFBFBF]">{deleteModal.scaleValue}</p>
            </div>

            {deleteModal.loading ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                Calculando impacto...
              </p>
            ) : null}

            {deleteModal.error ? (
              <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
                {deleteModal.error}
              </p>
            ) : null}

            {deleteModal.impact ? (
              <div className="space-y-3">
                <p className="text-sm text-[#D5D5D5]">
                  Esta escala esta relacionada con los siguientes datos:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Reglas evento-categoria</p>
                    <p className="text-lg font-semibold text-white">{deleteModal.impact.eventCategoryRules}</p>
                  </div>
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Maquetas</p>
                    <p className="text-lg font-semibold text-white">{deleteModal.impact.models}</p>
                  </div>
                </div>
                {deleteModal.impact.eventCategoryRules > 0 || deleteModal.impact.models > 0 ? (
                  <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
                    No se puede eliminar mientras la escala este en uso.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                Escribe <span className="inline font-semibold tracking-widest text-white">CONFIRMAR</span> para continuar
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(event) => setDeleteConfirmText(event.target.value)}
                  placeholder="CONFIRMAR"
                  className="mt-1 h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none placeholder:text-[#555]"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={pendingAction === `scale:delete:${deleteModal.scaleId}`}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void confirmDeleteScale()}
                  disabled={
                    !canDeleteScales ||
                    deleteModal.loading ||
                    !!deleteModal.error ||
                    !deleteModal.impact ||
                    deleteModal.impact.eventCategoryRules > 0 ||
                    deleteModal.impact.models > 0 ||
                    deleteConfirmText !== 'CONFIRMAR' ||
                    pendingAction === `scale:delete:${deleteModal.scaleId}`
                  }
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7f1d1d] px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {pendingAction === `scale:delete:${deleteModal.scaleId}` ? 'Eliminando...' : 'Eliminar definitivamente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
