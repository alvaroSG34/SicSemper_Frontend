import { notFound } from "next/navigation";
import { getApiBaseUrl } from "@/infrastructure/api/api-base-url";
import type { LandingEvent } from "@/domain/landing/landing.types";
import { LandingEventDetailView } from "@/presentation/components/features/landing/landing-event-detail-view";
import { AutoPublicHeader } from "@/presentation/components/layout";

async function loadEvent(id: string): Promise<LandingEvent | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/landing/events/${id}`, { next: { revalidate: 60 } });
    return response.ok ? ((await response.json()) as LandingEvent) : null;
  } catch { return null; }
}

export default async function LandingEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const event = await loadEvent(id);
  if (!event) notFound();
  return <main className="min-h-screen bg-black text-white"><AutoPublicHeader /><LandingEventDetailView event={event} /></main>;
}
