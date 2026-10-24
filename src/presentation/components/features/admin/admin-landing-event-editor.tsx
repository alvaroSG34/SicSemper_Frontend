"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, CircleHelp, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { LandingAsset, LandingEvent, LandingEventDraftInput } from "@/domain/landing/landing.types";
import { adminLandingService } from "@/application/admin/services/admin-landing.service";
import { LandingEventDetailView } from "@/presentation/components/features/landing/landing-event-detail-view";
import { LandingAssetPicker } from "./landing-asset-picker";

type Props = { eventId?: string };
type Draft = LandingEventDraftInput;
type Feedback = { type: "error" | "success"; text: string } | null;

const emptyDraft = (): Draft => ({ label: "EVENTO PASADO", title: "", summary: "", startDate: null, endDate: null, place: "", format: "", coverImageUrl: "", storyTitle: "", storyParagraphs: [], highlights: [], gallery: [] });
const toDateInput = (value: string | null | undefined) => value ? value.slice(0, 10) : "";
const fromEvent = (event: LandingEvent): Draft => ({ label: event.label, title: event.title, summary: event.summary, startDate: toDateInput(event.startDate), endDate: toDateInput(event.endDate), place: event.place, format: event.format, coverImageUrl: event.coverImageUrl, storyTitle: event.storyTitle, storyParagraphs: [...event.storyParagraphs], highlights: event.highlights.map(({ name, role, imageUrl }) => ({ name, role, imageUrl })), gallery: event.gallery.map(({ imageUrl, altText, caption }) => ({ imageUrl, altText, caption })) });

const steps = ["Datos básicos", "Historia", "Destacados", "Galería", "Vista previa"];

