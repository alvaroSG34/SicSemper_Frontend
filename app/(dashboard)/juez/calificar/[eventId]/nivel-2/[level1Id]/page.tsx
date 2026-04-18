import { JudgeLevelTwoSection } from "@/presentation/components/features/judge/judge-level-two-section";

type JuezCalificarNivelDosPageProps = {
  params: Promise<{
    eventId: string;
    level1Id: string;
  }>;
  searchParams?: Promise<{
    l1?: string | string[];
  }>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function JuezCalificarNivelDosPage({
  params,
  searchParams,
}: JuezCalificarNivelDosPageProps) {
  const { eventId, level1Id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const level1Name = firstValue(resolvedSearchParams.l1) ?? "Categoria";

  return (
    <JudgeLevelTwoSection
      eventId={eventId}
      level1Id={level1Id}
      level1Name={level1Name}
    />
  );
}

