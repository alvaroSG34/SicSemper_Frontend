import { CalendarDays, MapPin } from "lucide-react";
import { Outfit } from "next/font/google";
import type { ParticipantEventDetail } from "@/domain/participant/participant.types";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantEventsExplorerProps = {
  events: ParticipantEventDetail[];
  selectedEventId: string | null;
  loading?: boolean;
  onSelectEvent: (eventId: string) => void;
};

export function ParticipantEventsExplorer({
  events,
  selectedEventId,
  loading = false,
  onSelectEvent,
}: ParticipantEventsExplorerProps) {
  return (
    <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className={`${outfit.className} text-[22px] font-semibold text-white`}>Eventos proximos</h3>
        <span className="text-xs uppercase tracking-[1.5px] text-[#8D8D8D]">Explorar eventos</span>
      </div>

      {loading ? <p className="text-sm text-[#9C9C9C]">Cargando eventos...</p> : null}

      {!loading && events.length === 0 ? (
        <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
          No hay eventos proximos disponibles.
        </p>
      ) : null}

      <div className="space-y-3">
        {events.map((event) => {
          const isSelected = selectedEventId === event.id;
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelectEvent(event.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? "border-[#5B68F1] bg-[#1F2444]"
                  : "border-[#2D2D2D] bg-[#1A1A1A] hover:border-[#3A3A3A]"
              }`}
            >
              <p className="text-sm font-semibold text-white">{event.name}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#AFAFAF]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.place}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {event.startDate} - {event.endDate}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </article>
  );
}

