"use client";

import { ParticipantDashboardShell } from "./participant-dashboard-shell";
import { ParticipantEventPodiumSection } from "./participant-event-podium-section";
import type { AdminEventPodiumInitialSelection } from "@/presentation/components/features/admin/use-admin-event-podium";

export function ParticipantEventPodiumPage({
  eventId,
  initialSelection,
}: {
  eventId: string;
  initialSelection?: AdminEventPodiumInitialSelection;
}) {
  return (
    <ParticipantDashboardShell activeSection="eventos">
      {() => (
        <ParticipantEventPodiumSection
          eventId={eventId}
          initialSelection={initialSelection}
        />
      )}
    </ParticipantDashboardShell>
  );
}

