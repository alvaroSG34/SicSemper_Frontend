import { notFound } from "next/navigation";
import { ParticipantDashboardPage } from "@/presentation/components/features/participant/participant-dashboard-page";
import { isParticipantSectionId } from "@/presentation/components/features/participant/participant-routes";

type ParticipanteSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
};

export default async function ParticipanteSectionPage({ params }: ParticipanteSectionPageProps) {
  const { section } = await params;

  if (!isParticipantSectionId(section)) {
    notFound();
  }

  return <ParticipantDashboardPage activeSection={section} />;
}
