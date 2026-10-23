/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getApiBaseUrl } from "@/infrastructure/api/api-base-url";
import type { LandingEventCard } from "@/domain/landing/landing.types";
import { AutoPublicHeader } from "@/presentation/components/layout";

async function loadEvents(): Promise<LandingEventCard[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/landing/events`, { next: { revalidate: 60 } });
    return response.ok ? ((await response.json()) as LandingEventCard[]) : [];
  } catch { return []; }
}

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value)) : "Fecha por confirmar";

export default async function LandingEventsArchivePage() {
  const events = await loadEvents();
  return (
    <main className="min-h-screen bg-black text-white">
      <AutoPublicHeader />
      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-28 md:px-10 xl:px-[120px]">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Memoria SICSEMPER / Eventos anteriores</p>
          <h1 className="text-5xl font-bold md:text-7xl">Eventos que dejaron huella</h1>
          <p className="mt-6 text-lg text-white/60">Un recorrido por las experiencias, encuentros y comunidades que construyeron nuestra historia.</p>
        </div>
        {events.length === 0 ? <p className="py-20 text-center text-white/50">Todavía no hay eventos publicados.</p> : <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{events.map((event) => <Link key={event.id} href={`/eventos/${event.id}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-cyan-300"><div className="aspect-[1.4] bg-gradient-to-br from-cyan-900/70 via-indigo-950 to-black">{event.coverImageUrl && <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}</div><div className="space-y-3 p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{formatDate(event.endDate ?? event.startDate)}</p><h2 className="text-2xl font-bold">{event.title}</h2><p className="line-clamp-3 text-sm text-white/60">{event.summary}</p><p className="text-xs text-white/50">{event.place ?? "SICSEMPER"}</p></div></Link>)}</div>}
      </section>
    </main>
  );
}
