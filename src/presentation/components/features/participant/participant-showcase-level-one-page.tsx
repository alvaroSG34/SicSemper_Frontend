"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantShowcaseLevelOneSection } from "./participant-showcase-level-one-section";

type ParticipantShowcaseLevelOnePageProps = {
  eventId: string;
};

export function ParticipantShowcaseLevelOnePage({
  eventId,
}: ParticipantShowcaseLevelOnePageProps) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => <ParticipantShowcaseLevelOneSection eventId={eventId} />}
    </ParticipantDashboardShell>
  );
}

