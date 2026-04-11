import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ImagePlus, RefreshCw, Save, Send, Undo2, Upload } from 'lucide-react';
import { adminLandingService } from '@/application/admin/services/admin-landing.service';
import type {
  LandingAsset,
  LandingContent,
  LandingDraftState,
} from '@/domain/landing/landing.types';

type AdminLandingSectionProps = {
  headingClassName: string;
};

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

type ImageTarget = {
  path: string;
  label: string;
};

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const asJson = (value: unknown) => JSON.stringify(value);

const formatDateTime = (raw: string | null | undefined) => {
  if (!raw) return 'Sin datos';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return 'Sin datos';
  return date.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const setByPath = <T extends object>(source: T, path: string, value: unknown): T => {
  const next = deepClone(source) as Record<string, unknown>;
  const parts = path.split('.');
  let cursor: unknown = next;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index]!;
    const key = /^\d+$/.test(part) ? Number(part) : part;

    if (Array.isArray(cursor) && typeof key === 'number') {
      cursor = cursor[key];
      continue;
    }

    if (cursor && typeof cursor === 'object') {
      cursor = (cursor as Record<string, unknown>)[String(key)];
    }
  }

  const last = parts[parts.length - 1]!;
  const lastKey = /^\d+$/.test(last) ? Number(last) : last;

  if (Array.isArray(cursor) && typeof lastKey === 'number') {
    cursor[lastKey] = value;
  } else if (cursor && typeof cursor === 'object') {
    (cursor as Record<string, unknown>)[String(lastKey)] = value;
  }

  return next as T;
};

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-[#2D2D2D] bg-[#0B0B0B] px-3 text-sm text-white outline-none"
      />
    </label>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[78px] rounded-lg border border-[#2D2D2D] bg-[#0B0B0B] px-3 py-2 text-sm text-white outline-none"
      />
    </label>
  );
}

