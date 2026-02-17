import { eventsCopy } from "./landing-data";

export function LandingEvents() {
  return (
    <section className="flex w-full items-center justify-between gap-[60px] px-[120px] py-[100px]">
      <div className="flex w-[500px] flex-col gap-6">
        <h2 className="whitespace-pre-line text-5xl leading-[1.1] font-bold text-white">
          {eventsCopy.title}
        </h2>
        <p className="text-base font-semibold text-white">{eventsCopy.subtitle}</p>
        <p className="whitespace-pre-line text-sm leading-[1.6] font-normal text-[#999999]">
          {eventsCopy.descriptionOne}
        </p>
        <p className="whitespace-pre-line text-sm leading-[1.6] font-normal text-[#999999]">
          {eventsCopy.descriptionTwo}
        </p>
      </div>

      <div
        className="h-[340px] w-[500px] rounded-2xl bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${eventsCopy.image})` }}
      />
    </section>
  );
}
