/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { LandingContent } from "@/domain/landing/landing.types";

type Props = { content: LandingContent };

const formatDate = (value: string | null) => {
  if (!value) return "Fecha por confirmar";
  return new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
};

export function LandingPastEvents({ content }: Props) {
  if (!content.eventsSectionVisible || content.pastEvents.length === 0) return null;
  return (
    <section id="eventos" className="mx-auto w-full max-w-[1400px] px-6 py-16 md:px-10 xl:px-[120px] xl:py-[100px]">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--landing-accent)]">Memoria SICSEMPER</p>
          <h2 className="text-4xl font-bold text-[color:var(--landing-text)] xl:text-5xl">Eventos que dejaron huella</h2>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {content.pastEvents.map((event) => (
          <Link key={event.id} href={`/eventos/${event.id}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-[color:var(--landing-accent)]">
            <div className="aspect-[1.55] overflow-hidden bg-white/[0.05]">
              {event.coverImageUrl ? <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-gradient-to-br from-cyan-900/70 via-indigo-950 to-black" />}
            </div>
            <div className="space-y-3 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--landing-accent)]">{event.label}</p>
              <h3 className="text-2xl font-bold text-[color:var(--landing-text)]">{event.title}</h3>
              <p className="line-clamp-3 text-sm leading-relaxed text-[color:var(--landing-muted)]">{event.summary}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{formatDate(event.endDate ?? event.startDate)}{event.place ? ` · ${event.place}` : ""}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
