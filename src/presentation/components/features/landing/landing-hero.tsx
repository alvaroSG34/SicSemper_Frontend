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
        className="flex h-[76px] w-full max-w-[360px] items-center justify-center rounded-[38px] bg-[color:var(--landing-pink)] px-8 text-[22px] font-bold tracking-[0.02em] text-[color:var(--landing-text)] shadow-[0_18px_40px_rgba(83,184,180,0.32)] transition-transform duration-300 hover:scale-[1.02] md:h-[92px] md:max-w-[440px] md:text-[28px]"
      >
        Sube tu Maqueta
      </button>
    </section>
  );
}
