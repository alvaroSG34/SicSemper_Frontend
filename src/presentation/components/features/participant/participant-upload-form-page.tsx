"use client";

import { useRouter } from "next/navigation";
import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantUploadFormSection } from "./participant-upload-form-section";

type ParticipantUploadFormPageProps = {
  eventId: string;
  level1Id: string;
  finalCategoryId: string;
  level1Name: string;
  level2Name: string | null;
  level2Id: string | null;
  finalCategoryName: string;
};

export function ParticipantUploadFormPage({
  eventId,
  level1Id,
  finalCategoryId,
  level1Name,
  level2Name,
  level2Id,
  finalCategoryName,
}: ParticipantUploadFormPageProps) {
  const router = useRouter();

  return (
    <ParticipantDashboardShell activeSection="eventos">
      {({ effectiveUserId, clearFlowState }) => (
        <ParticipantUploadFormSection
          eventId={eventId}
          userId={effectiveUserId}
          level1Id={level1Id}
          finalCategoryId={finalCategoryId}
          level1Name={level1Name}
          level2Name={level2Name}
          level2Id={level2Id}
          finalCategoryName={finalCategoryName}
          onGoToMyModelsByEvent={(targetEventId) => {
            clearFlowState();
            router.push(`/participante/maquetas?eventId=${encodeURIComponent(targetEventId)}`);
          }}
        />
      )}
    </ParticipantDashboardShell>
  );
}
