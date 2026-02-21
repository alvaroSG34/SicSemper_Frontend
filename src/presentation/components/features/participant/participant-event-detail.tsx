import { CalendarRange, MapPin, Sparkles } from "lucide-react";
import { Outfit } from "next/font/google";
import type { ParticipantEventDetail } from "@/domain/participant/participant.types";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantEventDetailProps = {
  event: ParticipantEventDetail | null;
  onStartUpload: () => void;
};

export function ParticipantEventDetail({ event, onStartUpload }: ParticipantEventDetailProps) {
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
          {event.startDate} - {event.endDate}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#2D2D2D] px-3 py-1">
          <Sparkles className="h-4 w-4" />
          Estado: {event.status}
        </span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-[#B5B5B5]">{event.description}</p>

      <button
        type="button"
        onClick={onStartUpload}
        className="mt-7 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#5B68F1] px-6 text-base font-semibold text-white shadow-[0_12px_36px_rgba(91,104,241,0.32)] transition hover:bg-[#6975f3]"
      >
        Subir maqueta
      </button>
    </article>
  );
}

