import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { getApiBaseUrl } from "@/infrastructure/api/api-base-url";
import { landingDefaultContent, normalizeLandingContent } from "@/presentation/components/features/landing/landing-data";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const baseMetadata: Metadata = {
  title: "SICSEMPER",
  description: "Plataforma de competencias de modelismo y evaluacion de maquetas",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/landing/content`, {
      next: { revalidate: 60 },
    });
    const content = response.ok
      ? normalizeLandingContent(await response.json())
      : landingDefaultContent;

    return {
      ...baseMetadata,
      icons: content.branding.faviconUrl
        ? { icon: content.branding.faviconUrl }
        : { icon: "/favicon.ico" },
    };
  } catch {
    return {
      ...baseMetadata,
      icons: { icon: "/favicon.ico" },
    };
  }
}

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
