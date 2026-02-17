import { locationCards, locationMapImage } from "./landing-data";

export function LandingLocation() {
  return (
    <section className="flex w-full flex-col gap-12 px-[120px] py-[100px]">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-center text-[42px] font-bold text-white">Ubicación del Evento</h2>
        <p className="text-center text-lg text-[#999999]">
          Te esperamos en el corazón del distrito de diseño para dos días inolvidables.
        </p>
      </div>

      <div
        className="relative h-[450px] w-full overflow-hidden rounded-[32px] border border-[#1a1a1a] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${locationMapImage})` }}
      >
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(255,107,157,0.1)_0%,rgba(107,154,255,0.1)_100%)]">
          <span className="text-[80px]">📍</span>
        </div>
      </div>

      <div className="flex w-full justify-center gap-6">
        {locationCards.map((card) => (
          <article
            key={card.title}
            className="flex w-[400px] flex-col gap-4 rounded-3xl border border-[#1a1a1a] bg-[#0a0a0a] p-8"
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: card.iconBackground }}
              >
                {card.icon}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-[#999999]">{card.label}</p>
                <h3 className="text-[20px] font-bold text-white">{card.title}</h3>
              </div>
            </div>
            <p className="text-[15px] leading-[1.6] text-[#999999]">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
