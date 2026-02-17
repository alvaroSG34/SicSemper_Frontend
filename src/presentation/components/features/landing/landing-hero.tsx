import { heroDate, heroTitle } from "./landing-data";

export function LandingHero() {
  return (
    <section className="flex w-full flex-col items-center gap-12 px-[120px] py-20">
      <p className="text-[15px] font-normal tracking-[1px] text-[#ff6b9d]">{heroDate}</p>
      <h1 className="whitespace-pre-line text-center text-[56px] leading-[1.2] font-bold text-white">
        {heroTitle}
      </h1>
      <button
        type="button"
        className="flex h-[50px] w-[200px] items-center justify-center rounded-[25px] bg-[#ff6b9d] text-[14px] font-bold text-white"
      >
        Sube tu Maqueta
      </button>
    </section>
  );
}
