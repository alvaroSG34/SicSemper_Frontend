"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LandingContent, LandingSponsor } from "@/domain/landing/landing.types";

const AUTO_PLAY_MS = 3500;

const getItemsPerSlide = (width: number) => {
  if (width >= 1280) {
    return 3;
  }

  if (width >= 768) {
    return 2;
  }

  return 1;
};

type LandingSponsorsProps = {
  content: LandingContent;
};

function SponsorCard({ sponsor }: { sponsor: LandingSponsor }) {
  const cardClassName =
    "mx-auto flex min-h-[240px] w-full max-w-[280px] flex-col items-center justify-center gap-5 rounded-2xl border border-[color:var(--landing-border)] bg-[color:var(--landing-surface)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition hover:border-[color:var(--landing-subtle)] hover:bg-white/[0.04] md:min-h-[260px] xl:min-h-[280px]";
  const content = sponsor.logoUrl ? (
    <>
      <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-black/15 p-2 md:h-44 xl:h-48">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sponsor.logoUrl}
          alt={sponsor.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <span className="max-w-full text-center text-2xl font-bold leading-tight text-[color:var(--landing-text)] md:text-3xl">
        {sponsor.name}
      </span>
    </>
  ) : (
    <span className="max-w-full text-center text-3xl font-bold leading-tight text-[color:var(--landing-text)] md:text-4xl">
      {sponsor.name}
    </span>
  );

  if (sponsor.url) {
    return (
      <a
        href={sponsor.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Abrir sitio de ${sponsor.name}`}
        className={`${cardClassName} cursor-pointer`}
      >
        {content}
      </a>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

export function LandingSponsors({ content }: LandingSponsorsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerSlide, setItemsPerSlide] = useState(1);

  useEffect(() => {
    const updateItemsPerSlide = () => {
      setItemsPerSlide(getItemsPerSlide(window.innerWidth));
    };

    updateItemsPerSlide();
    window.addEventListener("resize", updateItemsPerSlide);

    return () => {
      window.removeEventListener("resize", updateItemsPerSlide);
    };
  }, []);

  const slides = useMemo(() => {
    const grouped: LandingSponsor[][] = [];

    for (let i = 0; i < content.sponsors.main.length; i += itemsPerSlide) {
      grouped.push(content.sponsors.main.slice(i, i + itemsPerSlide));
    }

    return grouped;
  }, [content.sponsors.main, itemsPerSlide]);

  const totalSlides = slides.length;
  const safeActiveIndex = totalSlides === 0 ? 0 : Math.min(activeIndex, totalSlides - 1);

  useEffect(() => {
    if (totalSlides <= 1 || isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, AUTO_PLAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPaused, totalSlides]);

  const goToNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  const goToPrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-8 px-6 py-16 md:px-10 xl:px-[120px] xl:py-[100px]">
      <h2 className="text-center text-4xl font-bold text-[color:var(--landing-text)] xl:text-5xl">
        Nuestros Patrocinadores
      </h2>

      <div
        className="relative w-full max-w-[900px] xl:max-w-[1200px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="overflow-hidden rounded-3xl bg-[color:var(--landing-panel)] p-3 md:p-4 xl:p-5">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${safeActiveIndex * 100}%)` }}
          >
            {slides.map((slide, slideIndex) => (
              <div key={`slide-${slideIndex}`} className="w-full shrink-0">
                <div
                  className="grid gap-3 xl:gap-4"
                  style={{ gridTemplateColumns: `repeat(${itemsPerSlide}, minmax(0, 1fr))` }}
                >
                  {slide.map((sponsor) => (
                    <SponsorCard key={`${sponsor.name}-${sponsor.logoUrl}-${sponsor.url}`} sponsor={sponsor} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {totalSlides > 1 ? (
          <>
            <button
              type="button"
              aria-label="Patrocinador anterior"
              onClick={goToPrev}
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full border border-[color:var(--landing-border)] bg-black/55 p-2 text-[color:var(--landing-text)] transition hover:bg-black/80"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Siguiente patrocinador"
              onClick={goToNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full border border-[color:var(--landing-border)] bg-black/55 p-2 text-[color:var(--landing-text)] transition hover:bg-black/80"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}
      </div>

      {totalSlides > 1 ? (
        <div className="flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              aria-label={`Ir al slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === safeActiveIndex
                  ? "bg-[color:var(--landing-text)]"
                  : "bg-[color:var(--landing-dim)] hover:bg-[color:var(--landing-subtle)]"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
