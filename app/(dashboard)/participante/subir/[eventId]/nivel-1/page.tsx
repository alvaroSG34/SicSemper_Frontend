import { ParticipantUploadLevelOnePage } from "@/presentation/components/features/participant/participant-upload-level-one-page";

type ParticipanteSubirNivelUnoPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function ParticipanteSubirNivelUnoPage({
  params,
}: ParticipanteSubirNivelUnoPageProps) {
  const { eventId } = await params;

  return <ParticipantUploadLevelOnePage eventId={eventId} />;
}
