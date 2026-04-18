import Link from "next/link";
import { JudgeQueueSection } from "@/presentation/components/features/judge/judge-queue-section";
import { judgeHeadingFont } from "@/presentation/components/features/judge/judge-heading-font";

type JuezCalificarMaquetasPageProps = {
  params: Promise<{
    eventId: string;
    level1Id: string;
    finalCategoryId: string;
  }>;
  searchParams?: Promise<{
    l1?: string | string[];
    l2?: string | string[];
    l2id?: string | string[];
    final?: string | string[];
  }>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function JuezCalificarMaquetasPage({
  params,
  searchParams,
}: JuezCalificarMaquetasPageProps) {
  const { eventId, level1Id, finalCategoryId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const level1Name = firstValue(resolvedSearchParams.l1) ?? "Categoria";
  const level2Name = firstValue(resolvedSearchParams.l2) ?? null;
  const level2Id = firstValue(resolvedSearchParams.l2id) ?? null;
  const finalCategoryName = firstValue(resolvedSearchParams.final) ?? "Especialidad";

  const backHref = level2Name && level2Id
    ? `/juez/calificar/${eventId}/nivel-3/${level1Id}/${level2Id}?l1=${encodeURIComponent(level1Name)}&l2=${encodeURIComponent(level2Name)}`
    : finalCategoryId === level1Id
      ? `/juez/calificar/${eventId}/nivel-1`
      : `/juez/calificar/${eventId}/nivel-2/${level1Id}?l1=${encodeURIComponent(level1Name)}`;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[#1E1E1E] bg-[#0F0F0F] p-4">
        <p className="text-xs text-[#8E8E8E]">
          {level1Name}
          {level2Name ? ` / ${level2Name}` : ""}
          {" / "}
          <span className="font-semibold text-[#8BA3FF]">{finalCategoryName}</span>
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <h2 className={`${judgeHeadingFont.className} text-3xl font-bold text-white sm:text-4xl`}>
            Maquetas - {finalCategoryName}
          </h2>
          <Link
            href={backHref}
            className="inline-flex h-9 items-center justify-center rounded-[18px] border border-[#303030] px-4 text-xs font-semibold text-[#D7D7D7]"
          >
            Volver
          </Link>
        </div>
      </div>

      <JudgeQueueSection
        headingClassName={judgeHeadingFont.className}
        lockedEventId={eventId}
        lockedCategoryId={finalCategoryId}
        tableView
        hideFilters
        showLockedEventSummary={false}
      />
    </section>
  );
}
