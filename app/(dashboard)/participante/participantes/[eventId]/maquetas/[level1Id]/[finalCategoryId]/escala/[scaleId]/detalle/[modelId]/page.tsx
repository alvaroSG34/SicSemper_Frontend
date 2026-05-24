import { ParticipantShowcaseModelDetailPage } from "@/presentation/components/features/participant";

type ParticipanteShowcaseDetallePorEscalaPageProps = {
  params: Promise<{
    eventId: string;
    level1Id: string;
    finalCategoryId: string;
    scaleId: string;
    modelId: string;
  }>;
  searchParams?: Promise<{
    l1?: string | string[];
    l2?: string | string[];
    l2id?: string | string[];
    final?: string | string[];
    scale?: string | string[];
  }>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function ParticipanteShowcaseDetallePorEscalaPage({
  params,
  searchParams,
}: ParticipanteShowcaseDetallePorEscalaPageProps) {
  const { eventId, level1Id, finalCategoryId, scaleId, modelId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const level1Name = firstValue(resolvedSearchParams.l1) ?? "Categoria";
  const level2Name = firstValue(resolvedSearchParams.l2) ?? null;
  const level2Id = firstValue(resolvedSearchParams.l2id) ?? null;
  const finalCategoryName = firstValue(resolvedSearchParams.final) ?? "Especialidad";
  const scaleLabel = firstValue(resolvedSearchParams.scale) ?? "Escala";

  return (
    <ParticipantShowcaseModelDetailPage
      eventId={eventId}
      level1Id={level1Id}
      finalCategoryId={finalCategoryId}
      scaleId={scaleId}
      modelId={modelId}
      level1Name={level1Name}
      level2Name={level2Name}
      level2Id={level2Id}
      finalCategoryName={finalCategoryName}
      scaleLabel={scaleLabel}
    />
  );
}

