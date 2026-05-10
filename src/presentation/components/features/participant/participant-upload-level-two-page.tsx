"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantUploadLevelTwoSection } from "./participant-upload-level-two-section";

type ParticipantUploadLevelTwoPageProps = {
  eventId: string;
  level1Id: string;
  level1Name: string;
};

export function ParticipantUploadLevelTwoPage({
  eventId,
  level1Id,
  level1Name,
}: ParticipantUploadLevelTwoPageProps) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => (
        <ParticipantUploadLevelTwoSection
          eventId={eventId}
          level1Id={level1Id}
          level1Name={level1Name}
        />
      )}
    </ParticipantDashboardShell>
  );
}
