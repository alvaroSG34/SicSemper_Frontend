"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Loader2 } from "lucide-react";
import { Outfit } from "next/font/google";
import type { ParticipantNextChallenge } from "@/domain/participant/participant.types";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantNextChallengeProps = {
  challenge: ParticipantNextChallenge;
  onStartUpload?: () => void;
  isStartingUpload?: boolean;
};

type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
};

const ZERO_COUNTDOWN: CountdownParts = {
  days: "00",
  hours: "00",
  minutes: "00",
};

const toTwoDigits = (value: number) => String(Math.max(value, 0)).padStart(2, "0");

const normalizeCountdownPart = (value: string) => {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric) || numeric < 0) {
    return "00";
  }

  return toTwoDigits(numeric);
};

const buildCountdownFromStartDate = (
  startDate: string | null | undefined,
  referenceNow: number = Date.now(),
): CountdownParts | null => {
  if (!startDate) {
    return null;
  }

  const targetDate = new Date(startDate);
  if (Number.isNaN(targetDate.getTime())) {
    return null;
  }

  const remainingMs = Math.max(targetDate.getTime() - referenceNow, 0);
  const totalMinutes = Math.floor(remainingMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    days: toTwoDigits(days),
    hours: toTwoDigits(hours),
    minutes: toTwoDigits(minutes),
  };
};

const startDateFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function ParticipantNextChallenge({
  challenge,
  onStartUpload,
  isStartingUpload = false,
}: ParticipantNextChallengeProps) {
  const shouldShowCategoryLine = !challenge.categoryLine.trim().toLowerCase().startsWith("club:");

  const fallbackCountdown = useMemo<CountdownParts>(
    () => ({
      days: normalizeCountdownPart(challenge.countdown.days),
      hours: normalizeCountdownPart(challenge.countdown.hours),
      minutes: normalizeCountdownPart(challenge.countdown.minutes),
    }),
    [challenge.countdown.days, challenge.countdown.hours, challenge.countdown.minutes],
  );

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!challenge.startDate) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [challenge.startDate]);

  const countdown = useMemo<CountdownParts>(() => {
    if (!challenge.startDate) {
      return fallbackCountdown;
    }

    return buildCountdownFromStartDate(challenge.startDate, now) ?? ZERO_COUNTDOWN;
  }, [challenge.startDate, fallbackCountdown, now]);

  const isEventInCourse =
    challenge.startDate !== null &&
    challenge.startDate !== undefined &&
    countdown.days === "00" &&
    countdown.hours === "00" &&
    countdown.minutes === "00";

  const parsedStartDate = challenge.startDate ? new Date(challenge.startDate) : null;
  const formattedStartDate =
    parsedStartDate && !Number.isNaN(parsedStartDate.getTime())
      ? startDateFormatter.format(parsedStartDate)
      : null;

  return (
    <section className="rounded-3xl border border-[#2F2F2F] bg-[#121212] p-6 sm:p-7 xl:p-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-[2px] text-[#F15BB5]">{challenge.eyebrow}</p>
            <h2 className={`${outfit.className} text-3xl font-bold leading-tight text-white sm:text-4xl`}>
              {challenge.title}
            </h2>
            {shouldShowCategoryLine ? <p className="text-base text-[#C9C9C9]">{challenge.categoryLine}</p> : null}
          </div>

          <p className="text-base font-medium text-[#AFAFAF]">{challenge.organizer}</p>

          <div className="flex flex-wrap items-center gap-3">
            {formattedStartDate ? (
              <p className="inline-flex items-center gap-2 rounded-full border border-[#3B3B3B] px-3 py-1.5 text-sm text-[#D6D6D6]">
                <CalendarDays className="h-4 w-4" />
                Inicio: {formattedStartDate}
              </p>
            ) : null}

            {challenge.eventId ? (
              <button
                type="button"
                onClick={onStartUpload}
                disabled={isStartingUpload}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#3B62EA]/70 bg-[#1D2E63]/40 px-4 text-sm font-semibold text-[#D6E2FF] transition hover:border-[#4A75FF] hover:bg-[#223980] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStartingUpload ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  "Subir Maqueta"
                )}
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-[#343434] bg-[#0F0F0F] p-4 sm:p-5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[1.2px] text-[#CFCFCF]">
            <Clock3 className="h-4 w-4 text-[#8EA7FF]" />
            {isEventInCourse ? "Evento en curso" : "Comienza en"}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#3A3A3A] bg-[#151515] px-3 py-4 text-center">
              <p className={`${outfit.className} text-3xl font-bold leading-none text-white sm:text-4xl`}>{countdown.days}</p>
              <p className="mt-2 text-sm uppercase tracking-[1px] text-[#A9A9A9]">Dias</p>
            </div>
            <div className="rounded-xl border border-[#3A3A3A] bg-[#151515] px-3 py-4 text-center">
              <p className={`${outfit.className} text-3xl font-bold leading-none text-white sm:text-4xl`}>{countdown.hours}</p>
              <p className="mt-2 text-sm uppercase tracking-[1px] text-[#A9A9A9]">Horas</p>
            </div>
            <div className="rounded-xl border border-[#3A3A3A] bg-[#151515] px-3 py-4 text-center">
              <p className={`${outfit.className} text-3xl font-bold leading-none text-white sm:text-4xl`}>{countdown.minutes}</p>
              <p className="mt-2 text-sm uppercase tracking-[1px] text-[#A9A9A9]">Min</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
