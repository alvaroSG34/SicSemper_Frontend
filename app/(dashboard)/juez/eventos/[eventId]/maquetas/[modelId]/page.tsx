import { JudgePodiumModelDetailPage } from "@/presentation/components/features/judge/judge-podium-model-detail-page";

type JudgeEventModelDetailRouteProps = {
  params: Promise<{
    eventId: string;
    modelId: string;
  }>;
  searchParams?: Promise<{
    path?: string | string[];
    finalCategoryId?: string | string[];
    scaleId?: string | string[];
    groupId?: string | string[];
  }>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function JudgeEventModelDetailRoute({
  params,
  searchParams,
}: JudgeEventModelDetailRouteProps) {
  const { eventId, modelId } = await params;
  const query = new URLSearchParams();
  const resolvedSearchParams = (await searchParams) ?? {};
  const path = firstValue(resolvedSearchParams.path);
  const finalCategoryId = firstValue(resolvedSearchParams.finalCategoryId);
  const scaleId = firstValue(resolvedSearchParams.scaleId);
  const groupId = firstValue(resolvedSearchParams.groupId);

  if (path) query.set("path", path);
  if (finalCategoryId) query.set("finalCategoryId", finalCategoryId);
  if (scaleId) query.set("scaleId", scaleId);
  if (groupId) query.set("groupId", groupId);

  const backHref = `/juez/eventos/${encodeURIComponent(eventId)}/podio${query.toString() ? `?${query.toString()}` : ""}`;
  return <JudgePodiumModelDetailPage eventId={eventId} modelId={modelId} backHref={backHref} />;
}

