import Link from "next/link";
import { AutoPublicHeader } from "@/presentation/components/layout";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <AutoPublicHeader />
      <section className="mx-auto flex w-full max-w-[960px] flex-col gap-8 px-6 pb-16 pt-10 md:px-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold md:text-4xl">Politica de privacidad</h1>
          <p className="text-sm text-[#9C9C9C]">Ultima actualizacion: 10 de mayo de 2026</p>
        </header>

        <article className="space-y-4 text-sm leading-7 text-[#D0D0D0]">
          <p>
            IPMS BOLIVIA recopila datos personales unicamente para gestionar registros, inscripciones y comunicacion operativa de la plataforma.
          </p>
          <p>
            Los datos pueden incluir nombre, correo electronico, telefono, ciudad, pais y datos de participacion en eventos. No se comercializa informacion personal.
          </p>
          <p>
            Puedes solicitar correccion o eliminacion de tus datos escribiendo a{" "}
            <a className="text-[#7CD4D1] hover:text-white" href="mailto:contacto@ipmsbolivia.org">
              contacto@ipmsbolivia.org
            </a>
            .
          </p>
          <p>
            Al usar la plataforma aceptas el tratamiento de datos necesario para operar concursos, evaluaciones y comunicaciones del evento.
          </p>
        </article>

        <Link href="/" className="text-sm font-semibold text-[#7CD4D1] hover:text-white">
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
