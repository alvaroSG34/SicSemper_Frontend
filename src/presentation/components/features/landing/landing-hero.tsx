import { heroDate, heroTitle } from "./landing-data";

export function LandingHero() {
  return (
    <section
      id="inicio"
      className="flex w-full flex-col items-center gap-8 px-6 py-16 text-center md:px-10 xl:gap-12 xl:px-[120px] xl:py-20"
    >
      <p className="text-[15px] font-normal tracking-[1px] text-[color:var(--landing-pink)]">
        {heroDate}
      </p>
      <h1 className="whitespace-pre-line text-4xl leading-[1.2] font-bold text-[color:var(--landing-text)] md:text-5xl xl:text-[56px]">
        {heroTitle}
      </h1>
      <button
        type="button"
        className="flex h-[50px] w-[200px] items-center justify-center rounded-[25px] bg-[color:var(--landing-pink)] text-[14px] font-bold text-[color:var(--landing-text)]"
      >
        Sube tu Maqueta
      </button>
    </section>
  );
}
