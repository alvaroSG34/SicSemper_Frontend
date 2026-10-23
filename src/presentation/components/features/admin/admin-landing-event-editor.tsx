"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CatalogEvent } from "@/domain/admin/admin.types";
import type { LandingAsset, LandingEvent, LandingEventDraftInput } from "@/domain/landing/landing.types";
import { adminDashboardService } from "@/application/admin/services/admin-dashboard.service";
import { adminLandingService } from "@/application/admin/services/admin-landing.service";
import { LandingEventDetailView } from "@/presentation/components/features/landing/landing-event-detail-view";
import { LandingAssetPicker } from "./landing-asset-picker";

type Props = { eventId?: string };
type Draft = LandingEventDraftInput;
type Feedback = { type: "error" | "success"; text: string } | null;

const emptyDraft = (): Draft => ({ label: "EVENTO PASADO", title: "", summary: "", startDate: null, endDate: null, place: "", format: "", coverImageUrl: "", storyTitle: "", storyParagraphs: [], highlights: [], gallery: [] });
const toDateInput = (value: string | null | undefined) => value ? value.slice(0, 10) : "";
const fromEvent = (event: LandingEvent): Draft => ({ label: event.label, title: event.title, summary: event.summary, startDate: toDateInput(event.startDate), endDate: toDateInput(event.endDate), place: event.place, format: event.format, coverImageUrl: event.coverImageUrl, storyTitle: event.storyTitle, storyParagraphs: [...event.storyParagraphs], highlights: event.highlights.map(({ name, role, imageUrl }) => ({ name, role, imageUrl })), gallery: event.gallery.map(({ imageUrl, altText, caption }) => ({ imageUrl, altText, caption })) });

const steps = ["Datos basicos", "Historia", "Destacados", "Galeria", "Vista previa"];

