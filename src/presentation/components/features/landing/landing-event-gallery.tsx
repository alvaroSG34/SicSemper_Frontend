"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { LandingEventGalleryItem } from "@/domain/landing/landing.types";

type Props = { photos: LandingEventGalleryItem[]; title: string };

export function LandingEventGallery({ photos, title }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeIndex]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <button key={photo.id} type="button" onClick={() => setActiveIndex(index)} className="group overflow-hidden rounded-2xl bg-current/[0.05] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
            <img src={photo.imageUrl} alt={photo.altText} className="aspect-[1.2] h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            {photo.caption && <span className="block p-3 text-sm opacity-60">{photo.caption}</span>}
          </button>
        ))}
      </div>

      {activePhoto && activeIndex !== null ? (
        <div role="dialog" aria-modal="true" aria-label={`Galería de ${title}`} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}>
          <div className="relative flex max-h-full w-full max-w-6xl flex-col items-center gap-4">
            <button type="button" aria-label="Cerrar galería" onClick={() => setActiveIndex(null)} className="absolute right-0 top-0 z-10 rounded-full border border-white/20 bg-black/60 p-2 text-white hover:bg-white/10"><X className="h-5 w-5" /></button>
            <img src={activePhoto.imageUrl} alt={activePhoto.altText} className="max-h-[78vh] w-auto max-w-full rounded-xl object-contain" />
            {activePhoto.caption && <p className="max-w-2xl text-center text-sm text-white/70">{activePhoto.caption}</p>}
            {activeIndex > 0 ? <button type="button" aria-label="Imagen anterior" onClick={() => setActiveIndex(activeIndex - 1)} className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white hover:bg-white/10"><ChevronLeft className="h-6 w-6" /></button> : null}
            {activeIndex < photos.length - 1 ? <button type="button" aria-label="Imagen siguiente" onClick={() => setActiveIndex(activeIndex + 1)} className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white hover:bg-white/10"><ChevronRight className="h-6 w-6" /></button> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
