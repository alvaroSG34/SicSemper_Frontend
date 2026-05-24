"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantShowcaseLegacyScaleRedirect } from "./participant-showcase-legacy-scale-redirect";

type ParticipantShowcaseLegacyScaleRedirectPageProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
};

export function ParticipantShowcaseLegacyScaleRedirectPage({
  eventId,
  level1Id,
  finalCategoryId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
}: ParticipantShowcaseLegacyScaleRedirectPageProps) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => (
        <ParticipantShowcaseLegacyScaleRedirect
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

