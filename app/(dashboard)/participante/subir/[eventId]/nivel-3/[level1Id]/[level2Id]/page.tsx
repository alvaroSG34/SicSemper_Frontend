import { ParticipantUploadLevelThreePage } from "@/presentation/components/features/participant/participant-upload-level-three-page";

type ParticipanteSubirNivelTresPageProps = {
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

export default async function ParticipanteSubirNivelTresPage({
  params,
  searchParams,
}: ParticipanteSubirNivelTresPageProps) {
  const { eventId, level1Id, level2Id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const level1Name = firstValue(resolvedSearchParams.l1) ?? "Categoria";
  const level2Name = firstValue(resolvedSearchParams.l2) ?? "Subcategoria";

  return (
    <ParticipantUploadLevelThreePage
      eventId={eventId}
      level1Id={level1Id}
      level2Id={level2Id}
      level1Name={level1Name}
      level2Name={level2Name}
    />
  );
}
