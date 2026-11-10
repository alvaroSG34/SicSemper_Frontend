import { publicPageMetadata } from "@/core/seo";
import { loadPublicLandingContent } from "@/infrastructure/api/landing-public";
import Link from "next/link";
import { AutoPublicHeader } from "@/presentation/components/layout";

export const revalidate = 60;

export const metadata = publicPageMetadata({
  title: "Términos y condiciones | SICSEMPER",
  description:
    "Consulta las condiciones de uso de la plataforma SICSEMPER para el registro y la participación en concursos de modelismo.",
  path: "/terminos",
});

export default async function TermsPage() {
  const { contactEmail } = await loadPublicLandingContent();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <AutoPublicHeader />
      <section className="mx-auto flex w-full max-w-[960px] flex-col gap-8 px-6 pb-16 pt-10 md:px-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold md:text-4xl">Términos y condiciones</h1>
          <p className="text-sm text-[#9C9C9C]">
            Última actualización: <time dateTime="2026-11-10">10 de noviembre de 2026</time>
          </p>
        </header>

        <article className="space-y-8 text-base leading-7 text-[#D0D0D0]">
          <p>
            Estas condiciones regulan el uso de la plataforma del club SICSEMPER para crear cuentas
            y gestionar la participación y el seguimiento de eventos de modelismo. El uso de la
            plataforma implica aceptar estas condiciones.
          </p>
          <section aria-labelledby="cuenta" className="space-y-3">
            <h2 id="cuenta" className="text-xl font-semibold text-white">
              Cuenta y acceso
            </h2>
            <p>
              Cada usuario es responsable de la veracidad de la información registrada y del cuidado
              de sus credenciales de acceso. Crear una cuenta no equivale a incorporarse al club ni
              a inscribirse automáticamente en un concurso; estos procesos se gestionan por
              separado.
            </p>
          </section>
          <section aria-labelledby="participacion" className="space-y-3">
            <h2 id="participacion" className="text-xl font-semibold text-white">
              Participación en concursos
            </h2>
            <p>
              Antes de participar, consulta las bases, fechas, categorías y condiciones publicadas
              por la organización para la convocatoria correspondiente. Cada participante debe
              cumplir las bases del evento en el que se inscribe.
            </p>
          </section>
          <section aria-labelledby="trabajos" className="space-y-3">
            <h2 id="trabajos" className="text-xl font-semibold text-white">
              Información y trabajos presentados
            </h2>
            <p>
              Cada participante es responsable de la veracidad de los datos que proporciona sobre su
              participación y sus maquetas, así como del cumplimiento de las bases aplicables a los
              trabajos que presenta.
            </p>
          </section>
          <section aria-labelledby="fotografias" className="space-y-3">
            <h2 id="fotografias" className="text-xl font-semibold text-white">
              Fotografías y publicaciones
            </h2>
            <p>
              El club solicita autorización por separado para publicar fotografías de personas y
              trabajos en las galerías públicas. Usar la plataforma o crear una cuenta no concede
              por sí solo un permiso general de publicación ni supone una cesión de derechos sobre
              los trabajos o las fotografías.
            </p>
          </section>
          <section aria-labelledby="uso-indebido" className="space-y-3">
            <h2 id="uso-indebido" className="text-xl font-semibold text-white">
              Uso indebido y suspensión
            </h2>
            <p>
              El incumplimiento de las normas del evento o el uso indebido de la plataforma puede
              derivar en la suspensión de la cuenta o la anulación de inscripciones.
            </p>
          </section>
          <section aria-labelledby="actualizaciones" className="space-y-3">
            <h2 id="actualizaciones" className="text-xl font-semibold text-white">
              Actualizaciones y contacto
            </h2>
            <p>
              SICSEMPER puede actualizar estas condiciones, así como fechas, categorías, criterios o
              funcionalidades de la plataforma para su operación y seguridad. Consulta la
              información vigente y las bases del evento correspondiente.
            </p>
            <p>
              Para consultas sobre estas condiciones o la información operativa, escribe a{" "}
              <a
                className="break-all text-[#7CD4D1] underline-offset-4 hover:underline"
                href={`mailto:${contactEmail}`}
              >
                {contactEmail}
              </a>
              .
            </p>
          </section>
        </article>

        <nav
          aria-label="Enlaces de términos"
          className="flex flex-wrap gap-5 text-sm font-semibold text-[#7CD4D1]"
        >
          <Link href="/privacidad" className="hover:underline">
            Política de privacidad
          </Link>
          <Link href="/" className="hover:underline">
            Volver al inicio
          </Link>
        </nav>
      </section>
    </main>
  );
}
