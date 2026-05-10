import { JudgeReviewPage } from "@/presentation/components/features/judge/judge-review-page";

type JuezEvaluarMaquetaPageProps = {
  params: Promise<{
    eventId: string;
    level1Id: string;
    finalCategoryId: string;
    modelId: string;
  }>;
  searchParams?: Promise<{
    l1?: string | string[];
    l2?: string | string[];
    l2id?: string | string[];
    final?: string | string[];
    readonly?: string | string[];
  }>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function JuezEvaluarMaquetaPage({
  params,
  searchParams,
}: JuezEvaluarMaquetaPageProps) {
  const { eventId, level1Id, finalCategoryId, modelId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const level1Name = firstValue(resolvedSearchParams.l1) ?? "Categoria";
  const level2Name = firstValue(resolvedSearchParams.l2) ?? null;
  const level2Id = firstValue(resolvedSearchParams.l2id) ?? null;
  const finalCategoryName = firstValue(resolvedSearchParams.final) ?? "Especialidad";
  const forceReadOnly = firstValue(resolvedSearchParams.readonly) === "1";

  const backSearchParams = new URLSearchParams();
  backSearchParams.set("l1", level1Name);
  if (level2Name) {
    backSearchParams.set("l2", level2Name);
  }
  if (level2Id) {
    backSearchParams.set("l2id", level2Id);
  }
  backSearchParams.set("final", finalCategoryName);

  const backHref = `/juez/calificar/${eventId}/maquetas/${level1Id}/${finalCategoryId}?${backSearchParams.toString()}`;

  return (
    <JudgeReviewPage
      modelId={modelId}
      backHref={backHref}
      level1Name={level1Name}
      level2Name={level2Name}
      finalCategoryName={finalCategoryName}
      forceReadOnly={forceReadOnly}
    />
  );
}
