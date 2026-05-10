"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantShowcaseLevelTwoSection } from "./participant-showcase-level-two-section";

type ParticipantShowcaseLevelTwoPageProps = {
  eventId: string;
  level1Id: string;
  level1Name: string;
};

export function ParticipantShowcaseLevelTwoPage({
  eventId,
  level1Id,
  level1Name,
}: ParticipantShowcaseLevelTwoPageProps) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => (
        <ParticipantShowcaseLevelTwoSection
          eventId={eventId}
          level1Id={level1Id}
          level1Name={level1Name}
        />
      )}
    </ParticipantDashboardShell>
  );
}

