"use client";

import { Award, Building2, Medal } from "lucide-react";
import { Outfit } from "next/font/google";
import type { ParticipantClubRanking } from "@/domain/participant/participant.types";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantClubRankingCardProps = {
  ranking: ParticipantClubRanking | null;
};

export function ParticipantClubRankingCard({ ranking }: ParticipantClubRankingCardProps) {
  if (!ranking) {
    return null;
  }

  return (
    <article className="rounded-3xl border border-[#2F2F2F] bg-[#121212] p-6 sm:p-7 xl:p-8">
      <div className="flex items-center justify-between gap-3">
        <h3 className={`${outfit.className} text-2xl font-semibold text-white`}>Tu posicion en el club</h3>
        <Award className="h-6 w-6 text-[#F15BB5]" />
      </div>

      <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#BDBDBD]">
        <Building2 className="h-4 w-4" />
        {ranking.clubName}
      </p>

      {ranking.enabled ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#5B68F1]/50 bg-[#1B2250]/40 p-4">
            <p className="text-xs uppercase tracking-[1.2px] text-[#9FB1FF]">Posicion</p>
            <p className={`${outfit.className} mt-1 text-4xl font-bold text-[#DDE4FF]`}>
              #{ranking.position}
            </p>
            <p className="mt-1 text-xs text-[#B9C5FF]">de {ranking.totalParticipants}</p>
          </div>
          <div className="rounded-2xl border border-[#333333] bg-[#171717] p-4">
            <p className="text-xs uppercase tracking-[1.2px] text-[#AFAFAF]">Promedio</p>
            <p className={`${outfit.className} mt-1 text-4xl font-bold text-white`}>
              {ranking.averageScore?.toFixed(2) ?? "0.00"}
            </p>
          </div>
          <div className="rounded-2xl border border-[#333333] bg-[#171717] p-4">
            <p className="text-xs uppercase tracking-[1.2px] text-[#AFAFAF]">Calificadas</p>
            <p className={`${outfit.className} mt-1 text-4xl font-bold text-white`}>
              {ranking.scoredModels}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-[#333333] bg-[#171717] p-4 text-sm text-[#BDBDBD]">
          <p className="inline-flex items-center gap-2">
            <Medal className="h-4 w-4 text-[#F15BB5]" />
            {ranking.message ?? "No hay informacion disponible para ranking."}
          </p>
        </div>
      )}
    </article>
  );
}

