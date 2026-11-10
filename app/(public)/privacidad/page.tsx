import { publicPageMetadata } from "@/core/seo";
import { loadPublicLandingContent } from "@/infrastructure/api/landing-public";
import Link from "next/link";
import { AutoPublicHeader } from "@/presentation/components/layout";

export const revalidate = 60;

export const metadata = publicPageMetadata({
  title: "Política de privacidad | SICSEMPER",
  description:
    "Conoce cómo SICSEMPER trata los datos personales de registros e inscripciones en su plataforma de modelismo.",
  path: "/privacidad",
});

export default async function PrivacyPage() {
  const { contactEmail } = await loadPublicLandingContent();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <AutoPublicHeader />
      <section className="mx-auto flex w-full max-w-[960px] flex-col gap-8 px-6 pb-16 pt-10 md:px-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold md:text-4xl">Política de privacidad</h1>
          <p className="text-sm text-[#9C9C9C]">
            Última actualización: <time dateTime="2026-11-10">10 de noviembre de 2026</time>
          </p>
        </header>

        <article className="space-y-8 text-base leading-7 text-[#D0D0D0]">
          <p>
            Esta política describe cómo el club SICSEMPER trata la información utilizada en su
            plataforma para gestionar cuentas y la participación en eventos de modelismo. Aquí
            encontrarás qué datos se utilizan, con qué finalidad y cómo presentar consultas sobre tu
            información personal.
          </p>
          <section aria-labelledby="datos" className="space-y-3">
            <h2 id="datos" className="text-xl font-semibold text-white">
              Datos que recopilamos
            </h2>
            <p>
              Según los campos que completes, la información de registro y perfil puede incluir
              nombre, documento de identidad, fecha de nacimiento, país, ciudad, club, teléfono,
              correo electrónico y credenciales de acceso. También se gestionan datos de
              inscripciones, maquetas y fotografías que aportes para participar en los eventos.
            </p>
          </section>
          <section aria-labelledby="finalidades" className="space-y-3">
            <h2 id="finalidades" className="text-xl font-semibold text-white">
              Para qué utilizamos los datos
            </h2>
            <p>
              Utilizamos la información para gestionar cuentas y acceso, registrar la participación
              en concursos, organizar y evaluar los trabajos y realizar comunicaciones operativas
              relacionadas con la cuenta o el evento. No se comercializa información personal.
            </p>
          </section>
          <section aria-labelledby="publicaciones" className="space-y-3">
            <h2 id="publicaciones" className="text-xl font-semibold text-white">
              Información visible y fotografías
            </h2>
            <p>
              Los datos de registro y acceso se utilizan para operar la plataforma y no forman parte
              de las galerías públicas. Las páginas públicas de eventos pueden mostrar historias,
              personas destacadas y fotografías seleccionadas por la organización.
            </p>
            <p>
              El club solicita autorización por separado para publicar fotografías de personas y
              trabajos. Crear una cuenta o aportar imágenes para participar en un concurso no
              constituye, por sí solo, una autorización general para publicarlas en las galerías.
            </p>
          </section>
          <section aria-labelledby="almacenamiento" className="space-y-3">
            <h2 id="almacenamiento" className="text-xl font-semibold text-white">
              Cookies y almacenamiento del navegador
            </h2>
            <p>
              La plataforma utiliza cookies para mantener la sesión de acceso y proteger las
              solicitudes realizadas durante su uso. El formulario de registro también guarda
              temporalmente un borrador en el almacenamiento de sesión del navegador para conservar
              los datos mientras completas el proceso.
            </p>
          </section>
          <section aria-labelledby="servicios" className="space-y-3">
            <h2 id="servicios" className="text-xl font-semibold text-white">
              Servicios y enlaces externos
            </h2>
            <p>
              Para operar la plataforma se utilizan servicios técnicos de alojamiento,
              almacenamiento y correo electrónico. Los enlaces a WhatsApp o Google Maps abren
              servicios externos que se rigen por sus propias políticas de privacidad y condiciones.
            </p>
          </section>
          <section aria-labelledby="consultas" className="space-y-3">
            <h2 id="consultas" className="text-xl font-semibold text-white">
              Consultas, corrección y eliminación
            </h2>
            <p>
              Puedes consultar sobre los usos descritos en esta política o solicitar la corrección o
              eliminación de tus datos escribiendo a{" "}
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
          aria-label="Enlaces de privacidad"
          className="flex flex-wrap gap-5 text-sm font-semibold text-[#7CD4D1]"
        >
          <Link href="/terminos" className="hover:underline">
            Términos y condiciones
          </Link>
          <Link href="/" className="hover:underline">
            Volver al inicio
          </Link>
        </nav>
      </section>
    </main>
  );
}