export function AdminLandingSection({ headingClassName }: AdminLandingSectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const [draft, setDraft] = useState<LandingContent | null>(null);
  const [serverDraft, setServerDraft] = useState<LandingContent | null>(null);
  const [publishedContent, setPublishedContent] = useState<LandingContent | null>(null);
  const [isDraftDirtyOnServer, setIsDraftDirtyOnServer] = useState(false);

  const [draftUpdatedAt, setDraftUpdatedAt] = useState<string | null>(null);
  const [draftUpdatedBy, setDraftUpdatedBy] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [publishedBy, setPublishedBy] = useState<string | null>(null);

  const [assets, setAssets] = useState<LandingAsset[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeImageTarget, setActiveImageTarget] = useState<ImageTarget | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const applyServerState = (state: LandingDraftState) => {
    const nextDraft = deepClone(state.draftContent);
    setDraft(nextDraft);
    setServerDraft(deepClone(nextDraft));
    setPublishedContent(deepClone(state.publishedContent));
    setIsDraftDirtyOnServer(state.isDraftDirty);
    setDraftUpdatedAt(state.draftUpdatedAt ?? null);
    setDraftUpdatedBy(state.draftUpdatedBy?.name ?? null);
    setPublishedAt(state.publishedAt ?? null);
    setPublishedBy(state.publishedBy?.name ?? null);
  };

  const loadDraftState = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const state = await adminLandingService.getLandingDraftState();
      applyServerState(state);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo cargar la landing.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    setAssetsLoading(true);
    try {
      const listed = await adminLandingService.listLandingAssets();
      setAssets(listed);
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'No se pudo cargar la biblioteca de assets.',
      });
    } finally {
      setAssetsLoading(false);
    }
  };

  useEffect(() => {
    void loadDraftState();
  }, []);

  const localDirty = useMemo(() => {
    if (!draft || !serverDraft) return false;
    return asJson(draft) !== asJson(serverDraft);
  }, [draft, serverDraft]);

  const statusLabel = useMemo(() => {
    if (localDirty) return 'Cambios locales sin guardar';
    if (isDraftDirtyOnServer) return 'Borrador con cambios pendientes de publicar';
    return 'Publicado al dia';
  }, [isDraftDirtyOnServer, localDirty]);

  const statusClassName = useMemo(() => {
    if (localDirty) return 'border-[#92400E] bg-[#451A03] text-[#FCD34D]';
    if (isDraftDirtyOnServer) return 'border-[#1D4ED8] bg-[#172554] text-[#93C5FD]';
    return 'border-[#14532D] bg-[#052E16] text-[#86EFAC]';
  }, [isDraftDirtyOnServer, localDirty]);

  const updateField = (path: string, value: unknown) => {
    setDraft((current) => (current ? setByPath(current, path, value) : current));
  };

  const openLibrary = async (path: string, label: string) => {
    setActiveImageTarget({ path, label });
    setIsLibraryOpen(true);
    if (assets.length === 0) await loadAssets();
  };

  const selectAsset = (url: string) => {
    if (!activeImageTarget) return;
    updateField(activeImageTarget.path, url);
    setIsLibraryOpen(false);
    setFeedback({
      type: 'success',
      message: `Imagen asignada a ${activeImageTarget.label}.`,
    });
  };

  const onUploadAsset = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    setUploadingAsset(true);
    setFeedback(null);

    try {
      const uploaded = await adminLandingService.uploadLandingAsset(file);
      setAssets((current) => [uploaded, ...current]);
      if (activeImageTarget) {
        updateField(activeImageTarget.path, uploaded.url);
        setFeedback({
          type: 'success',
          message: `Asset subido y asignado a ${activeImageTarget.label}.`,
        });
      } else {
        setFeedback({ type: 'success', message: 'Asset subido correctamente.' });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'No se pudo subir el asset de landing.',
      });
    } finally {
      setUploadingAsset(false);
    }
  };

  const saveDraft = async () => {
    if (!draft) return;
    setSaving(true);
    setFeedback(null);
    try {
      const state = await adminLandingService.updateLandingDraft(draft);
      applyServerState(state);
      setFeedback({ type: 'success', message: 'Borrador guardado correctamente.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo guardar el borrador.',
      });
    } finally {
      setSaving(false);
    }
  };

  const publishDraft = async () => {
    setPublishing(true);
    setFeedback(null);
    try {
      const state = await adminLandingService.publishLandingDraft();
      applyServerState(state);
      setFeedback({ type: 'success', message: 'Landing publicada correctamente.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo publicar la landing.',
      });
    } finally {
      setPublishing(false);
    }
  };

  const restoreFromPublished = async () => {
    if (!publishedContent) return;
    setSaving(true);
    setFeedback(null);
    try {
      const state = await adminLandingService.updateLandingDraft(publishedContent);
      applyServerState(state);
      setFeedback({
        type: 'success',
        message: 'Borrador restaurado desde la version publicada.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo restaurar el borrador desde publicado.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !draft) {
    return (
      <section id="landing" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-4 sm:p-5 xl:p-6">
        <p className="text-sm text-[#9C9C9C]">Cargando editor de landing...</p>
      </section>
    );
  }

  return (
    <>
      <section id="landing" className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-4 sm:p-5 xl:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className={`${headingClassName} text-[18px] font-semibold text-white`}>
              Editor visual de Landing (solo SUPERADMIN)
            </h3>
            <p className="text-xs text-[#9C9C9C]">
              Edita bloques fijos, guarda borrador y publica cuando este listo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadDraftState()}
              disabled={loading || saving || publishing}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar
            </button>
            <button
              type="button"
              onClick={() => void restoreFromPublished()}
              disabled={saving || publishing}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              <Undo2 className="h-4 w-4" />
              Restaurar desde publicado
            </button>
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={saving || publishing}
              className="inline-flex items-center gap-2 rounded-lg border border-[#3B82F6]/60 bg-[#1D4ED8]/20 px-3 py-2 text-xs font-semibold text-[#BFDBFE] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar borrador'}
            </button>
            <button
              type="button"
              onClick={() => void publishDraft()}
              disabled={publishing || saving}
              className="inline-flex items-center gap-2 rounded-lg border border-[#14532D] bg-[#052E16] px-3 py-2 text-xs font-semibold text-[#86EFAC] disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {publishing ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-lg border px-3 py-1 text-xs ${statusClassName}`}>{statusLabel}</span>
          <span className="rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-1 text-[11px] text-[#B5B5B5]">
            Borrador: {formatDateTime(draftUpdatedAt)}
            {draftUpdatedBy ? ` por ${draftUpdatedBy}` : ''}
          </span>
          <span className="rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-1 text-[11px] text-[#B5B5B5]">
            Publicado: {formatDateTime(publishedAt)}
            {publishedBy ? ` por ${publishedBy}` : ''}
          </span>
        </div>

        {feedback ? (
          <div
            className={`mb-3 rounded-lg border px-3 py-2 text-xs ${
              feedback.type === 'success'
                ? 'border-[#14532D] bg-[#052E16] text-[#86EFAC]'
                : 'border-[#7F1D1D] bg-[#450A0A] text-[#FCA5A5]'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="space-y-5">
          <article className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-4">
            <h4 className="mb-3 text-sm font-semibold text-white">Hero</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput label="Fecha principal" value={draft.heroDate} onChange={(value) => updateField('heroDate', value)} />
              <TextAreaInput label="Titulo principal" value={draft.heroTitle} onChange={(value) => updateField('heroTitle', value)} />
            </div>
          </article>

          <article className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-4">
            <h4 className="mb-3 text-sm font-semibold text-white">Model cards</h4>
            <div className="grid gap-3 lg:grid-cols-3">
              {draft.modelCards.map((card, index) => (
                <div key={`model-card-${index}`} className="rounded-lg border border-[#2D2D2D] bg-[#0B0B0B] p-3">
                  <p className="mb-2 text-xs font-semibold text-[#CFCFCF]">Card {index + 1}</p>
                  <div className="space-y-2">
                    <TextInput label="Nombre" value={card.name} onChange={(value) => updateField(`modelCards.${index}.name`, value)} />
                    <TextInput label="Categoria" value={card.category} onChange={(value) => updateField(`modelCards.${index}.category`, value)} />
                    <TextInput label="Escala" value={card.scale} onChange={(value) => updateField(`modelCards.${index}.scale`, value)} />
                    <TextInput label="URL imagen" value={card.image} onChange={(value) => updateField(`modelCards.${index}.image`, value)} />
                    <button type="button" onClick={() => void openLibrary(`modelCards.${index}.image`, `Model card ${index + 1}`)} className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#2D2D2D] px-2 text-[11px] text-white">
                      <ImagePlus className="h-3.5 w-3.5" />
                      Biblioteca
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-4">
            <h4 className="mb-3 text-sm font-semibold text-white">Bloque de eventos</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput label="Titulo" value={draft.eventsCopy.title} onChange={(value) => updateField('eventsCopy.title', value)} />
              <TextInput label="Subtitulo" value={draft.eventsCopy.subtitle} onChange={(value) => updateField('eventsCopy.subtitle', value)} />
              <TextAreaInput label="Descripcion principal" value={draft.eventsCopy.descriptionOne} onChange={(value) => updateField('eventsCopy.descriptionOne', value)} />
              <TextAreaInput label="Descripcion secundaria" value={draft.eventsCopy.descriptionTwo} onChange={(value) => updateField('eventsCopy.descriptionTwo', value)} />
              <div className="md:col-span-2">
                <TextInput label="URL imagen" value={draft.eventsCopy.image} onChange={(value) => updateField('eventsCopy.image', value)} />
                <button type="button" onClick={() => void openLibrary('eventsCopy.image', 'Bloque de eventos')} className="mt-2 inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#2D2D2D] px-2 text-[11px] text-white">
                  <ImagePlus className="h-3.5 w-3.5" />
                  Biblioteca
                </button>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-4">
            <h4 className="mb-3 text-sm font-semibold text-white">Featured speakers group</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <TextInput label="URL imagen de grupo" value={draft.featuredSpeakersGroup.image} onChange={(value) => updateField('featuredSpeakersGroup.image', value)} />
                <button type="button" onClick={() => void openLibrary('featuredSpeakersGroup.image', 'Imagen grupo')} className="mt-2 inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#2D2D2D] px-2 text-[11px] text-white">
                  <ImagePlus className="h-3.5 w-3.5" />
                  Biblioteca
                </button>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-4">
            <h4 className="mb-3 text-sm font-semibold text-white">Schedule</h4>
            <div className="space-y-2">
              {draft.scheduleItems.map((slot, index) => (
                <div key={`schedule-${index}`} className="rounded-lg border border-[#2D2D2D] bg-[#0B0B0B] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#CFCFCF]">Slot {index + 1}</p>
                    <label className="inline-flex items-center gap-1 text-[11px] text-[#BFBFBF]">
                      <input
                        type="checkbox"
                        checked={slot.isActive}
                        onChange={(event) => updateField(`scheduleItems.${index}.isActive`, event.target.checked)}
                        className="h-3.5 w-3.5 accent-[#5B68F1]"
                      />
                      Activo
                    </label>
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <TextInput label="Hora" value={slot.time} onChange={(value) => updateField(`scheduleItems.${index}.time`, value)} />
                    <TextInput label="Titulo" value={slot.title} onChange={(value) => updateField(`scheduleItems.${index}.title`, value)} />
                    <div className="md:col-span-3">
                      <TextAreaInput label="Descripcion" value={slot.description} onChange={(value) => updateField(`scheduleItems.${index}.description`, value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-4">
            <h4 className="mb-3 text-sm font-semibold text-white">Sponsors</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-[#2D2D2D] bg-[#0B0B0B] p-3">
                <p className="mb-2 text-xs font-semibold text-[#CFCFCF]">Main sponsors</p>
                <div className="space-y-2">
                  {draft.sponsors.main.map((entry, index) => (
                    <TextInput key={`main-${index}`} label={`Main ${index + 1}`} value={entry} onChange={(value) => updateField(`sponsors.main.${index}`, value)} />
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-[#2D2D2D] bg-[#0B0B0B] p-3">
                <p className="mb-2 text-xs font-semibold text-[#CFCFCF]">Secondary sponsors</p>
                <div className="space-y-2">
                  {draft.sponsors.secondary.map((entry, index) => (
                    <TextInput key={`secondary-${index}`} label={`Secondary ${index + 1}`} value={entry} onChange={(value) => updateField(`sponsors.secondary.${index}`, value)} />
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-4">
            <h4 className="mb-3 text-sm font-semibold text-white">Ubicacion</h4>
            <div className="space-y-2">
              {draft.locationCards.map((card, index) => (
                <div key={`loc-${index}`} className="rounded-lg border border-[#2D2D2D] bg-[#0B0B0B] p-3">
                  <p className="mb-2 text-xs font-semibold text-[#CFCFCF]">Card {index + 1}</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    <TextInput label="Label" value={card.label} onChange={(value) => updateField(`locationCards.${index}.label`, value)} />
                    <TextInput label="Titulo" value={card.title} onChange={(value) => updateField(`locationCards.${index}.title`, value)} />
                    <div className="md:col-span-2">
                      <TextAreaInput label="Descripcion" value={card.description} onChange={(value) => updateField(`locationCards.${index}.description`, value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <TextInput label="URL imagen mapa" value={draft.locationMapImage} onChange={(value) => updateField('locationMapImage', value)} />
              <TextInput label="URL link mapa" value={draft.locationMapUrl} onChange={(value) => updateField('locationMapUrl', value)} />
            </div>
            <button type="button" onClick={() => void openLibrary('locationMapImage', 'Imagen de mapa')} className="mt-2 inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#2D2D2D] px-2 text-[11px] text-white">
              <ImagePlus className="h-3.5 w-3.5" />
              Biblioteca
            </button>
          </article>
        </div>
      </section>

      {isLibraryOpen ? (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-5xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className={`${headingClassName} text-[20px] font-semibold text-white`}>Biblioteca de imagenes</h4>
                <p className="text-xs text-[#9C9C9C]">Seleccionando para: {activeImageTarget?.label ?? 'Campo actual'}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 py-2 text-xs font-semibold text-white">
                  <Upload className="h-4 w-4" />
                  {uploadingAsset ? 'Subiendo...' : 'Subir asset'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) => void onUploadAsset(event)}
                    className="hidden"
                    disabled={uploadingAsset}
                  />
                </label>
                <button type="button" onClick={() => setIsLibraryOpen(false)} className="inline-flex rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 py-2 text-xs font-semibold text-white">
                  Cerrar
                </button>
              </div>
            </div>

            {assetsLoading ? <p className="text-sm text-[#9C9C9C]">Cargando assets...</p> : null}
            {!assetsLoading && assets.length === 0 ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#101010] px-4 py-3 text-sm text-[#9C9C9C]">
                No hay assets todavia. Sube una imagen para comenzar.
              </p>
            ) : null}

            {!assetsLoading && assets.length > 0 ? (
              <div className="max-h-[60vh] overflow-y-auto pr-1">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {assets.map((asset) => (
                    <article key={asset.id} className="rounded-xl border border-[#2D2D2D] bg-[#101010] p-3">
                      <div className="mb-2 h-36 overflow-hidden rounded-lg border border-[#2D2D2D] bg-[#0B0B0B]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset.url} alt={asset.originalFilename} className="h-full w-full object-cover" />
                      </div>
                      <p className="truncate text-xs font-semibold text-white">{asset.originalFilename}</p>
                      <p className="mt-1 truncate text-[11px] text-[#9C9C9C]">{asset.url}</p>
                      <p className="mt-1 text-[11px] text-[#9C9C9C]">
                        {asset.mimetype} - {formatBytes(asset.sizeBytes)}
                      </p>
                      <button type="button" onClick={() => selectAsset(asset.url)} className="mt-3 inline-flex h-8 items-center justify-center rounded-lg border border-[#2D2D2D] bg-[#121212] px-3 text-xs font-semibold text-white">
                        Usar esta imagen
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
