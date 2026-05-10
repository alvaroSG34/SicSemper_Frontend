"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantUploadLevelThreeSection } from "./participant-upload-level-three-section";

type ParticipantUploadLevelThreePageProps = {
  eventId: string;
  level1Id: string;
  level2Id: string;
  level1Name: string;
  level2Name: string;
};

export function ParticipantUploadLevelThreePage({
  eventId,
  level1Id,
  level2Id,
  level1Name,
  level2Name,
}: ParticipantUploadLevelThreePageProps) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => (
        <ParticipantUploadLevelThreeSection
          eventId={eventId}
          level1Id={level1Id}
          level2Id={level2Id}
          level1Name={level1Name}
          level2Name={level2Name}
        />
      )}
    </ParticipantDashboardShell>
  );
}
