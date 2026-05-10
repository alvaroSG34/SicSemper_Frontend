"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantUploadLevelOneSection } from "./participant-upload-level-one-section";

type ParticipantUploadLevelOnePageProps = {
  eventId: string;
};

export function ParticipantUploadLevelOnePage({
  eventId,
}: ParticipantUploadLevelOnePageProps) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => <ParticipantUploadLevelOneSection eventId={eventId} />}
    </ParticipantDashboardShell>
  );
}
