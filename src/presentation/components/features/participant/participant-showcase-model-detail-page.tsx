"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantShowcaseModelDetailSection } from "./participant-showcase-model-detail-section";

type ParticipantShowcaseModelDetailPageProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  modelId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
};

export function ParticipantShowcaseModelDetailPage({
  eventId,
  level1Id,
  finalCategoryId,
  modelId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
}: ParticipantShowcaseModelDetailPageProps) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => (
        <ParticipantShowcaseModelDetailSection
          eventId={eventId}
          level1Id={level1Id}
          finalCategoryId={finalCategoryId}
          modelId={modelId}
          level1Name={level1Name}
          level2Name={level2Name}
          level2Id={level2Id}
          finalCategoryName={finalCategoryName}
        />
      )}
    </ParticipantDashboardShell>
  );
}