export function AdminLandingEventEditor({ eventId }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [assets, setAssets] = useState<LandingAsset[]>([]);
  const [currentId, setCurrentId] = useState(eventId);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([adminLandingService.listLandingAssets(), eventId ? adminLandingService.listLandingEvents() : Promise.resolve([])])
      .then(([nextAssets, landingEvents]) => {
        if (cancelled) return;
        setAssets(nextAssets);
        const event = landingEvents.find((item) => item.id === eventId);
        if (event) { setDraft(fromEvent(event)); }
      })
      .catch((error) => { if (!cancelled) setFeedback({ type: "error", text: error instanceof Error ? error.message : "No se pudo cargar el editor." }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [eventId]);

  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => { setDraft((current) => ({ ...current, [key]: value })); setDirty(true); setFeedback(null); };
  const uploadAsset = async (file: File) => { const uploaded = await adminLandingService.uploadLandingAsset(file); setAssets((current) => [uploaded, ...current]); return uploaded.url; };
  const validateStep = () => {
    if (step === 0 && (!draft.title.trim() || !draft.summary.trim())) { setFeedback({ type: "error", text: "Completa el título y el resumen para continuar." }); return false; }
    if (step === 0 && draft.startDate && draft.endDate && draft.endDate < draft.startDate) { setFeedback({ type: "error", text: "La fecha final no puede ser anterior a la inicial." }); return false; }
    if (step === 3 && draft.gallery.some((photo) => !photo.imageUrl)) { setFeedback({ type: "error", text: "Cada foto de la galería necesita una imagen." }); return false; }
    return true;
  };
  const saveDraft = async () => {
    if (!validateStep() || !draft.title.trim() || !draft.summary.trim()) { setStep(0); return; }
    setSaving(true); setFeedback(null);
    try {
      const saved = currentId ? await adminLandingService.updateLandingEvent(currentId, draft) : await adminLandingService.createLandingEvent(draft);
      setCurrentId(saved.id); setDraft(fromEvent(saved)); setDirty(false); setFeedback({ type: "success", text: "Borrador guardado correctamente." });
    } catch (error) { setFeedback({ type: "error", text: error instanceof Error ? error.message : "No se pudo guardar el borrador." }); }
    finally { setSaving(false); }
  };
  const goBack = () => { if (!dirty || window.confirm("Tienes cambios sin guardar. ?Salir de todas formas?")) router.push("/admin/landing"); };
  const move = (collection: "storyParagraphs" | "highlights" | "gallery", index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draft[collection].length) return;
    const next = [...draft[collection]] as typeof draft[typeof collection];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    update(collection, next);
  };
  const previewEvent: LandingEvent = { id: currentId ?? "preview", ...draft, startDate: draft.startDate ?? null, endDate: draft.endDate ?? null, place: draft.place ?? null, format: draft.format ?? null, coverImageUrl: draft.coverImageUrl ?? null, storyTitle: draft.storyTitle ?? null, visible: false, highlights: draft.highlights.map((item, index) => ({ id: `preview-h-${index}`, ...item, imageUrl: item.imageUrl ?? null, position: index })), gallery: draft.gallery.map((item, index) => ({ id: `preview-g-${index}`, ...item, caption: item.caption ?? null, position: index })), createdAt: "", updatedAt: "" };

  if (loading) return <main className="min-h-screen bg-[#0B0B0B] p-6 text-white">Cargando editor...</main>;

  return <main className="min-h-screen bg-[#0B0B0B] px-4 py-6 text-white sm:px-8"><div className="mx-auto max-w-6xl"><button type="button" onClick={goBack} className="mb-6 inline-flex items-center gap-2 text-sm text-[#A3A3A3] hover:text-white"><ArrowLeft className="h-4 w-4" /> Volver a eventos historicos</button><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Editor de memoria</p><h1 className="mt-2 text-3xl font-bold">{currentId ? "Editar evento historico" : "Crear evento historico"}</h1><p className="mt-2 text-sm text-[#9C9C9C]">La ficha permanecera oculta hasta activarla.</p></div><div className="ml-auto flex gap-2"><button type="button" onClick={() => void saveDraft()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-black"><Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar borrador"}</button></div></div>{feedback && <p className={`mb-5 rounded-lg border px-3 py-2 text-xs ${feedback.type === "error" ? "border-red-900 bg-red-950/30 text-red-200" : "border-green-900 bg-green-950/30 text-green-200"}`}>{feedback.text}</p>}<nav className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">{steps.map((label, index) => <button key={label} type="button" onClick={() => index <= step || validateStep() ? setStep(index) : null} className={`rounded-lg border px-3 py-3 text-left text-xs font-semibold ${step === index ? "border-cyan-300 bg-cyan-300/10 text-cyan-200" : "border-[#2D2D2D] text-[#9C9C9C]"}`}><span className="mr-2">{index + 1}</span>{label}</button>)}</nav><section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-8">{step === 0 && <BasicStep draft={draft} assets={assets} update={update} uploadAsset={uploadAsset} />}{step === 1 && <StoryStep draft={draft} update={update} move={move} />}{step === 2 && <HighlightsStep draft={draft} update={update} move={move} assets={assets} uploadAsset={uploadAsset} />}{step === 3 && <GalleryStep draft={draft} update={update} move={move} uploadAsset={uploadAsset} />}{step === 4 && <div className="overflow-hidden rounded-2xl bg-black"><LandingEventDetailView event={previewEvent} preview /></div>}<div className="mt-8 flex justify-between border-t border-[#2D2D2D] pt-5"><button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="rounded-lg border border-[#2D2D2D] px-4 py-2 text-sm text-white disabled:opacity-40">Atras</button>{step < 4 ? <button type="button" onClick={() => { if (validateStep()) setStep((current) => Math.min(4, current + 1)); }} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-black">Siguiente <ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={() => void saveDraft()} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-black"><Check className="h-4 w-4" /> Guardar borrador</button>}</div></section></div></main>;
}

export function BasicStep({ draft, update, assets, uploadAsset }: { draft: Draft; update: <K extends keyof Draft>(key: K, value: Draft[K]) => void; assets: LandingAsset[]; uploadAsset: (file: File) => Promise<string> }) {
  return <div className="space-y-5"><div><h2 className="text-xl font-bold">Datos básicos</h2><p className="mt-1 text-sm text-[#9C9C9C]">Información principal que aparecera en la tarjeta y el detalle.</p></div><div className="grid gap-4 md:grid-cols-2"><Field label="Etiqueta"><input value={draft.label} onChange={(event) => update("label", event.target.value)} className="input" /></Field><Field label="Título *"><input value={draft.title} onChange={(event) => update("title", event.target.value)} className="input" /></Field><Field label="Fecha inicial"><input type="date" value={draft.startDate ?? ""} onChange={(event) => update("startDate", event.target.value || null)} className="input" /></Field><Field label="Fecha final"><input type="date" value={draft.endDate ?? ""} onChange={(event) => update("endDate", event.target.value || null)} className="input" /></Field><Field label="Lugar"><input value={draft.place ?? ""} onChange={(event) => update("place", event.target.value)} className="input" /></Field><Field label="Formato"><input value={draft.format ?? ""} onChange={(event) => update("format", event.target.value)} placeholder="Presencial - Acceso libre" className="input" /></Field></div><Field label="Resumen *"><textarea value={draft.summary} onChange={(event) => update("summary", event.target.value)} className="input min-h-32" /></Field><Field label="Portada (opcional)" help="Imagen de portada que representará el evento en la tarjeta y en la landing."><div className="grid gap-4 md:grid-cols-2"><div data-testid="cover-preview" className="flex h-56 items-center justify-center overflow-hidden rounded-xl border border-[#2D2D2D] bg-[#0B0B0B] p-3">{draft.coverImageUrl ? <img src={draft.coverImageUrl} alt="Vista previa de portada" className="h-full w-full object-contain" /> : <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#737373]">Sin portada</span>}</div><LandingAssetPicker value={draft.coverImageUrl ?? ""} assets={assets} showLibrary={false} showPreview={false} dropzone label="Subir imagen" onChange={(value) => update("coverImageUrl", value)} onUpload={uploadAsset} /></div></Field></div>;
}

function StoryStep({ draft, update, move }: { draft: Draft; update: <K extends keyof Draft>(key: K, value: Draft[K]) => void; move: (collection: "storyParagraphs" | "highlights" | "gallery", index: number, direction: -1 | 1) => void }) { const add = () => update("storyParagraphs", [...draft.storyParagraphs, ""]); return <div className="space-y-5"><div><h2 className="text-xl font-bold">Historia del encuentro</h2><p className="mt-1 text-sm text-[#9C9C9C]">Cuenta que ocurrió y por que este evento fue importante.</p></div><Field label="Título narrativo"><input value={draft.storyTitle ?? ""} onChange={(event) => update("storyTitle", event.target.value)} className="input" /></Field><div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-semibold">Párrafos</label><button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-[#2D2D2D] px-3 py-2 text-xs text-white"><Plus className="h-4 w-4" /> Agregar párrafo</button></div>{draft.storyParagraphs.map((paragraph, index) => <div key={`paragraph-${index}`} className="flex gap-2"><textarea value={paragraph} onChange={(event) => update("storyParagraphs", draft.storyParagraphs.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="input min-h-28 flex-1" placeholder="Escribe un párrafo..." /><div className="flex flex-col gap-1"><button type="button" onClick={() => move("storyParagraphs", index, -1)} className="rounded border border-[#2D2D2D] px-2 py-1 text-xs"><ArrowUp className="h-4 w-4" aria-label="Mover arriba" /></button><button type="button" onClick={() => move("storyParagraphs", index, 1)} className="rounded border border-[#2D2D2D] px-2 py-1 text-xs"><ArrowDown className="h-4 w-4" aria-label="Mover abajo" /></button><button type="button" onClick={() => update("storyParagraphs", draft.storyParagraphs.filter((_, itemIndex) => itemIndex !== index))} className="rounded border border-red-900 px-2 py-1 text-xs text-red-300"><Trash2 className="h-3 w-3" /></button></div></div>)}</div></div>; }

export function HighlightsStep({ draft, update, move, assets, uploadAsset }: { draft: Draft; update: <K extends keyof Draft>(key: K, value: Draft[K]) => void; move: (collection: "storyParagraphs" | "highlights" | "gallery", index: number, direction: -1 | 1) => void; assets: LandingAsset[]; uploadAsset: (file: File) => Promise<string> }) {
  const add = () => update("highlights", [...draft.highlights, { name: "", role: "", imageUrl: "" }]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Personas destacadas</h2>
        <p className="mt-1 text-sm text-[#9C9C9C]">Agrega las personas o proyectos que hicieron especial el encuentro.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {draft.highlights.map((item, index) => (
          <article key={`highlight-${index}`} className="flex min-h-[460px] flex-col rounded-2xl border border-[#2D2D2D] bg-[#101010] p-4">
            <LandingAssetPicker
              value={item.imageUrl ?? ""}
              assets={assets}
              showLibrary={false}
              label="Imagen"
              previewClassName="h-48"
              emptyStateLabel="Sin imagen"
              onChange={(value) => update("highlights", draft.highlights.map((current, currentIndex) => currentIndex === index ? { ...current, imageUrl: value } : current))}
              onUpload={uploadAsset}
            />
            <div className="mt-4 space-y-3">
              <label className="block space-y-2"><span className="text-xs font-semibold text-white">Nombre</span><input value={item.name} onChange={(event) => update("highlights", draft.highlights.map((current, currentIndex) => currentIndex === index ? { ...current, name: event.target.value } : current))} placeholder="Nombre de la persona" className="input" /></label>
              <label className="block space-y-2"><span className="text-xs font-semibold text-white">Rol o reconocimiento</span><input value={item.role} onChange={(event) => update("highlights", draft.highlights.map((current, currentIndex) => currentIndex === index ? { ...current, role: event.target.value } : current))} placeholder="Rol o reconocimiento" className="input" /></label>
            </div>
            <div className="mt-auto flex justify-end gap-1 border-t border-[#2D2D2D] pt-4">
              <button type="button" onClick={() => move("highlights", index, -1)} aria-label="Mover arriba" className="h-9 rounded border border-[#2D2D2D] px-2 text-white"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move("highlights", index, 1)} aria-label="Mover abajo" className="h-9 rounded border border-[#2D2D2D] px-2 text-white"><ArrowDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => update("highlights", draft.highlights.filter((_, itemIndex) => itemIndex !== index))} aria-label="Eliminar persona destacada" className="h-9 rounded border border-red-900 px-2 text-red-300"><Trash2 className="h-4 w-4" /></button>
            </div>
          </article>
        ))}
        <button type="button" onClick={add} className="flex min-h-[460px] items-center justify-center gap-2 rounded-2xl border border-cyan-400 bg-cyan-400 p-4 text-sm font-bold text-black transition hover:bg-cyan-300"><Plus className="h-5 w-5" /> Agregar persona destacada</button>
      </div>
    </div>
  );
}
export function GalleryStep({ draft, update, move, uploadAsset }: { draft: Draft; update: <K extends keyof Draft>(key: K, value: Draft[K]) => void; move: (collection: "storyParagraphs" | "highlights" | "gallery", index: number, direction: -1 | 1) => void; uploadAsset: (file: File) => Promise<string> }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const getAltText = (file: File) => file.name.replace(/\.[^/.]+$/, "").trim() || "Imagen del evento";
  const setInputRef = (id: string) => (input: HTMLInputElement | null) => { inputRefs.current[id] = input; };
  const openPicker = (id: string) => inputRefs.current[id]?.click();
  const handleFile = async (file: File | undefined, index?: number) => {
    if (!file || uploading) return;
    const key = index === undefined ? "new" : `change-${index}`;
    setUploading(key);
    setUploadError(null);
    try {
      const imageUrl = await uploadAsset(file);
      if (index === undefined) {
        update("gallery", [...draft.gallery, { imageUrl, altText: getAltText(file), caption: "" }]);
      } else {
        update("gallery", draft.gallery.map((current, currentIndex) => currentIndex === index ? { ...current, imageUrl, altText: getAltText(file) } : current));
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(null);
    }
  };
  const onFileChange = (event: ChangeEvent<HTMLInputElement>, index?: number) => {
    void handleFile(event.target.files?.[0], index);
    event.target.value = "";
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Galería de fotos</h2>
        <p className="mt-1 text-sm text-[#9C9C9C]">Agrega y ordena las imágenes que aparecerán en el detalle del evento.</p>
        {uploadError ? <p className="mt-2 text-xs text-red-300">{uploadError}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {draft.gallery.map((item, index) => {
          const inputId = `gallery-change-${index}`;
          const isUploading = uploading === `change-${index}`;
          return (
            <article key={`gallery-${index}`} className="flex min-h-[460px] flex-col rounded-2xl border border-[#2D2D2D] bg-[#101010] p-4">
              <div className="relative h-48 overflow-hidden rounded-lg border border-[#2D2D2D] bg-[#0B0B0B]">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.altText || "Imagen del evento"} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#737373]">Sin imagen</span>}
              </div>
              <button type="button" onClick={() => openPicker(inputId)} disabled={Boolean(uploading)} className="mt-3 inline-flex w-fit items-center gap-2 rounded-lg border border-[#2D2D2D] px-3 py-2 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60">{isUploading ? "Subiendo..." : "Cambiar imagen"}</button>
              <input id={inputId} ref={setInputRef(inputId)} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => onFileChange(event, index)} />
              <div className="mt-auto flex justify-end gap-1 border-t border-[#2D2D2D] pt-4">
                <button type="button" onClick={() => move("gallery", index, -1)} aria-label="Mover arriba" className="h-9 rounded border border-[#2D2D2D] px-2 text-white"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move("gallery", index, 1)} aria-label="Mover abajo" className="h-9 rounded border border-[#2D2D2D] px-2 text-white"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => update("gallery", draft.gallery.filter((_, itemIndex) => itemIndex !== index))} aria-label="Eliminar foto" className="h-9 rounded border border-red-900 px-2 text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            </article>
          );
        })}
        <div className="relative min-h-[460px]">
          <button type="button" onClick={() => openPicker("gallery-add")} disabled={Boolean(uploading)} className="flex h-full min-h-[460px] w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400 bg-cyan-400 p-4 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-70"><Plus className="h-5 w-5" /> {uploading === "new" ? "Subiendo..." : "Agregar foto"}</button>
          <input id="gallery-add" ref={setInputRef("gallery-add")} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => onFileChange(event)} />
        </div>
      </div>
    </div>
  );
}

