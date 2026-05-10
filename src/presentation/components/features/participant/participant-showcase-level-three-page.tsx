"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantShowcaseLevelThreeSection } from "./participant-showcase-level-three-section";

type ParticipantShowcaseLevelThreePageProps = {
  eventId: string;
  level1Id: string;
  level2Id: string;
  level1Name: string;
  level2Name: string;
};

export function ParticipantShowcaseLevelThreePage({
  eventId,
  level1Id,
  level2Id,
  level1Name,
  level2Name,
}: ParticipantShowcaseLevelThreePageProps) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => (
        <ParticipantShowcaseLevelThreeSection
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

