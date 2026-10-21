import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = "https://sicsempermodelismo.com.bo";
const siteTitle = "SICSEMPER | Competencias de Modelismo y Maquetas";
const siteDescription =
  "Participa en SICSEMPER, la competencia boliviana de modelismo y maquetas. Descubre eventos, categorías, inscripcion y el talento de nuestra comunidad.";
const socialImage = `${siteUrl}/og-image.jpg`;
const xUsername = process.env.NEXT_PUBLIC_X_USERNAME?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "SICSEMPER",
    locale: "es_BO",
    title: siteTitle,
    description: siteDescription,
    images: [{ url: socialImage, width: 1200, height: 630, alt: "SICSEMPER - Competencias de modelismo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage],
    ...(xUsername ? { site: xUsername } : {}),
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#111827",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SICSEMPER",
              url: siteUrl,
              description: siteDescription,
              inLanguage: "es-BO",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