const fieldHelp: Record<string, string> = {
  "Etiqueta": "Texto corto que clasifica la memoria, por ejemplo: EVENTO PASADO.",
  "Título *": "Nombre oficial del evento que aparecerá en la tarjeta y en el detalle.",
  "Fecha inicial": "Día en que comenzó el evento.",
  "Fecha final": "Día en que terminó el evento.",
  "Lugar": "Sede, ciudad o ubicación donde se realizó el evento.",
  "Formato": "Modalidad o tipo de acceso, por ejemplo: Presencial - Acceso libre.",
  "Resumen *": "Descripción breve que resume el evento y se mostrará en su tarjeta.",
  "Título narrativo": "Título de la historia o memoria que quieres contar sobre el evento.",
};

function HelpHint({ text }: { text: string }) {
  return <span className="group relative inline-flex"><button type="button" aria-label="Mostrar ayuda" className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#9C9C9C] hover:text-cyan-300 focus:text-cyan-300 focus:outline-none"><CircleHelp className="h-3.5 w-3.5" /></button><span role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-64 rounded-lg border border-[#3A3A3A] bg-[#111111] px-3 py-2 text-[11px] font-normal leading-4 text-[#D4D4D4] shadow-xl group-hover:block group-focus-within:block">{text}</span></span>;
}

function Field({ label, children, help }: { label: string; children: ReactNode; help?: string }) { const helpText = help ?? fieldHelp[label]; return <label className="block space-y-2"><span className="inline-flex items-center gap-1 text-xs font-semibold text-white">{label}{helpText ? <HelpHint text={helpText} /> : null}</span>{children}</label>; }

