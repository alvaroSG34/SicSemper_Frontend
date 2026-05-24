"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantShowcaseScaleSelectionSection } from "./participant-showcase-scale-selection-section";

type ParticipantShowcaseScaleSelectionPageProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
};

export function ParticipantShowcaseScaleSelectionPage({
  eventId,
  level1Id,
  finalCategoryId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
}: ParticipantShowcaseScaleSelectionPageProps) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => (
        <ParticipantShowcaseScaleSelectionSection
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

