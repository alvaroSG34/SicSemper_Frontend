import { ParticipantUploadLevelTwoPage } from "@/presentation/components/features/participant/participant-upload-level-two-page";

type ParticipanteSubirNivelDosPageProps = {
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

export default async function ParticipanteSubirNivelDosPage({
  params,
  searchParams,
}: ParticipanteSubirNivelDosPageProps) {
  const { eventId, level1Id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const level1Name = firstValue(resolvedSearchParams.l1) ?? "Categoria";

  return (
    <ParticipantUploadLevelTwoPage
      eventId={eventId}
      level1Id={level1Id}
      level1Name={level1Name}
    />
  );
}
