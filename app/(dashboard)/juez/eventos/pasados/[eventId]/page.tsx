import Link from "next/link";
import { JudgeQueueSection } from "@/presentation/components/features/judge/judge-queue-section";
import { judgeHeadingFont } from "@/presentation/components/features/judge/judge-heading-font";

export default async function JudgePastEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#1E1E1E] bg-[#0F0F0F] p-4">
        <div>
          <p className="text-xs uppercase tracking-[1.5px] text-[#8BA3FF]">Consulta histórica</p>
          <h2 className={`${judgeHeadingFont.className} mt-1 text-3xl font-bold text-white`}>Evaluaciones del evento</h2>
        </div>
        <Link href="/juez/eventos" className="inline-flex h-9 items-center rounded-[18px] border border-[#303030] px-4 text-xs font-semibold text-[#D7D7D7]">Volver</Link>
      </div>
      <JudgeQueueSection
        headingClassName={judgeHeadingFont.className}
        lockedEventId={eventId}
        tableView
        hideFilters={false}
        historyMode
        showLockedEventSummary={false}
      />
    </section>
  );
}
