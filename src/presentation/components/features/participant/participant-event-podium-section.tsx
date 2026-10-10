"use client";

import Link from "next/link";
import { AdminEventPodiumSection } from "@/presentation/components/features/admin/admin-event-podium-section";
import { participantEventPodiumService } from "@/application/participant/participant-event-podium.service";
import type { AdminEventPodiumInitialSelection } from "@/presentation/components/features/admin/use-admin-event-podium";

export function ParticipantEventPodiumSection({
  eventId,
  initialSelection,
}: {
  eventId: string;
  initialSelection?: AdminEventPodiumInitialSelection;
}) {
  const detailHref = (
    selectedEventId: string,
    modelId: string,
    selection: AdminEventPodiumInitialSelection,
  ) => {
    const query = new URLSearchParams();
    if (selection.selectedPath && selection.selectedPath.length > 0) {
      query.set("path", selection.selectedPath.join(","));
    }
    if (selection.finalCategoryId) {
      query.set("finalCategoryId", selection.finalCategoryId);
    }
    if (selection.selectedSegment?.scaleId) {
      query.set("scaleId", selection.selectedSegment.scaleId);
    }
    if (selection.selectedSegment?.groupId) {
      query.set("groupId", selection.selectedSegment.groupId);
    }

    const queryString = query.toString();
    return `/participante/eventos/${encodeURIComponent(selectedEventId)}/maquetas/${encodeURIComponent(modelId)}${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <section className="space-y-4">
      <Link
        href="/participante/eventos"
        className="inline-flex h-9 items-center rounded-[18px] border border-[#303030] px-4 text-xs font-semibold text-[#D7D7D7]"
      >
        Volver a eventos
      </Link>
      <AdminEventPodiumSection
        eventId={eventId}
        service={participantEventPodiumService}
        modelDetailHref={detailHref}
        initialSelection={initialSelection}
      />
    </section>
  );
}

