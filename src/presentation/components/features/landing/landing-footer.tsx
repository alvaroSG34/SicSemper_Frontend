import Link from "next/link";

const sectionLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Acerca de", href: "#acerca" },
  { label: "Agenda", href: "#agenda" },
  { label: "Organizadores", href: "#equipo" },
  { label: "Ubicacion", href: "#ubicacion" },
];

const competitionLinks = [
  { label: "Bases y reglamento", href: "#agenda" },
  { label: "Proceso de evaluacion", href: "#agenda" },
  { label: "Cronograma", href: "#agenda" },
  { label: "Resultados", href: "#agenda" },
];

const footerLinkClassName =
  "text-[13px] text-[color:var(--landing-muted)] transition-colors hover:text-[color:var(--landing-text)] focus-visible:outline-none focus-visible:text-[color:var(--landing-text)]";

export function LandingFooter() {
  return (
    <footer id="contacto" className="w-full bg-[color:var(--landing-surface)]">
      <div className="mx-auto flex w-full max-w-[1686px] flex-col gap-12 px-6 pb-10 pt-20 md:px-10 xl:px-[120px]">
        <div className="flex w-full flex-wrap justify-center gap-12 xl:gap-20">
          <div className="w-full xl:w-[280px]">
            <p className="text-xl font-semibold text-[color:var(--landing-text)]">IPMS BOLIVIA</p>
            <p className="mt-3 text-[13px] text-[color:var(--landing-muted)]">
              Plataforma oficial de gestion para competencias de modelismo y maquetas.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 xl:gap-20">
            <nav aria-label="Navegacion del footer" className="flex min-w-[170px] flex-col gap-4">
              <p className="text-sm font-semibold text-[color:var(--landing-text)]">Navegacion</p>
              <ul className="space-y-2">
                {sectionLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={footerLinkClassName}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Recursos de competencia" className="flex min-w-[170px] flex-col gap-4">
              <p className="text-sm font-semibold text-[color:var(--landing-text)]">Competencia</p>
              <ul className="space-y-2">
                {competitionLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={footerLinkClassName}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex min-w-[280px] flex-col gap-4">
              <p className="text-sm font-semibold text-[color:var(--landing-text)]">Contacto</p>
              <p className="max-w-[280px] text-[13px] leading-[1.5] text-[color:var(--landing-muted)]">
                Tienes dudas sobre la inscripcion o categorias? Contactanos para recibir informacion oficial del evento.
              </p>

              <a
                href="mailto:contacto@ipmsbolivia.org"
                className="flex h-11 w-full max-w-[280px] items-center rounded-[22px] border border-[color:var(--landing-border)] px-5 text-[13px] text-[color:var(--landing-subtle)] transition-colors hover:text-[color:var(--landing-text)] focus-visible:outline-none focus-visible:text-[color:var(--landing-text)]"
              >
                contacto@ipmsbolivia.org
              </a>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-4 border-t border-transparent pt-8">
          <p className="text-[13px] text-[color:var(--landing-subtle)]">
            (c) 2026 IPMS BOLIVIA. Todos los derechos reservados.
          </p>
          <nav aria-label="Legal" className="flex gap-4 xl:ml-auto">
            <Link href="/privacidad" className={footerLinkClassName}>
              Politica de privacidad
            </Link>
            <Link href="/terminos" className={footerLinkClassName}>
              Terminos y condiciones
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
