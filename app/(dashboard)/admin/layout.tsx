import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/infrastructure/auth/server-session";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.activeRole !== "ADMIN" && session.activeRole !== "SUPERADMIN") {
    redirect(session.activeRole === "JUEZ" ? "/juez/inicio" : "/participante/inicio");
  }

  return children;
}

