import { useEffect } from "react";
import { useParticipantModelsSlice } from "@/presentation/stores/participant-models.slice";

type UseParticipantModelsParams = {
  effectiveUserId: string;
};

export const useParticipantModels = ({ effectiveUserId }: UseParticipantModelsParams) => {
  const { myModels, myModelsLoading, loadMyModels } = useParticipantModelsSlice();

  useEffect(() => {
    if (!effectiveUserId || myModels.length > 0) {
      return;
    }

    void loadMyModels(effectiveUserId);
  }, [effectiveUserId, loadMyModels, myModels.length]);

  return {
    myModels,
    loading: myModelsLoading && myModels.length === 0,
  };
};
