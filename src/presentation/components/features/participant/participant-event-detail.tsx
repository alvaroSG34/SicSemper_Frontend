import { CalendarRange, MapPin, Sparkles } from "lucide-react";
import { Outfit } from "next/font/google";
import type { ParticipantEventDetail } from "@/domain/participant/participant.types";
import { formatEventDateRangeInLaPaz } from "@/core/utils/event-datetime";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantEventDetailProps = {
  event: ParticipantEventDetail | null;
};

export function ParticipantEventDetail({ event }: ParticipantEventDetailProps) {
  if (!event) {
    return (
      <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6 xl:p-8">
        <p className="text-sm text-[#9C9C9C]">
          Selecciona un evento para ver su informacion y comenzar la carga de maqueta.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6 xl:p-8">
      <p className="mb-2 text-xs font-semibold tracking-[1.8px] text-[#F15BB5]">DETALLE DEL EVENTO</p>
      <h3 className={`${outfit.className} text-[26px] font-bold text-white`}>{event.name}</h3>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#CFCFCF]">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#2D2D2D] px-3 py-1">
          <MapPin className="h-4 w-4" />
          {event.place}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#2D2D2D] px-3 py-1">
          <CalendarRange className="h-4 w-4" />
          {formatEventDateRangeInLaPaz(event.startDate, event.endDate, "Por definir")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#2D2D2D] px-3 py-1">
          <Sparkles className="h-4 w-4" />
          Estado: {event.status}
        </span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-[#B5B5B5]">{event.description}</p>
    </article>
  );
}

