import Link from "next/link";
import { publicPageMetadata, serializeJsonLd, siteUrl } from "@/core/seo";
import { loadPublicLandingContent } from "@/infrastructure/api/landing-public";
import { AutoPublicHeader } from "@/presentation/components/layout";

export const metadata = publicPageMetadata({
  title: "Club de modelismo en Santa Cruz, Bolivia | SICSEMPER",
  description:
    "Conoce SICSEMPER, club de modelismo estático en Santa Cruz, Bolivia. Descubre la comunidad, sus concursos de maquetas y cómo contactar para integrarte.",
  path: "/club-modelismo-santa-cruz",
});

export default async function ClubPage() {
  const content = await loadPublicLandingContent();
  const whatsappNumber = content.whatsappNumber.replace(/[^\d]/g, "");

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <AutoPublicHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            name: "SICSEMPER",
            alternateName: "Sic Semper Modelismo",
            url: `${siteUrl}/club-modelismo-santa-cruz`,
            description:
              "Club de modelismo estático en Santa Cruz, Bolivia, organizador de concursos de maquetas.",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Santa Cruz de la Sierra",
              addressCountry: "BO",
            },
          }),
        }}
      />
      <article className="mx-auto flex w-full max-w-[960px] flex-col gap-12 px-6 pb-20 pt-12 md:px-10">
        <header className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#7CD4D1]">
            Comunidad SICSEMPER
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Club de modelismo en Santa Cruz, Bolivia
          </h1>
          <p className="text-lg leading-8 text-[#D0D0D0]">
            SICSEMPER es un club de modelismo estático de Santa Cruz que organiza concursos de
            maquetas. Reunimos a personas que comparten el interés por construir modelos a escala y
            presentar sus trabajos.
          </p>
        </header>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">La pasión por el modelismo estático</h2>
          <p className="leading-7 text-[#D0D0D0]">
            El modelismo estático consiste en construir y representar objetos a escala: aviones,
            vehículos, barcos y otras escenas en miniatura. El montaje, la pintura y el acabado
            forman parte de un trabajo que combina investigación, paciencia y creatividad.
          </p>
          <p className="leading-7 text-[#D0D0D0]">
            Nuestro club ofrece un punto de encuentro para compartir esa afición en Santa Cruz y
            conectar con la comunidad de modelistas de Bolivia.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Concursos de modelismo y maquetas</h2>
          <p className="leading-7 text-[#D0D0D0]">
            Organizamos concursos para presentar maquetas y compartir el trabajo de los
            participantes. Consulta la información de cada convocatoria para conocer sus fechas,
            sede, categorías y condiciones de participación. La inscripción en la plataforma permite
            gestionar tu participación; la incorporación al club se consulta directamente con la
            organización.
          </p>
          <Link
            href="/eventos"
            className="inline-block font-semibold text-[#7CD4D1] hover:underline"
          >
            Conocer los eventos de SICSEMPER
          </Link>
        </section>
        <section className="space-y-4 rounded-2xl border border-white/15 p-6 md:p-8">
          <h2 className="text-2xl font-bold">¿Buscas un club de modelismo en Santa Cruz?</h2>
          <p className="leading-7 text-[#D0D0D0]">
            Contacta con SICSEMPER para consultar cómo integrarte al club, conocer sus actividades o
            resolver dudas sobre los concursos.{" "}
            {whatsappNumber
              ? "Usa el botón de contacto para escribirnos por WhatsApp."
              : "En la sección de contacto de la portada encontrarás los canales publicados por la organización."}
          </p>
          <div className="flex flex-wrap gap-5 font-semibold text-[#7CD4D1]">
            <a
              href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : "/#contacto"}
              target={whatsappNumber ? "_blank" : undefined}
              rel={whatsappNumber ? "noreferrer" : undefined}
              className="hover:underline"
            >
              Contactar con el club
            </a>
            <Link href="/register" className="hover:underline">
              Crear cuenta para participar
            </Link>
          </div>
        </section>
        <Link href="/" className="text-sm font-semibold text-[#7CD4D1] hover:underline">
          Volver al inicio
        </Link>
      </article>
    </main>
  );
}
