import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { AuthSessionBootstrap } from "@/presentation/components/layout/auth-session-bootstrap";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NOMBRE",
  description: "Plataforma de competencias de modelismo y evaluacion de maquetas",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        <AuthSessionBootstrap />
        {children}
      </body>
    </html>
  );
}
