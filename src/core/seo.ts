import type { Metadata } from "next";

export const siteUrl = "https://sicsempermodelismo.com.bo";
export const siteTitle = "SICSEMPER | Club de Modelismo en Santa Cruz, Bolivia";
export const siteDescription =
  "SICSEMPER, club de modelismo estático en Santa Cruz, Bolivia. Conoce nuestros concursos, exposiciones de maquetas y cómo participar en la comunidad.";

export function publicPageMetadata({
  title,
  description,
  path,
  image = "/og-image.jpg",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = new URL(path, siteUrl).href;
  const imageUrl = new URL(image, siteUrl).href;
  const xUsername = process.env.NEXT_PUBLIC_X_USERNAME?.trim();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "SICSEMPER",
      locale: "es_BO",
      title,
      description,
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      ...(xUsername ? { site: xUsername } : {}),
    },
  };
}

export const privatePageRobots: Metadata["robots"] = {
  index: false,
  follow: false,
};

// Editorial content can contain HTML delimiters; keep JSON-LD inside its script.
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
