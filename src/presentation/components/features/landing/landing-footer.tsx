export function LandingFooter() {
  return (
    <footer id="contacto" className="w-full bg-[color:var(--landing-surface)]">
      <div className="mx-auto flex w-full max-w-[1686px] flex-col gap-12 px-6 pt-20 pb-10 md:px-10 xl:px-[120px]">
        <div className="flex w-full flex-wrap justify-center gap-12 xl:gap-20">
          <div className="w-full xl:w-[280px]">
            <p className="text-xl font-semibold text-[color:var(--landing-text)]">▼ SicSemper</p>
          </div>

          <div className="flex flex-wrap gap-10 xl:gap-20">
            <div className="flex min-w-[170px] flex-col gap-4">
              <p className="text-sm font-semibold text-[color:var(--landing-text)]">Navegar</p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">Inicio</p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">Acerca de</p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">Conferencistas</p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">
                Confirmar asistencia (BETA)
              </p>
            </div>

            <div className="flex min-w-[170px] flex-col gap-4">
              <p className="text-sm font-semibold text-[color:var(--landing-text)]">
                Conferencistas
              </p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">Brian Cuuk</p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">Dannis Billie</p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">Trumps Blades</p>
              <p className="text-[13px] text-[color:var(--landing-muted)]">Mohammad Irfan</p>
            </div>

            <div className="flex min-w-[280px] flex-col gap-4">
              <p className="text-sm font-semibold text-[color:var(--landing-text)]">Boletín</p>
              <p className="max-w-[280px] text-[13px] leading-[1.5] text-[color:var(--landing-muted)]">
                Regístrate para recibir las últimas noticias sobre nuestro evento. ¡Prometemos no
                enviarte spam!
              </p>

              <div className="flex h-11 w-full max-w-[280px] items-center rounded-[22px] border border-[color:var(--landing-border)] px-5">
                <span className="truncate text-[13px] text-[color:var(--landing-subtle)]">
                  Tu correo electrónico aquí
                </span>
                <button
                  type="button"
                  className="ml-auto flex h-8 w-[100px] shrink-0 items-center justify-center rounded-2xl bg-[color:var(--landing-indigo)] text-[10px] font-bold text-[color:var(--landing-text)]"
                >
                  SUSCRIBIRSE
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-4 border-t border-transparent pt-8">
          <p className="text-[13px] text-[color:var(--landing-subtle)]">
            © 2026 SicSemper, todos los derechos reservados
          </p>
          <div className="flex gap-4 xl:ml-auto">
            <p className="text-[13px] text-[color:var(--landing-muted)]">Twitter</p>
            <p className="text-[13px] text-[color:var(--landing-muted)]">Facebook</p>
            <p className="text-[13px] text-[color:var(--landing-muted)]">Instagram</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
