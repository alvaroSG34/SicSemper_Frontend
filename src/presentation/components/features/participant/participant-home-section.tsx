"use client";

import { ParticipantKpis } from "./participant-kpis";
import { ParticipantNextChallenge } from "./participant-next-challenge";
import { useParticipantHome } from "./use-participant-home";

type ParticipantHomeSectionProps = {
  onGoToResults: () => void;
};

export function ParticipantHomeSection({ onGoToResults }: ParticipantHomeSectionProps) {
  const {
    challenge,
    kpis,
    isStartingUploadFromNextChallenge,
    handleStartUploadFromNextChallenge,
  } = useParticipantHome({
    onGoToResults,
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
      <ParticipantKpis kpis={kpis} />
    </section>
  );
}
