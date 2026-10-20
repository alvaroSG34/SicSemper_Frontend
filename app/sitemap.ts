import type { MetadataRoute } from "next";

const siteUrl = "https://sicsempermodelismo.com.bo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
