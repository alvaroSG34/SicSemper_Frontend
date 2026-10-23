/* eslint-disable @next/next/no-img-element */
import type { LandingEvent } from "@/domain/landing/landing.types";

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value)) : "Fecha por confirmar";

type Props = { event: LandingEvent; preview?: boolean };

export function LandingEventDetailView({ event, preview = false }: Props) {
  return (
    <article className={`mx-auto max-w-[1240px] px-6 pb-24 pt-10 md:px-10 xl:px-[100px] ${preview ? "text-black" : "text-white"}`}>
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="aspect-[1.3] overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-900/70 via-indigo-950 to-black">
          {event.coverImageUrl && <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover" />}
        </div>
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">{event.label}</p>
          <h1 className="text-5xl font-bold md:text-7xl">{event.title || "Título del evento"}</h1>
          <p className="mt-6 text-lg leading-relaxed opacity-60">{event.summary || "El resumen aparecerá aquí."}</p>
          <dl className="mt-8 grid gap-4 text-sm opacity-70 sm:grid-cols-2">
            <div><dt className="text-xs uppercase tracking-wide opacity-50">Fecha</dt><dd>{formatDate(event.endDate ?? event.startDate)}</dd></div>
            {event.place && <div><dt className="text-xs uppercase tracking-wide opacity-50">Lugar</dt><dd>{event.place}</dd></div>}
            {event.format && <div><dt className="text-xs uppercase tracking-wide opacity-50">Formato</dt><dd>{event.format}</dd></div>}
          </dl>
        </div>
      </div>
      {(event.storyTitle || event.storyParagraphs.length > 0) && <section className="mt-24 grid gap-8 border-t border-current/10 pt-16 lg:grid-cols-[0.8fr_1.2fr]"><h2 className="text-3xl font-bold md:text-4xl">{event.storyTitle || "El encuentro"}</h2><div className="space-y-5 text-base leading-relaxed opacity-60">{event.storyParagraphs.map((paragraph, index) => <p key={`${event.id}-story-${index}`}>{paragraph}</p>)}</div></section>}
      {event.highlights.length > 0 && <section className="mt-20 border-t border-current/10 pt-16"><p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-300">Momentos destacados</p><h2 className="mb-8 text-3xl font-bold md:text-4xl">Personas que hicieron especial el encuentro</h2><div className="grid gap-4 md:grid-cols-3">{event.highlights.map((highlight) => <div key={highlight.id} className="rounded-2xl border border-current/10 bg-current/[0.04] p-5"><div className="mb-5 aspect-square overflow-hidden rounded-xl bg-current/10">{highlight.imageUrl && <img src={highlight.imageUrl} alt={highlight.name} className="h-full w-full object-cover" />}</div><h3 className="font-bold">{highlight.name}</h3><p className="mt-1 text-sm text-cyan-300">{highlight.role}</p></div>)}</div></section>}
      {event.gallery.length > 0 && <section className="mt-20 border-t border-current/10 pt-16"><p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Galería de fotos</p><h2 className="mb-8 text-3xl font-bold md:text-4xl">Así se vivió {event.title}</h2><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{event.gallery.map((photo) => <figure key={photo.id} className="overflow-hidden rounded-2xl bg-current/[0.05]"><img src={photo.imageUrl} alt={photo.altText} className="aspect-[1.2] h-full w-full object-cover" />{photo.caption && <figcaption className="p-3 text-sm opacity-60">{photo.caption}</figcaption>}</figure>)}</div></section>}
    </article>
  );
}
