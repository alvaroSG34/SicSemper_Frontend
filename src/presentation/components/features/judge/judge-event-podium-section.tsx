"use client";

import Link from "next/link";
import { AdminEventPodiumSection } from "@/presentation/components/features/admin/admin-event-podium-section";
import { judgeEventPodiumService } from "@/application/judge/judge-event-podium.service";
import type { AdminEventPodiumInitialSelection } from "@/presentation/components/features/admin/use-admin-event-podium";

export function JudgeEventPodiumSection({
  eventId,
  historyMode = false,
  initialSelection,
}: {
  eventId: string;
  historyMode?: boolean;
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

    if (historyMode) {
      query.set("podium", "1");
      const queryString = query.toString();
      return `/juez/eventos/pasados/${encodeURIComponent(selectedEventId)}/maquetas/${encodeURIComponent(modelId)}${queryString ? `?${queryString}` : ""}`;
    }

    const queryString = query.toString();
    return `/juez/eventos/${encodeURIComponent(selectedEventId)}/maquetas/${encodeURIComponent(modelId)}${queryString ? `?${queryString}` : ""}`;
  };

  const backLinkHref = historyMode ? `/juez/eventos/pasados/${encodeURIComponent(eventId)}` : "/juez/eventos";
  const backLinkLabel = historyMode ? "Volver al evento" : "Volver a eventos";

  return (
    <section className="space-y-4">
      <Link
        href={backLinkHref}
        className="inline-flex h-9 items-center rounded-[18px] border border-[#303030] px-4 text-xs font-semibold text-[#D7D7D7]"
      >
        {backLinkLabel}
      </Link>
      <AdminEventPodiumSection
        eventId={eventId}
        service={judgeEventPodiumService}
        modelDetailHref={detailHref}
        initialSelection={initialSelection}
      />
    </section>
  );
}
