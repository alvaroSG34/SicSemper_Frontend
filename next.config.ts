import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    // Normalize only public SEO routes; leave API, auth and assets on their origin.
    return [
      "/",
      "/club-modelismo-santa-cruz",
      "/eventos",
      "/eventos/:id",
      "/privacidad",
      "/terminos",
      "/sitemap.xml",
      "/robots.txt",
    ].map((source) => ({
      source,
      has: [{ type: "host" as const, value: "www\\.sicsempermodelismo\\.com\\.bo" }],
      destination: `https://sicsempermodelismo.com.bo${source}`,
      permanent: true,
    }));
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
};

export default nextConfig;
