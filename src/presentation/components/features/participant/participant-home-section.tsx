"use client";

import { ParticipantKpis } from "./participant-kpis";
import { ParticipantClubRankingCard } from "./participant-club-ranking-card";
import { ParticipantNextChallenge } from "./participant-next-challenge";
import { useParticipantHome } from "./use-participant-home";

type ParticipantHomeSectionProps = {
  onStartUpload: (eventId: string) => void;
};

export function ParticipantHomeSection({ onStartUpload }: ParticipantHomeSectionProps) {
  const {
    challenge,
    kpis,
    clubRanking,
    isStartingUploadFromNextChallenge,
    handleStartUploadFromNextChallenge,
  } = useParticipantHome({
    onStartUpload,
  });

  if (!challenge) {
    return null;
  }

  return (
    <section className="space-y-5">
      <ParticipantNextChallenge
        challenge={challenge}
        onStartUpload={handleStartUploadFromNextChallenge}
        isStartingUpload={isStartingUploadFromNextChallenge}
      />
      <ParticipantClubRankingCard ranking={clubRanking} />
      <ParticipantKpis kpis={kpis} />
    </section>
  );
}
