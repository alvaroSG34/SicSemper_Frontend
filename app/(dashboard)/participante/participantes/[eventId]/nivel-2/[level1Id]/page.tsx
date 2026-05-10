import { ParticipantShowcaseLevelTwoPage } from "@/presentation/components/features/participant";

type ParticipanteShowcaseNivelDosPageProps = {
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

export default async function ParticipanteShowcaseNivelDosPage({
  params,
  searchParams,
}: ParticipanteShowcaseNivelDosPageProps) {
  const { eventId, level1Id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const level1Name = firstValue(resolvedSearchParams.l1) ?? "Categoria";

  return (
    <ParticipantShowcaseLevelTwoPage
      eventId={eventId}
      level1Id={level1Id}
      level1Name={level1Name}
    />
  );
}

