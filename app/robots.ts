import type { MetadataRoute } from "next";

const siteUrl = "https://sicsempermodelismo.com.bo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/juez/",
        "/participante/",
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
