import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/infrastructure/auth/server-session";

type JudgeLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function JudgeLayout({ children }: JudgeLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.activeRole !== "JUEZ") {
    redirect(session.activeRole === "ADMIN" || session.activeRole === "SUPERADMIN" ? "/admin" : "/participante");
  }

  return children;
}

