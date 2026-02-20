import Image from "next/image";
import { featuredSpeakers } from "./landing-data";

export function LandingFeaturedSpeakers() {
  return (
    <section
      id="equipo"
      className="flex w-full flex-col items-center gap-8 px-6 py-16 md:px-10 xl:px-[120px] xl:py-20"
    >
      <h2 className="whitespace-pre-line text-center text-4xl leading-[1.1] font-bold text-[color:var(--landing-text)] xl:text-5xl">
        Conoce a Los{"\n"}Conferencistas Destacados
      </h2>
      <p className="max-w-[900px] text-center text-sm font-normal text-[color:var(--landing-muted)]">
        Compartirán su experiencia con nosotros y aportarán ideas prácticas para diseñar productos
        más útiles, atractivos y memorables.
      </p>

      <div className="flex w-full flex-wrap justify-center gap-6 xl:flex-nowrap">
        {featuredSpeakers.map((speaker) => (
          <article
            key={speaker.name}
            className="flex h-[380px] w-[280px] flex-col items-center justify-center rounded-2xl p-4"
            style={{ backgroundColor: speaker.cardColor }}
          >
            <Image
              src={speaker.image}
              alt={speaker.name}
              width={248}
              height={280}
              className="h-[280px] w-full rounded-xl object-cover"
            />
            <h3 className="mt-3 text-xl font-bold text-black">{speaker.name}</h3>
            <p className="mt-1 whitespace-pre-line text-[11px] leading-[1.4] text-[#333333]">
              {speaker.role}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
