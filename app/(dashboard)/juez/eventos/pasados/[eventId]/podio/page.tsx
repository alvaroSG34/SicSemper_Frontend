import { JudgeEventPodiumSection } from "@/presentation/components/features/judge/judge-event-podium-section";

type JudgePastEventPodiumPageProps = {
  params: Promise<{ eventId: string }>;
  searchParams?: Promise<{
    path?: string | string[];
    finalCategoryId?: string | string[];
    scaleId?: string | string[];
    groupId?: string | string[];
  }>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function JudgePastEventPodiumPage({
  params,
  searchParams,
}: JudgePastEventPodiumPageProps) {
  const { eventId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const path = firstValue(resolvedSearchParams.path)
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const finalCategoryId = firstValue(resolvedSearchParams.finalCategoryId) ?? null;
  const scaleId = firstValue(resolvedSearchParams.scaleId);
  const groupId = firstValue(resolvedSearchParams.groupId);

  const initialSelection =
    path || finalCategoryId || scaleId || groupId
      ? {
          selectedPath: path,
          finalCategoryId,
          selectedSegment: scaleId || groupId ? { scaleId: scaleId || undefined, groupId: groupId || undefined } : null,
        }
      : undefined;

  return <JudgeEventPodiumSection eventId={eventId} historyMode initialSelection={initialSelection} />;
}
