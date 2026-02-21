import { Outfit } from "next/font/google";
import type { ParticipantNextChallenge } from "@/domain/participant/participant.types";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantNextChallengeProps = {
  challenge: ParticipantNextChallenge;
};

export function ParticipantNextChallenge({ challenge }: ParticipantNextChallengeProps) {
  return (
    <section className="flex w-full flex-col gap-8 rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 md:p-8 xl:h-[280px] xl:flex-row xl:items-stretch xl:justify-between xl:p-10">
      <div className="flex flex-1 flex-col justify-between gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold tracking-[2px] text-[#F15BB5]">{challenge.eyebrow}</p>
          <h2
            className={`${outfit.className} text-3xl leading-tight font-bold text-white sm:text-4xl xl:text-5xl xl:leading-none`}
          >
            {challenge.title}
          </h2>
          <p className="text-sm text-[#AAAAAA] sm:text-base xl:text-lg">{challenge.categoryLine}</p>
        </div>

        <p className="text-sm font-medium text-[#666666]">{challenge.organizer}</p>

        <div className="flex items-start gap-4 sm:gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-[28px] leading-none font-semibold text-white sm:text-[32px]">
              {challenge.countdown.days}
            </span>
            <span className="text-xs text-[#666666]">Días</span>
          </div>
          <span className="text-[28px] leading-none text-[#333333] sm:text-[32px]">:</span>
          <div className="flex flex-col gap-1">
            <span className="text-[28px] leading-none font-semibold text-white sm:text-[32px]">
              {challenge.countdown.hours}
            </span>
            <span className="text-xs text-[#666666]">Hs</span>
          </div>
          <span className="text-[28px] leading-none text-[#333333] sm:text-[32px]">:</span>
          <div className="flex flex-col gap-1">
            <span className="text-[28px] leading-none font-semibold text-white sm:text-[32px]">
              {challenge.countdown.minutes}
            </span>
            <span className="text-xs text-[#666666]">Min</span>
          </div>
        </div>
      </div>

      <div
        aria-label={challenge.imageAlt}
        className="h-[180px] w-full rounded-2xl border border-white/10 bg-white sm:h-[200px] xl:h-[200px] xl:w-[300px]"
      />
    </section>
  );
}
