import Image from "next/image";
import { locationCards, locationMapImage } from "./landing-data";

export function LandingLocation() {
  return (
    <section
      id="ubicacion"
      className="flex w-full flex-col gap-12 px-6 py-16 md:px-10 xl:px-[120px] xl:py-[100px]"
    >
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-center text-4xl font-bold text-[color:var(--landing-text)] xl:text-[42px]">
          Ubicación del Evento
        </h2>
        <p className="text-center text-lg text-[color:var(--landing-muted)]">
          Te esperamos en el corazón del distrito de diseño para dos días inolvidables.
        </p>
      </div>

      <div className="relative h-[320px] w-full overflow-hidden rounded-[32px] border border-[color:var(--landing-border)] xl:h-[450px]">
        <Image
          src={locationMapImage}
          alt="Ubicación del evento"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,rgba(255,107,157,0.1)_0%,rgba(107,154,255,0.1)_100%)]">
          <span className="text-[80px]">📍</span>
        </div>
      </div>

      <div className="flex w-full flex-wrap justify-center gap-6">
        {locationCards.map((card) => (
          <article
            key={card.title}
            className="flex w-full max-w-[400px] flex-col gap-4 rounded-3xl border border-[color:var(--landing-border)] bg-[color:var(--landing-card)] p-8"
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: card.iconBackground }}
              >
                {card.icon}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-[color:var(--landing-muted)]">
                  {card.label}
                </p>
                <h3 className="text-[20px] font-bold text-[color:var(--landing-text)]">
                  {card.title}
                </h3>
              </div>
            </div>
            <p className="text-[15px] leading-[1.6] text-[color:var(--landing-muted)]">
              {card.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
