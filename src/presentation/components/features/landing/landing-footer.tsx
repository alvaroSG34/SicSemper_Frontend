export function LandingFooter() {
  return (
    <footer className="flex w-full flex-col gap-12 bg-[#111111] px-[120px] pt-20 pb-10">
      <div className="flex w-full gap-20">
        <div className="w-[280px]">
          <p className="text-xl font-semibold text-white">▼ Floko</p>
        </div>

        <div className="flex gap-20">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-white">Navegar</p>
            <p className="text-[13px] text-[#999999]">Inicio</p>
            <p className="text-[13px] text-[#999999]">Acerca de</p>
            <p className="text-[13px] text-[#999999]">Conferencistas</p>
            <p className="text-[13px] text-[#999999]">RSVP (Bienvenida BETA)</p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-white">Conferencistas</p>
            <p className="text-[13px] text-[#999999]">Brian Cuuk</p>
            <p className="text-[13px] text-[#999999]">Dannis Billie</p>
            <p className="text-[13px] text-[#999999]">Trumps Blades</p>
            <p className="text-[13px] text-[#999999]">Mohammad Irfan</p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-white">Boletín</p>
            <p className="max-w-[280px] text-[13px] leading-[1.5] text-[#999999]">
              Regístrate para recibir las últimas noticias sobre nuestro evento. ¡Prometemos no
              enviarte spam!
            </p>

            <div className="flex h-11 w-[280px] items-center rounded-[22px] border border-[#2a2a2a] px-5">
              <span className="text-[13px] text-[#666666]">Tu correo electrónico aquí</span>
              <button
                type="button"
                className="ml-auto flex h-8 w-[100px] items-center justify-center rounded-2xl bg-[#5865f2] text-[10px] font-bold text-white"
              >
                SUSCRIBIRSE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center border-t border-transparent pt-8">
        <p className="text-[13px] text-[#666666]">© 2021 Hosting, todos los derechos</p>
        <div className="ml-auto flex gap-4">
          <p className="text-[13px] text-[#999999]">Twitter</p>
          <p className="text-[13px] text-[#999999]">Facebook</p>
          <p className="text-[13px] text-[#999999]">Instagram</p>
        </div>
      </div>
    </footer>
  );
}
