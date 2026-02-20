import Image from "next/image";
import { firstSpeakers } from "./landing-data";

export function LandingSpeakerCards() {
  return (
    <section className="flex w-full flex-wrap justify-center gap-6 px-6 py-0 md:px-10 xl:flex-nowrap xl:px-[120px]">
      {firstSpeakers.map((speaker) => (
        <article
          key={speaker.name}
          className="flex h-[320px] w-[280px] flex-col items-center justify-center rounded-[12px] bg-[color:var(--landing-bg)] p-3"
        >
          <Image
            src={speaker.image}
            alt={speaker.name.replace("\n", " ")}
            width={256}
            height={240}
            className="h-[240px] w-full rounded-lg object-cover"
          />
          <h3 className="mt-3 whitespace-pre-line text-center text-2xl leading-[1.1] font-bold text-[color:var(--landing-text)]">
            {speaker.name}
          </h3>
          <p className="mt-1 text-center text-[10px] font-normal text-[color:var(--landing-muted)]">
            {speaker.role}
          </p>
        </article>
      ))}
    </section>
  );
}
