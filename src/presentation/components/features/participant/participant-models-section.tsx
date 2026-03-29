"use client";

import { ParticipantMyModels } from "./participant-my-models";
import { useParticipantModels } from "./use-participant-models";

type ParticipantModelsSectionProps = {
  effectiveUserId: string;
  initialEventFilterId?: string | null;
};

export function ParticipantModelsSection({ effectiveUserId, initialEventFilterId }: ParticipantModelsSectionProps) {
  const { myModels, loading } = useParticipantModels({ effectiveUserId });

  return <ParticipantMyModels models={myModels} loading={loading} initialEventFilterId={initialEventFilterId} />;
}
