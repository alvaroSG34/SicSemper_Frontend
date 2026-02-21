import { Outfit } from "next/font/google";
import { ArrowRight } from "lucide-react";
import type { ParticipantOpenEvent } from "@/domain/participant/participant.types";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantOpenEventsProps = {
  events: ParticipantOpenEvent[];
};

export function ParticipantOpenEvents({ events }: ParticipantOpenEventsProps) {
  return (
    <article className="flex flex-col gap-6 rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Eventos Abiertos</h3>
        <button type="button" className="text-sm font-semibold text-[#5B68F1]">
          <span className="inline-flex items-center gap-1">
            Ver todo
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>

      {events.map((event) => (
        <div key={event.id} className="flex flex-col gap-4 rounded-2xl bg-[#1A1A1A] p-5">
          <h4 className="text-base font-semibold text-white">{event.title}</h4>
          <p className="text-[13px] text-[#999999]">{event.description}</p>
          <button
            type="button"
            className="flex h-9 w-[140px] items-center justify-center rounded-[18px] bg-[#2D2D2D] text-xs font-semibold text-white"
          >
            {event.ctaLabel}
          </button>
        </div>
      ))}
    </article>
  );
}
