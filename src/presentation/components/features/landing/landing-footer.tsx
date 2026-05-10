export function LandingFooter() {
  return (
    <footer id="contacto" className="w-full bg-[color:var(--landing-surface)]">
      <div className="mx-auto flex w-full max-w-[1686px] flex-col gap-12 px-6 pt-20 pb-10 md:px-10 xl:px-[120px]">
        <div className="flex w-full flex-wrap justify-center gap-12 xl:gap-20">
          <div className="w-full xl:w-[280px]">
            <p className="text-xl font-semibold text-[color:var(--landing-text)]">
              IPMS BOLIVIA
            </p>
            <p className="mt-3 text-[13px] text-[color:var(--landing-muted)]">
              Plataforma oficial de gestion para competencias de modelismo y maquetas.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 xl:gap-20">
            <div className="flex min-w-[170px] flex-col gap-4">
              <p className="text-sm font-semibold text-[color:var(--landing-text)]">
                Navegacion
              </p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">Inicio</p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">Eventos</p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">Categorias</p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">Organizadores</p>
            </div>

            <div className="flex min-w-[170px] flex-col gap-4">
              <p className="text-sm font-semibold text-[color:var(--landing-text)]">
                Competencia
              </p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">
                Bases y reglamento
              </p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">
                Proceso de evaluacion
              </p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">
                Cronograma
              </p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">
                Resultados
              </p>
            </div>

            <div className="flex min-w-[280px] flex-col gap-4">
              <p className="text-sm font-semibold text-[color:var(--landing-text)]">
                Contacto
              </p>
              <p className="max-w-[280px] text-[13px] leading-[1.5] text-[color:var(--landing-muted)]">
                Tienes dudas sobre la inscripcion o categorias? Contactanos para
                recibir informacion oficial del evento.
              </p>

              <div className="flex h-11 w-full max-w-[280px] items-center rounded-[22px] border border-[color:var(--landing-border)] px-5">
                <span className="truncate text-[13px] text-[color:var(--landing-subtle)]">
                  contacto@ipmsbolivia.org
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-4 border-t border-transparent pt-8">
          <p className="text-[13px] text-[color:var(--landing-subtle)]">
            (c) 2026 IPMS BOLIVIA. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 xl:ml-auto">
            <p className="text-[13px] text-[color:var(--landing-muted)]">
              Politica de privacidad
            </p>
            <p className="text-[13px] text-[color:var(--landing-muted)]">
              Terminos y condiciones
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
