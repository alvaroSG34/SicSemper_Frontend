import { Outfit } from "next/font/google";
import { BadgeCheck, Clock3 } from "lucide-react";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantCompetition = {
  id: string;
  title: string;
  subtitle: string;
  status: "CONFIRMADO" | "PENDIENTE";
};

type ParticipantCompetitionsProps = {
  competitions: ParticipantCompetition[];
};

export function ParticipantCompetitions({ competitions }: ParticipantCompetitionsProps) {
  return (
    <article className="flex flex-col gap-6 rounded-3xl bg-[#121212] p-5 sm:p-6 xl:p-8">
      <h3 className={`${outfit.className} text-[20px] font-semibold text-white`}>Participaciones</h3>

      <div className="flex flex-col gap-4">
        {competitions.map((competition) => (
          <div
            key={competition.id}
            className="flex flex-col gap-3 rounded-xl bg-[#1A1A1A] p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <p className="whitespace-pre-line text-sm font-medium text-[#EEEEEE]">
              {competition.title}
              {"\n"}
              {competition.subtitle}
            </p>
            {competition.status === "CONFIRMADO" ? (
              <span className="inline-flex items-center gap-1 text-xs text-[#10B981]">
                <BadgeCheck className="h-3.5 w-3.5" />
                Confirmado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-[#F59E0B]">
                <Clock3 className="h-3.5 w-3.5" />
                Pendiente
              </span>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}
