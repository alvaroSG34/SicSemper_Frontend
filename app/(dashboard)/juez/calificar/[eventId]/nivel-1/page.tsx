import { JudgeLevelOneSection } from "@/presentation/components/features/judge/judge-level-one-section";

type JuezCalificarNivelUnoPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function JuezCalificarNivelUnoPage({ params }: JuezCalificarNivelUnoPageProps) {
  const { eventId } = await params;
  return <JudgeLevelOneSection eventId={eventId} />;
}

