import { JudgePastModelDetailPage } from "@/presentation/components/features/judge/judge-past-model-detail-page";
import { JudgePodiumModelDetailPage } from "@/presentation/components/features/judge/judge-podium-model-detail-page";

type JudgePastModelPageProps = {
  params: Promise<{
    eventId: string;
    modelId: string;
  }>;
  searchParams?: Promise<{
    podium?: string | string[];
    path?: string | string[];
    finalCategoryId?: string | string[];
    scaleId?: string | string[];
    groupId?: string | string[];
  }>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function JudgePastModelPage({ params, searchParams }: JudgePastModelPageProps) {
  const { eventId, modelId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const podium = firstValue(resolvedSearchParams.podium);

  if (podium === "1") {
    const query = new URLSearchParams();
    const path = firstValue(resolvedSearchParams.path);
    const finalCategoryId = firstValue(resolvedSearchParams.finalCategoryId);
    const scaleId = firstValue(resolvedSearchParams.scaleId);
    const groupId = firstValue(resolvedSearchParams.groupId);

    if (path) query.set("path", path);
    if (finalCategoryId) query.set("finalCategoryId", finalCategoryId);
    if (scaleId) query.set("scaleId", scaleId);
    if (groupId) query.set("groupId", groupId);

    const backHref = `/juez/eventos/pasados/${encodeURIComponent(eventId)}/podio${query.toString() ? `?${query.toString()}` : ""}`;
    return <JudgePodiumModelDetailPage eventId={eventId} modelId={modelId} backHref={backHref} />;
  }

  return <JudgePastModelDetailPage eventId={eventId} modelId={modelId} podiumMode={false} />;
}
