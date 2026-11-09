import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicPageMetadata, serializeJsonLd, siteUrl } from "@/core/seo";
import { loadPublicEvent } from "@/infrastructure/api/landing-public";
import { LandingEventDetailView } from "@/presentation/components/features/landing/landing-event-detail-view";
import { AutoPublicHeader } from "@/presentation/components/layout";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await loadPublicEvent((await params).id);
  if (!event) notFound();
  return publicPageMetadata({
    title: `${event.title} | SICSEMPER`,
    description: event.summary,
    path: `/eventos/${encodeURIComponent(event.id)}`,
    image: event.coverImageUrl || undefined,
  });
}

export default async function LandingEventDetailPage({ params }: Props) {
  const event = await loadPublicEvent((await params).id);
  if (!event) notFound();
  const url = `${siteUrl}/eventos/${encodeURIComponent(event.id)}`;
  return (
    <main className="min-h-screen bg-black text-white">
      <AutoPublicHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Inicio", item: `${siteUrl}/` },
              { "@type": "ListItem", position: 2, name: "Eventos", item: `${siteUrl}/eventos` },
              { "@type": "ListItem", position: 3, name: event.title, item: url },
            ],
          }),
        }}
      />
      <LandingEventDetailView event={event} />
    </main>
  );
}
