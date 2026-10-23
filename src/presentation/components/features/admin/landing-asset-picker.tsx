/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { LandingAsset } from "@/domain/landing/landing.types";

type Props = {
  value: string;
  assets: LandingAsset[];
  label: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
};

export function LandingAssetPicker({ value, assets, label, onChange, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try { onChange(await onUpload(file)); } finally { setUploading(false); }
  };
  return <div className="space-y-2"><div className="flex items-center justify-between gap-2"><label className="text-xs font-semibold text-white">{label}</label><label className="cursor-pointer rounded-md border border-[#2D2D2D] px-2 py-1 text-[11px] text-white">{uploading ? "Subiendo..." : "Subir imagen"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" disabled={uploading} onChange={(event) => void upload(event.target.files?.[0]).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudo subir la imagen."))} /></label></div><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"><option value="">Seleccionar de la biblioteca</option>{assets.map((asset) => <option key={asset.id} value={asset.url}>{asset.originalFilename}</option>)}</select>{error && <p className="text-xs text-red-300">{error}</p>}{value && <div className="h-32 overflow-hidden rounded-lg border border-[#2D2D2D] bg-[#0B0B0B]"><img src={value} alt="Vista previa" className="h-full w-full object-cover" /></div>}</div>;
}
