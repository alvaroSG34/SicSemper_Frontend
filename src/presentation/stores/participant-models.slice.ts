import type { ParticipantModel } from "@/domain/participant/participant.types";
import { useParticipantStore } from "./participant.store";

export type ParticipantModelsSlice = {
  myModels: ParticipantModel[];
  myModelsLoading: boolean;
  loadMyModels: (userId: string) => Promise<void>;
};

export const useParticipantModelsSlice = (): ParticipantModelsSlice => {
  const myModels = useParticipantStore((state) => state.myModels);
  const myModelsLoading = useParticipantStore((state) => state.myModelsLoading);
  const loadMyModels = useParticipantStore((state) => state.loadMyModels);

  return {
    myModels,
    myModelsLoading,
    loadMyModels,
  };
};
