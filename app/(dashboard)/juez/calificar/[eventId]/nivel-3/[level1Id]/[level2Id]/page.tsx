import { JudgeLevelThreeSection } from "@/presentation/components/features/judge/judge-level-three-section";

type JuezCalificarNivelTresPageProps = {
  params: Promise<{
    eventId: string;
    level1Id: string;
    level2Id: string;
  }>;
  searchParams?: Promise<{
    l1?: string | string[];
    l2?: string | string[];
  }>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function JuezCalificarNivelTresPage({
  params,
  searchParams,
}: JuezCalificarNivelTresPageProps) {
  const { eventId, level1Id, level2Id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const level1Name = firstValue(resolvedSearchParams.l1) ?? "Categoria";
  const level2Name = firstValue(resolvedSearchParams.l2) ?? "Subcategoria";

  return (
    <JudgeLevelThreeSection
      eventId={eventId}
      level1Id={level1Id}
      level2Id={level2Id}
      level1Name={level1Name}
      level2Name={level2Name}
    />
  );
}

