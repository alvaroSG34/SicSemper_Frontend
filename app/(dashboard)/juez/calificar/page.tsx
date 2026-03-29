import { redirect } from "next/navigation";
import { JudgeQueueSection } from "@/presentation/components/features/judge/judge-queue-section";
import { judgeHeadingFont } from "@/presentation/components/features/judge/judge-heading-font";

type JuezCalificarPageProps = {
  searchParams?: Promise<{
    eventId?: string | string[];
  }>;
};

export default async function JuezCalificarPage({ searchParams }: JuezCalificarPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawEventId = resolvedSearchParams.eventId;
  const eventIdValue = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;
  const eventId = eventIdValue?.trim();

  if (!eventId) {
    redirect("/juez/eventos");
  }

  return (
    <JudgeQueueSection
      headingClassName={judgeHeadingFont.className}
      lockedEventId={eventId}
    />
  );
}
