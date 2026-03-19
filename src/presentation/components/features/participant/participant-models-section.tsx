"use client";

import { ParticipantMyModels } from "./participant-my-models";
import { useParticipantModels } from "./use-participant-models";

type ParticipantModelsSectionProps = {
  effectiveUserId: string;
};

export function ParticipantModelsSection({ effectiveUserId }: ParticipantModelsSectionProps) {
  const { myModels, loading } = useParticipantModels({ effectiveUserId });

  return <ParticipantMyModels models={myModels} loading={loading} />;
}
