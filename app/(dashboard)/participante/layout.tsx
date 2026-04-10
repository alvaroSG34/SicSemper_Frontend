import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/infrastructure/auth/server-session";

type ParticipantLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function ParticipantLayout({ children }: ParticipantLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.activeRole !== "PARTICIPANTE") {
    redirect(session.activeRole === "JUEZ" ? "/juez/inicio" : "/admin/inicio");
  }

  return children;
}

