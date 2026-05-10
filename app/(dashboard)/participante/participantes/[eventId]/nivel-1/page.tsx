import { ParticipantShowcaseLevelOnePage } from "@/presentation/components/features/participant";

type ParticipanteShowcaseNivelUnoPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function ParticipanteShowcaseNivelUnoPage({
  params,
}: ParticipanteShowcaseNivelUnoPageProps) {
  const { eventId } = await params;
  return <ParticipantShowcaseLevelOnePage eventId={eventId} />;
}

