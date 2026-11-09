import type { MetadataRoute } from "next";

import { siteUrl } from "@/core/seo";
import { loadPublicEvents } from "@/infrastructure/api/landing-public";

export const revalidate = 60;
// Fetch at request time so builds do not require a running backend.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await loadPublicEvents();
  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/club-modelismo-santa-cruz`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${siteUrl}/eventos`, changeFrequency: "weekly", priority: 0.8 },
    ...events.map((event): MetadataRoute.Sitemap[number] => ({
      url: `${siteUrl}/eventos/${encodeURIComponent(event.id)}`,
      ...(event.updatedAt && Number.isFinite(Date.parse(event.updatedAt))
        ? { lastModified: new Date(event.updatedAt) }
        : {}),
      changeFrequency: "monthly",
      priority: 0.7,
    })),
    {
      url: `${siteUrl}/privacidad`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terminos`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
