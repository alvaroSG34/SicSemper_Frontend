"use client";

import { ParticipantMyModels } from "./participant-my-models";
import { useParticipantModels } from "./use-participant-models";
import { useParticipantStore } from "@/presentation/stores";

type ParticipantModelsSectionProps = {
  effectiveUserId: string;
  initialEventFilterId?: string | null;
};

export function ParticipantModelsSection({
  effectiveUserId,
  initialEventFilterId,
}: ParticipantModelsSectionProps) {
  const { myModels, loading } = useParticipantModels({ effectiveUserId });
  const updateModel = useParticipantStore((state) => state.updateModel);
  const deleteModel = useParticipantStore((state) => state.deleteModel);

  return (
    <ParticipantMyModels
      models={myModels}
      loading={loading}
      initialEventFilterId={initialEventFilterId}
      onUpdateModel={(payload) => updateModel({ ...payload, userId: effectiveUserId })}
      onDeleteModel={(modelId) => deleteModel({ modelId, userId: effectiveUserId })}
    />
  );
}
