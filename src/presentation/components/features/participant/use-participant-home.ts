import { useState } from "react";
import { useParticipantHomeSlice } from "@/presentation/stores/participant-home.slice";

type UseParticipantHomeParams = {
  onGoToResults: () => void;
};

export const useParticipantHome = ({ onGoToResults }: UseParticipantHomeParams) => {
  const { dashboard, selectEvent } = useParticipantHomeSlice();
  const [isStartingUploadFromNextChallenge, setIsStartingUploadFromNextChallenge] = useState(false);

  const handleStartUploadFromNextChallenge = () => {
    if (isStartingUploadFromNextChallenge) {
      return;
    }

    const eventId = dashboard?.nextChallenge.eventId?.trim();
    if (!eventId) {
      return;
    }

    void (async () => {
      setIsStartingUploadFromNextChallenge(true);
      try {
        const wasSelected = await selectEvent(eventId);
        if (wasSelected) {
          onGoToResults();
        }
      } finally {
        setIsStartingUploadFromNextChallenge(false);
      }
    })();
  };

  return {
    challenge: dashboard?.nextChallenge ?? null,
    kpis: dashboard?.kpis ?? [],
    isStartingUploadFromNextChallenge,
    handleStartUploadFromNextChallenge,
  };
};
