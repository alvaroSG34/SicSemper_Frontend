import { featuredSpeakers } from "./landing-data";

export function LandingFeaturedSpeakers() {
  return (
    <section className="flex w-full flex-col items-center gap-8 px-[120px] py-20">
      <h2 className="whitespace-pre-line text-center text-5xl leading-[1.1] font-bold text-white">
        Conoce a Los{"\n"}Conferencistas Talentosos
      </h2>
      <p className="max-w-[900px] text-center text-sm font-normal text-[#999999]">
        Compartirán su experiencia y se involucrarán frente a nosotros con todo su esfuerzo. Para
        hacer el evento más atractivo y exitoso.
      </p>

      <div className="flex w-full justify-center gap-6">
        {featuredSpeakers.map((speaker) => (
          <article
            key={speaker.name}
            className="flex h-[380px] w-[280px] flex-col items-center justify-center rounded-2xl p-4"
            style={{ backgroundColor: speaker.cardColor }}
          >
            <div
              className="h-[280px] w-full rounded-xl bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${speaker.image})` }}
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
