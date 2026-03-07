import { Outfit } from "next/font/google";
import { ArrowRight } from "lucide-react";
import type { ParticipantOpenEvent } from "@/domain/participant/participant.types";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantOpenEventsProps = {
  events: ParticipantOpenEvent[];
  onViewAll?: () => void;
  onOpenEvent?: (eventId: string) => void;
};

export function ParticipantOpenEvents({ events, onViewAll, onOpenEvent }: ParticipantOpenEventsProps) {
  return (
    <article className="flex flex-col gap-6 rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className={`${outfit.className} text-[24px] font-semibold text-white`}>Eventos Abiertos</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="h-11 rounded-lg border border-[#3A3A3A] px-3 text-sm font-semibold text-[#8EA7FF] transition hover:border-[#4A4A4A] hover:text-[#B9C9FF]"
        >
          <span className="inline-flex items-center gap-1">
            Ver todo
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-[#333333] bg-[#111111] p-4">
          <p className="text-base text-[#BEBEBE]">No hay eventos activos por el momento.</p>
        </div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="flex flex-col gap-4 rounded-2xl border border-[#333333] bg-[#111111] p-5">
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-white">{event.title}</h4>
              <p className="text-base leading-relaxed text-[#C2C2C2]">{event.description}</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenEvent?.(event.id)}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-[#3B62EA]/70 bg-[#1D2E63]/40 px-4 text-base font-semibold text-[#D6E2FF] transition hover:border-[#4A75FF] hover:bg-[#223980] sm:w-auto"
            >
              {event.ctaLabel}
            </button>
          </div>
        ))
      )}
    </article>
  );
}
