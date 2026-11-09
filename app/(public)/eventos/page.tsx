import Link from "next/link";
import { publicPageMetadata } from "@/core/seo";
import { loadPublicEvents } from "@/infrastructure/api/landing-public";
import { AutoPublicHeader } from "@/presentation/components/layout";

export const dynamic = "force-dynamic";

export const metadata = publicPageMetadata({
  title: "Concursos de modelismo y maquetas en Bolivia | SICSEMPER",
  description:
    "Explora los eventos de SICSEMPER, club de modelismo en Santa Cruz, Bolivia. Conoce la historia, las maquetas y las galerías de nuestros encuentros.",
  path: "/eventos",
});

export default async function EventsPage() {
  const events = await loadPublicEvents();
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <AutoPublicHeader />
      <div className="mx-auto max-w-[1100px] space-y-10 px-6 pb-20 pt-12 md:px-10">
        <header className="max-w-3xl space-y-5">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Concursos de modelismo y maquetas en Bolivia
          </h1>
          <p className="text-lg leading-8 text-[#D0D0D0]">
            Conoce los encuentros de SICSEMPER, club de modelismo estático de Santa Cruz. Aquí
            reunimos las memorias de nuestros eventos: sus historias, personas destacadas y
            fotografías.
          </p>
          <p className="leading-7 text-[#D0D0D0]">
            Para consultar convocatorias e inscripciones vigentes, revisa la información de la
            portada o contacta con la organización. Las fichas históricas documentan encuentros
            pasados.
          </p>
          <Link
            href="/#contacto"
            className="inline-block font-semibold text-[#7CD4D1] hover:underline"
          >
            Consultar próximos concursos
          </Link>
        </header>
        {events.length ? (
          <section aria-labelledby="past-events-heading" className="space-y-6">
            <h2 id="past-events-heading" className="text-2xl font-bold">
              Memoria de eventos SICSEMPER
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event) => (
                <article key={event.id} className="min-w-0">
                  <Link
                    href={`/eventos/${encodeURIComponent(event.id)}`}
                    aria-labelledby={`event-title-${event.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-[#7CD4D1] focus-visible:-translate-y-1 focus-visible:border-[#7CD4D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CD4D1] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0a0a] motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <div className="aspect-[1.55] overflow-hidden bg-gradient-to-br from-cyan-900/70 via-indigo-950 to-black">
                      {event.coverImageUrl && (
                        // Event covers use the same public asset URLs as the homepage.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.coverImageUrl}
                          alt={event.title}
                          loading="lazy"
                          decoding="async"
                          width={1550}
                          height={1000}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <h3 id={`event-title-${event.id}`} className="break-words text-xl font-bold">
                        {event.title}
                      </h3>
                      {event.place && <p className="text-sm text-[#7CD4D1]">{event.place}</p>}
                      <p className="line-clamp-3 break-words leading-7 text-[#D0D0D0]">
                        {event.summary}
                      </p>
                      <span className="mt-auto pt-2 text-sm font-semibold text-[#7CD4D1] group-hover:underline group-focus-visible:underline">
                        Ver historia y galería
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <p className="text-[#D0D0D0]">Todavía no hay memorias de eventos publicadas.</p>
        )}
        <Link
          href="/club-modelismo-santa-cruz"
          className="inline-block font-semibold text-[#7CD4D1] hover:underline"
        >
          Conoce el club de modelismo SICSEMPER
        </Link>
      </div>
    </main>
  );
}
