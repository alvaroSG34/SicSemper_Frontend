import Image from "next/image";
import type { LandingContent } from "@/domain/landing/landing.types";

type LandingEventsProps = {
  content: LandingContent;
};

export function LandingEvents({ content }: LandingEventsProps) {
  return (
    <section
      id="acerca"
      className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-10 px-6 py-16 md:px-10 xl:flex-row xl:justify-center xl:gap-24 2xl:gap-28 xl:px-[120px] xl:py-[100px]"
    >
      <div className="flex w-full max-w-[500px] flex-col gap-6">
        <h2 className="whitespace-pre-line text-4xl leading-[1.1] font-bold text-[color:var(--landing-text)] xl:text-5xl">
          {content.eventsCopy.title}
        </h2>
        <p className="text-base font-semibold text-[color:var(--landing-text)]">
          {content.eventsCopy.subtitle}
        </p>
        <p className="whitespace-pre-line text-sm leading-[1.6] font-normal text-[color:var(--landing-muted)]">
          {content.eventsCopy.descriptionOne}
        </p>
        <p className="whitespace-pre-line text-sm leading-[1.6] font-normal text-[color:var(--landing-muted)]">
          {content.eventsCopy.descriptionTwo}
        </p>
      </div>

      <Image
        src={content.eventsCopy.image}
        alt="Eventos destacados"
        width={500}
        height={340}
        sizes="(min-width: 1280px) 500px, 100vw"
        className="h-auto w-full max-w-[500px] rounded-2xl object-cover"
      />
    </section>
  );
}
