import { AdminEventControlPage } from "@/presentation/components/features/admin/admin-event-control-page";

type AdminEventControlRouteProps = {
  params: Promise<{
    id: string;
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

export default async function AdminEventControlRoute({
  params,
  searchParams,
}: AdminEventControlRouteProps) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const tab = firstValue(resolvedSearchParams.tab);
  const initialTab = tab === "podio" ? "podio" : "resumen";
  const path = firstValue(resolvedSearchParams.path)
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const scaleId = firstValue(resolvedSearchParams.scaleId);
  const groupId = firstValue(resolvedSearchParams.groupId);
  const initialPodiumSelection =
    initialTab === "podio"
      ? {
          selectedPath: path,
          finalCategoryId: firstValue(resolvedSearchParams.finalCategoryId) ?? null,
          selectedSegment: scaleId || groupId ? { scaleId, groupId } : null,
        }
      : undefined;
  return (
    <AdminEventControlPage
      eventId={id}
      initialTab={initialTab}
      initialPodiumSelection={initialPodiumSelection}
    />
  );
}
