import { useState } from "react";
import { useParticipantHomeSlice } from "@/presentation/stores/participant-home.slice";

type UseParticipantHomeParams = {
  onStartUpload: (eventId: string) => void;
};

export const useParticipantHome = ({ onStartUpload }: UseParticipantHomeParams) => {
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
          onStartUpload(eventId);
        }
      } finally {
        setIsStartingUploadFromNextChallenge(false);
      }
    })();
  };

  return {
    challenge: dashboard?.nextChallenge ?? null,
    kpis: dashboard?.kpis ?? [],
    clubRanking: dashboard?.clubRanking ?? null,
    isStartingUploadFromNextChallenge,
    handleStartUploadFromNextChallenge,
  };
};
