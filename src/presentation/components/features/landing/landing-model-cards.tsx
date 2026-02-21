import Image from "next/image";
import { modelCards } from "./landing-data";

export function LandingModelCards() {
  return (
    <section className="flex w-full flex-wrap justify-center gap-6 px-6 py-0 md:px-10 xl:flex-nowrap xl:px-[120px]">
      {modelCards.map((model) => (
        <article
          key={model.name}
          className="flex h-[340px] w-[280px] flex-col rounded-[12px] bg-[color:var(--landing-bg)] p-3"
        >
          <Image
            src={model.image}
            alt={model.name}
            width={256}
            height={220}
            className="h-[220px] w-full rounded-lg object-cover"
          />
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-[10px] font-semibold tracking-[1.3px] text-[color:var(--landing-pink)] uppercase">
              {model.category}
            </p>
            <h3 className="text-xl leading-[1.15] font-bold text-[color:var(--landing-text)]">
              {model.name}
            </h3>
            <p className="text-xs font-medium text-[color:var(--landing-muted)]">
              Escala: <span className="font-semibold text-[color:var(--landing-text)]">{model.scale}</span>
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
