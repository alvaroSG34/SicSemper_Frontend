"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Settings } from "lucide-react";
import { useJudgeStore } from "@/presentation/stores";
import { judgeHeadingFont } from "./judge-heading-font";

const quickAccessItems = [
  {
    href: "/juez/eventos",
    title: "Eventos",
    description: "Consulta tus eventos asignados y entra al flujo de calificación.",
    icon: CalendarDays,
  },
  {
    href: "/juez/perfil",
    title: "Perfil",
    description: "Visualiza tus datos de juez y estado de verificacion.",
    icon: Settings,
  },
];

export function JudgeHomeSection() {
  const profile = useJudgeStore((state) => state.dashboard?.profile);

  return (
    <section className="rounded-3xl border border-[#1E1E1E] bg-[#121212] p-5 sm:p-6 xl:p-8">
      <h2 className={`${judgeHeadingFont.className} text-[24px] font-semibold text-white sm:text-[28px]`}>Bienvenido</h2>
      <p className="mt-2 text-sm text-[#AAAAAA]">
        {profile?.fullName ?? "Juez"}: selecciona una seccion para continuar con tu flujo de trabajo.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {quickAccessItems.map((item) => (
          <Link
            key={`judge-home-link:${item.href}`}
            href={item.href}
            className="group rounded-2xl border border-[#2D2D2D] bg-[#161616] p-4 transition hover:border-[#5B68F1]/70"
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-[#8BA3FF]" />
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
            </div>
            <p className="mt-2 text-xs text-[#9C9C9C]">{item.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#C8CEFF]">
              Abrir
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
