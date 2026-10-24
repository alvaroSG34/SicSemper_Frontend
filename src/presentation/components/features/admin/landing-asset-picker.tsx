/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { CircleHelp } from "lucide-react";
import type { LandingAsset } from "@/domain/landing/landing.types";

type Props = {
  value: string;
  assets: LandingAsset[];
  label: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
  showLibrary?: boolean;
  dropzone?: boolean;
  help?: string;
  previewClassName?: string;
  emptyStateLabel?: string;
  showPreview?: boolean;
};

export function LandingAssetPicker({ value, assets, label, onChange, onUpload, showLibrary = true, dropzone = false, help, previewClassName = "h-32", emptyStateLabel, showPreview = true }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try { onChange(await onUpload(file)); } finally { setUploading(false); }
  };
  const uploadInput = <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" disabled={uploading} onChange={(event) => void upload(event.target.files?.[0]).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudo subir la imagen."))} />;
  return <div className="space-y-2"><div className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-1 text-xs font-semibold text-white">{label}{help ? <span className="group relative inline-flex"><button type="button" aria-label="Mostrar ayuda" className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#9C9C9C] hover:text-cyan-300 focus:text-cyan-300 focus:outline-none"><CircleHelp className="h-3.5 w-3.5" /></button><span role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-64 rounded-lg border border-[#3A3A3A] bg-[#111111] px-3 py-2 text-[11px] font-normal leading-4 text-[#D4D4D4] shadow-xl group-hover:block group-focus-within:block">{help}</span></span> : null}</span>{!dropzone ? <label className="cursor-pointer rounded-md border border-[#2D2D2D] px-2 py-1 text-[11px] text-white">{uploading ? "Subiendo..." : "Subir imagen"}{uploadInput}</label> : null}</div>{dropzone ? <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void upload(event.dataTransfer.files?.[0]).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudo subir la imagen.")); }} className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition-colors ${uploading ? "cursor-wait border-cyan-300/50 bg-cyan-300/5" : "border-[#3A3A3A] bg-[#0B0B0B] hover:border-cyan-300 hover:bg-cyan-300/5"}`}><span className="text-sm font-semibold text-white">{uploading ? "Subiendo imagen..." : "Arrastra una imagen aquí"}</span><span className="mt-1 text-xs text-[#9C9C9C]">o haz clic para seleccionar una foto</span>{uploadInput}</label> : null}{showLibrary ? <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"><option value="">Seleccionar de la biblioteca</option>{assets.map((asset) => <option key={asset.id} value={asset.url}>{asset.originalFilename}</option>)}</select> : null}{error && <p className="text-xs text-red-300">{error}</p>}{showPreview && (value ? <div className={`${previewClassName} overflow-hidden rounded-lg border border-[#2D2D2D] bg-[#0B0B0B]`}><img src={value} alt="Vista previa" className="h-full w-full object-cover" /></div> : emptyStateLabel ? <div className={`${previewClassName} flex items-center justify-center rounded-lg border border-dashed border-[#3A3A3A] bg-[#0B0B0B] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#737373]`}>{emptyStateLabel}</div> : null)}</div>;
}
