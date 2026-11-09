import type { Metadata } from "next";
import type { ReactNode } from "react";
import { privatePageRobots } from "@/core/seo";

export const metadata: Metadata = {
  title: "Iniciar sesión | SICSEMPER",
  robots: privatePageRobots,
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
