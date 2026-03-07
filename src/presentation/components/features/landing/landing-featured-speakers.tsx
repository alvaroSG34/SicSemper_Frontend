import Image from "next/image";
import { featuredSpeakersGroup } from "./landing-data";

export function LandingFeaturedSpeakers() {
  return (
    <section
      id="equipo"
      className="flex w-full flex-col items-center gap-8 px-6 py-16 md:px-10 xl:px-[120px] xl:py-20"
    >
      <h2 className="text-center text-4xl leading-[1.1] font-bold text-[color:var(--landing-text)] xl:text-5xl">
        Conoce a los Organizadores
      </h2>

      <div className="relative h-[320px] w-full max-w-[980px] overflow-hidden rounded-[32px] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:h-[420px]">
        <Image
          src={featuredSpeakersGroup.image}
          alt="Organizadores posando juntos"
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 980px, 100vw"
        />
      </div>
    </section>
  );
}
