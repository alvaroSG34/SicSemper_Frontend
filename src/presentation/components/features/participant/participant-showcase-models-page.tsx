"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantShowcaseModelsSection } from "./participant-showcase-models-section";

type ParticipantShowcaseModelsPageProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
};

export function ParticipantShowcaseModelsPage({
  eventId,
  level1Id,
  finalCategoryId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
}: ParticipantShowcaseModelsPageProps) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => (
        <ParticipantShowcaseModelsSection
          eventId={eventId}
          level1Id={level1Id}
          finalCategoryId={finalCategoryId}
          level1Name={level1Name}
          level2Name={level2Name}
          level2Id={level2Id}
          finalCategoryName={finalCategoryName}
        />
      )}
    </ParticipantDashboardShell>
  );
}

