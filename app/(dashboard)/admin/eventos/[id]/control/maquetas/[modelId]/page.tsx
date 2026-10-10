import { AdminEventModelDetailPage } from "@/presentation/components/features/admin/admin-event-model-detail-page";

type AdminEventModelDetailRouteProps = {
  params: Promise<{
    id: string;
    modelId: string;
  }>;
  searchParams?: Promise<{
    tab?: string | string[];
    path?: string | string[];
    finalCategoryId?: string | string[];
    scaleId?: string | string[];
    groupId?: string | string[];
  }>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function AdminEventModelDetailRoute({
  params,
  searchParams,
}: AdminEventModelDetailRouteProps) {
  const { id, modelId } = await params;
  const query = new URLSearchParams();
  const resolvedSearchParams = (await searchParams) ?? {};
  const tab = firstValue(resolvedSearchParams.tab);
  const path = firstValue(resolvedSearchParams.path);
  const finalCategoryId = firstValue(resolvedSearchParams.finalCategoryId);
  const scaleId = firstValue(resolvedSearchParams.scaleId);
  const groupId = firstValue(resolvedSearchParams.groupId);
  if (tab === "podio") query.set("tab", "podio");
  if (path) query.set("path", path);
  if (finalCategoryId) query.set("finalCategoryId", finalCategoryId);
  if (scaleId) query.set("scaleId", scaleId);
  if (groupId) query.set("groupId", groupId);
  const backHref = `/admin/eventos/${encodeURIComponent(id)}/control?${query.toString() || "tab=podio"}`;
  return <AdminEventModelDetailPage eventId={id} modelId={modelId} backHref={backHref} />;
}