export function AdminLandingEventEditor({ eventId }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [assets, setAssets] = useState<LandingAsset[]>([]);
  const [catalogEvents, setCatalogEvents] = useState<CatalogEvent[]>([]);
  const [currentId, setCurrentId] = useState(eventId);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([adminLandingService.listLandingAssets(), adminDashboardService.listCatalog(), eventId ? adminLandingService.listLandingEvents() : Promise.resolve([])])
      .then(([nextAssets, catalog, landingEvents]) => {
        if (cancelled) return;
        setAssets(nextAssets); setCatalogEvents(catalog.events);
        const event = landingEvents.find((item) => item.id === eventId);
        if (event) { setDraft(fromEvent(event)); setVisible(event.visible); }
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

  const eligibleEvents = useMemo(() => catalogEvents.filter((event) => event.status === "FINALIZADO" || Boolean(event.endDate && new Date(event.endDate).getTime() < Date.now())), [catalogEvents]);
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => { setDraft((current) => ({ ...current, [key]: value })); setDirty(true); setFeedback(null); };
  const uploadAsset = async (file: File) => { const uploaded = await adminLandingService.uploadLandingAsset(file); setAssets((current) => [uploaded, ...current]); return uploaded.url; };
  const validateStep = () => {
    if (step === 0 && (!draft.title.trim() || !draft.summary.trim())) { setFeedback({ type: "error", text: "Completa el título y el resumen para continuar." }); return false; }
    if (step === 0 && draft.startDate && draft.endDate && draft.endDate < draft.startDate) { setFeedback({ type: "error", text: "La fecha final no puede ser anterior a la inicial." }); return false; }
    if (step === 3 && draft.gallery.some((photo) => !photo.imageUrl || !photo.altText.trim())) { setFeedback({ type: "error", text: "Cada foto de la galería necesita imagen y texto alternativo." }); return false; }
    return true;
  };
  const saveDraft = async () => {
    if (!validateStep() || !draft.title.trim() || !draft.summary.trim()) { setStep(0); return; }
    setSaving(true); setFeedback(null);
    try {
      const saved = currentId ? await adminLandingService.updateLandingEvent(currentId, draft) : await adminLandingService.createLandingEvent(draft);
      setCurrentId(saved.id); setDraft(fromEvent(saved)); setVisible(saved.visible); setDirty(false); setFeedback({ type: "success", text: "Borrador guardado correctamente." });
    } catch (error) { setFeedback({ type: "error", text: error instanceof Error ? error.message : "No se pudo guardar el borrador." }); }
    finally { setSaving(false); }
  };
  const toggleVisibility = async () => {
    if (!currentId) { setFeedback({ type: "error", text: "Guarda el borrador antes de activarlo." }); return; }
    if (!visible && !draft.coverImageUrl) { setFeedback({ type: "error", text: "Agrega una portada antes de activar el evento." }); return; }
    setSaving(true);
    try { const updated = await adminLandingService.setLandingEventVisibility(currentId, !visible); setVisible(updated.visible); setFeedback({ type: "success", text: updated.visible ? "Evento activado en la landing." : "Evento ocultado de la landing." }); }
    catch (error) { setFeedback({ type: "error", text: error instanceof Error ? error.message : "No se pudo cambiar la visibilidad." }); }
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
  const previewEvent: LandingEvent = { id: currentId ?? "preview", sourceEventId: null, ...draft, startDate: draft.startDate ?? null, endDate: draft.endDate ?? null, place: draft.place ?? null, format: draft.format ?? null, coverImageUrl: draft.coverImageUrl ?? null, storyTitle: draft.storyTitle ?? null, visible: false, highlights: draft.highlights.map((item, index) => ({ id: `preview-h-${index}`, ...item, imageUrl: item.imageUrl ?? null, position: index })), gallery: draft.gallery.map((item, index) => ({ id: `preview-g-${index}`, ...item, caption: item.caption ?? null, position: index })), createdAt: "", updatedAt: "" };

  if (loading) return <main className="min-h-screen bg-[#0B0B0B] p-6 text-white">Cargando editor...</main>;

  return <main className="min-h-screen bg-[#0B0B0B] px-4 py-6 text-white sm:px-8"><div className="mx-auto max-w-6xl"><button type="button" onClick={goBack} className="mb-6 inline-flex items-center gap-2 text-sm text-[#A3A3A3] hover:text-white"><ArrowLeft className="h-4 w-4" /> Volver a eventos historicos</button><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Editor de memoria</p><h1 className="mt-2 text-3xl font-bold">{currentId ? "Editar evento historico" : "Crear evento historico"}</h1><p className="mt-2 text-sm text-[#9C9C9C]">La ficha permanecera oculta hasta activarla.</p></div><div className="flex gap-2"><button type="button" onClick={() => setStep(4)} className="inline-flex items-center gap-2 rounded-lg border border-[#2D2D2D] px-3 py-2 text-xs font-semibold text-white"><Eye className="h-4 w-4" /> Vista previa</button><button type="button" onClick={() => void toggleVisibility()} disabled={saving || !currentId} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${visible ? "border-amber-800 text-amber-200" : "border-green-800 text-green-200"}`}>{visible ? "Ocultar" : "Activar"}</button><button type="button" onClick={() => void saveDraft()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-black"><Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar borrador"}</button></div></div>{feedback && <p className={`mb-5 rounded-lg border px-4 py-3 text-sm ${feedback.type === "error" ? "border-red-900 bg-red-950/30 text-red-200" : "border-green-900 bg-green-950/30 text-green-200"}`}>{feedback.text}</p>}<nav className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">{steps.map((label, index) => <button key={label} type="button" onClick={() => index <= step || validateStep() ? setStep(index) : null} className={`rounded-lg border px-3 py-3 text-left text-xs font-semibold ${step === index ? "border-cyan-300 bg-cyan-300/10 text-cyan-200" : "border-[#2D2D2D] text-[#9C9C9C]"}`}><span className="mr-2">{index + 1}</span>{label}</button>)}</nav><section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-8">{step === 0 && <BasicStep draft={draft} assets={assets} update={update} uploadAsset={uploadAsset} eligibleEvents={eligibleEvents} />}{step === 1 && <StoryStep draft={draft} update={update} move={move} />}{step === 2 && <HighlightsStep draft={draft} update={update} move={move} assets={assets} uploadAsset={uploadAsset} />}{step === 3 && <GalleryStep draft={draft} update={update} move={move} assets={assets} uploadAsset={uploadAsset} />}{step === 4 && <div className="overflow-hidden rounded-2xl bg-white"><LandingEventDetailView event={previewEvent} preview /></div>}<div className="mt-8 flex justify-between border-t border-[#2D2D2D] pt-5"><button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="rounded-lg border border-[#2D2D2D] px-4 py-2 text-sm text-white disabled:opacity-40">Atras</button>{step < 4 ? <button type="button" onClick={() => { if (validateStep()) setStep((current) => Math.min(4, current + 1)); }} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-black">Siguiente <ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={() => void saveDraft()} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-black"><Check className="h-4 w-4" /> Guardar borrador</button>}</div></section></div></main>;
}

function BasicStep({ draft, update, assets, uploadAsset, eligibleEvents }: { draft: Draft; update: <K extends keyof Draft>(key: K, value: Draft[K]) => void; assets: LandingAsset[]; uploadAsset: (file: File) => Promise<string>; eligibleEvents: CatalogEvent[] }) { return <div className="space-y-5"><div><h2 className="text-xl font-bold">Datos basicos</h2><p className="mt-1 text-sm text-[#9C9C9C]">Informacion principal que aparecera en la tarjeta y el detalle.</p></div><div className="grid gap-4 md:grid-cols-2"><Field label="Etiqueta"><input value={draft.label} onChange={(event) => update("label", event.target.value)} className="input" /></Field><Field label="Titulo *"><input value={draft.title} onChange={(event) => update("title", event.target.value)} className="input" /></Field><Field label="Fecha inicial"><input type="date" value={draft.startDate ?? ""} onChange={(event) => update("startDate", event.target.value || null)} className="input" /></Field><Field label="Fecha final"><input type="date" value={draft.endDate ?? ""} onChange={(event) => update("endDate", event.target.value || null)} className="input" /></Field><Field label="Lugar"><input value={draft.place ?? ""} onChange={(event) => update("place", event.target.value)} className="input" /></Field><Field label="Formato"><input value={draft.format ?? ""} onChange={(event) => update("format", event.target.value)} placeholder="Presencial - Acceso libre" className="input" /></Field></div><Field label="Resumen *"><textarea value={draft.summary} onChange={(event) => update("summary", event.target.value)} className="input min-h-32" /></Field><LandingAssetPicker value={draft.coverImageUrl ?? ""} assets={assets} label="Portada (opcional)" onChange={(value) => update("coverImageUrl", value)} onUpload={uploadAsset} /><p className="text-xs text-amber-200">Eventos disponibles para importar: {eligibleEvents.length}. La importacion se inicia desde el listado.</p></div>; }

function StoryStep({ draft, update, move }: { draft: Draft; update: <K extends keyof Draft>(key: K, value: Draft[K]) => void; move: (collection: "storyParagraphs" | "highlights" | "gallery", index: number, direction: -1 | 1) => void }) { const add = () => update("storyParagraphs", [...draft.storyParagraphs, ""]); return <div className="space-y-5"><div><h2 className="text-xl font-bold">Historia del encuentro</h2><p className="mt-1 text-sm text-[#9C9C9C]">Cuenta que ocurrio y por que este evento fue importante.</p></div><Field label="Titulo narrativo"><input value={draft.storyTitle ?? ""} onChange={(event) => update("storyTitle", event.target.value)} className="input" /></Field><div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-semibold">Parrafos</label><button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-[#2D2D2D] px-3 py-2 text-xs text-white"><Plus className="h-4 w-4" /> Agregar parrafo</button></div>{draft.storyParagraphs.map((paragraph, index) => <div key={`paragraph-${index}`} className="flex gap-2"><textarea value={paragraph} onChange={(event) => update("storyParagraphs", draft.storyParagraphs.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="input min-h-28 flex-1" placeholder="Escribe un parrafo..." /><div className="flex flex-col gap-1"><button type="button" onClick={() => move("storyParagraphs", index, -1)} className="rounded border border-[#2D2D2D] px-2 py-1 text-xs">� </button><button type="button" onClick={() => move("storyParagraphs", index, 1)} className="rounded border border-[#2D2D2D] px-2 py-1 text-xs">� </button><button type="button" onClick={() => update("storyParagraphs", draft.storyParagraphs.filter((_, itemIndex) => itemIndex !== index))} className="rounded border border-red-900 px-2 py-1 text-xs text-red-300"><Trash2 className="h-3 w-3" /></button></div></div>)}</div></div>; }

function HighlightsStep({ draft, update, move, assets, uploadAsset }: { draft: Draft; update: <K extends keyof Draft>(key: K, value: Draft[K]) => void; move: (collection: "storyParagraphs" | "highlights" | "gallery", index: number, direction: -1 | 1) => void; assets: LandingAsset[]; uploadAsset: (file: File) => Promise<string> }) { const add = () => update("highlights", [...draft.highlights, { name: "", role: "", imageUrl: "" }]); return <div className="space-y-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold">Personas destacadas</h2><p className="mt-1 text-sm text-[#9C9C9C]">Agrega las personas o proyectos que hicieron especial el encuentro.</p></div><button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-black"><Plus className="h-4 w-4" /> Agregar</button></div>{draft.highlights.map((item, index) => <div key={`highlight-${index}`} className="grid gap-4 rounded-2xl border border-[#2D2D2D] bg-[#101010] p-4 md:grid-cols-[1fr_1fr_220px_auto]"><input value={item.name} onChange={(event) => update("highlights", draft.highlights.map((current, currentIndex) => currentIndex === index ? { ...current, name: event.target.value } : current))} placeholder="Nombre" className="input" /><input value={item.role} onChange={(event) => update("highlights", draft.highlights.map((current, currentIndex) => currentIndex === index ? { ...current, role: event.target.value } : current))} placeholder="Rol o reconocimiento" className="input" /><LandingAssetPicker value={item.imageUrl ?? ""} assets={assets} label="Imagen" onChange={(value) => update("highlights", draft.highlights.map((current, currentIndex) => currentIndex === index ? { ...current, imageUrl: value } : current))} onUpload={uploadAsset} /><div className="flex gap-1"><button type="button" onClick={() => move("highlights", index, -1)} className="h-9 rounded border border-[#2D2D2D] px-2">� </button><button type="button" onClick={() => move("highlights", index, 1)} className="h-9 rounded border border-[#2D2D2D] px-2">� </button><button type="button" onClick={() => update("highlights", draft.highlights.filter((_, itemIndex) => itemIndex !== index))} className="h-9 rounded border border-red-900 px-2 text-red-300"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>; }

function GalleryStep({ draft, update, move, assets, uploadAsset }: { draft: Draft; update: <K extends keyof Draft>(key: K, value: Draft[K]) => void; move: (collection: "storyParagraphs" | "highlights" | "gallery", index: number, direction: -1 | 1) => void; assets: LandingAsset[]; uploadAsset: (file: File) => Promise<string> }) { const add = () => update("gallery", [...draft.gallery, { imageUrl: "", altText: "", caption: "" }]); return <div className="space-y-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold">Galeria de fotos</h2><p className="mt-1 text-sm text-[#9C9C9C]">Selecciona imagenes, agrega textos accesibles y ordenalas.</p></div><button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-black"><Plus className="h-4 w-4" /> Agregar foto</button></div>{draft.gallery.map((item, index) => <div key={`gallery-${index}`} className="grid gap-4 rounded-2xl border border-[#2D2D2D] bg-[#101010] p-4 md:grid-cols-[260px_1fr_auto]"><LandingAssetPicker value={item.imageUrl} assets={assets} label={`Foto ${index + 1}`} onChange={(value) => update("gallery", draft.gallery.map((current, currentIndex) => currentIndex === index ? { ...current, imageUrl: value } : current))} onUpload={uploadAsset} /><div className="space-y-3"><input value={item.altText} onChange={(event) => update("gallery", draft.gallery.map((current, currentIndex) => currentIndex === index ? { ...current, altText: event.target.value } : current))} placeholder="Texto alternativo *" className="input" /><input value={item.caption ?? ""} onChange={(event) => update("gallery", draft.gallery.map((current, currentIndex) => currentIndex === index ? { ...current, caption: event.target.value } : current))} placeholder="Descripcion opcional" className="input" /></div><div className="flex gap-1"><button type="button" onClick={() => move("gallery", index, -1)} className="h-9 rounded border border-[#2D2D2D] px-2">� </button><button type="button" onClick={() => move("gallery", index, 1)} className="h-9 rounded border border-[#2D2D2D] px-2">� </button><button type="button" onClick={() => update("gallery", draft.gallery.filter((_, itemIndex) => itemIndex !== index))} className="h-9 rounded border border-red-900 px-2 text-red-300"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>; }

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block space-y-2"><span className="text-xs font-semibold text-white">{label}</span>{children}</label>; }

