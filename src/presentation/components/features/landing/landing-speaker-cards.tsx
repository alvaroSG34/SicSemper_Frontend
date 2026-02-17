import { firstSpeakers } from "./landing-data";

export function LandingSpeakerCards() {
  return (
    <section className="flex w-full justify-center gap-6 px-[120px] py-0">
      {firstSpeakers.map((speaker) => (
        <article
          key={speaker.name}
          className="flex h-[320px] w-[280px] flex-col items-center justify-center rounded-[12px] bg-black p-3"
        >
          <div
            className="h-[240px] w-full rounded-lg bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${speaker.image})` }}
          />
          <h3 className="mt-3 whitespace-pre-line text-center text-2xl leading-[1.1] font-bold text-white">
            {speaker.name}
          </h3>
          <p className="mt-1 text-center text-[10px] font-normal text-[#999999]">{speaker.role}</p>
        </article>
      ))}
    </section>
  );
}
