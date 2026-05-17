import Link from "next/link";
import { AutoPublicHeader } from "@/presentation/components/layout";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <AutoPublicHeader />
      <section className="mx-auto flex w-full max-w-[960px] flex-col gap-8 px-6 pb-16 pt-10 md:px-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold md:text-4xl">Terminos y condiciones</h1>
          <p className="text-sm text-[#9C9C9C]">Ultima actualizacion: 10 de mayo de 2026</p>
        </header>

        <article className="space-y-4 text-sm leading-7 text-[#D0D0D0]">
          <p>
            El uso de la plataforma IPMS BOLIVIA implica aceptar estas condiciones para registro, participacion y seguimiento de competencias.
          </p>
          <p>
            Cada usuario es responsable de la veracidad de la informacion registrada y del cumplimiento de bases del evento publicadas por la organizacion.
          </p>
          <p>
            IPMS BOLIVIA puede actualizar fechas, categorias, criterios o funcionalidades de la plataforma para garantizar operacion y seguridad.
          </p>
          <p>
            Cualquier incumplimiento de normas del evento o uso indebido de la plataforma puede derivar en suspension de cuenta o anulacion de inscripciones.
          </p>
        </article>

        <Link href="/" className="text-sm font-semibold text-[#7CD4D1] hover:text-white">
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
