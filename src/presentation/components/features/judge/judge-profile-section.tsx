"use client";

import { useAuthStore, useJudgeStore } from "@/presentation/stores";
import { judgeHeadingFont } from "./judge-heading-font";

export function JudgeProfileSection() {
  const profile = useJudgeStore((state) => state.dashboard?.profile);
  const currentRole = useAuthStore((state) => state.currentRole);

  return (
    <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
      <h2 className={`${judgeHeadingFont.className} text-[22px] font-semibold text-white`}>Perfil del juez</h2>
      <p className="mt-2 text-sm text-[#AAAAAA]">Vista de solo lectura en esta fase.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="text-xs text-[#9C9C9C]">Nombre completo</p>
          <p className="mt-1 text-sm font-semibold text-white">{profile?.fullName ?? "--"}</p>
        </article>
        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="text-xs text-[#9C9C9C]">Alias visible</p>
          <p className="mt-1 text-sm font-semibold text-white">{profile?.displayName ?? "--"}</p>
        </article>
        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="text-xs text-[#9C9C9C]">Iniciales</p>
          <p className="mt-1 text-sm font-semibold text-white">{profile?.initials ?? "--"}</p>
        </article>
        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="text-xs text-[#9C9C9C]">Rol activo</p>
          <p className="mt-1 text-sm font-semibold text-white">{currentRole ?? "JUEZ"}</p>
        </article>
        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4 sm:col-span-2">
          <p className="text-xs text-[#9C9C9C]">Estado</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {profile?.verified ? "Juez verificado" : "Revision activa"}
          </p>
        </article>
      </div>

      <p className="mt-5 rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
        La edicion completa del perfil de juez se implementara en la Fase 2.
      </p>
    </section>
  );
}
