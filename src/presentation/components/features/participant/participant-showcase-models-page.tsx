"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantShowcaseModelsSection } from "./participant-showcase-models-section";

type ParticipantShowcaseModelsPageProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  scaleId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
  scaleLabel: string;
  segmentType: "scale" | "group";
};

export function ParticipantShowcaseModelsPage({
  eventId,
  level1Id,
  finalCategoryId,
  scaleId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
  scaleLabel,
  segmentType,
}: ParticipantShowcaseModelsPageProps) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => (
        <ParticipantShowcaseModelsSection
          eventId={eventId}
          level1Id={level1Id}
          finalCategoryId={finalCategoryId}
          scaleId={scaleId}
          level1Name={level1Name}
          level2Name={level2Name}
          level2Id={level2Id}
          finalCategoryName={finalCategoryName}
          scaleLabel={scaleLabel}
          segmentType={segmentType}
        />
      )}
    </ParticipantDashboardShell>
  );
}

