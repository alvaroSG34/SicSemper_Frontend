"use client";

import { useJudgeStore } from "@/presentation/stores";
import { judgeHeadingFont } from "./judge-heading-font";

const formatBirthDate = (value: string | undefined) => {
  if (!value) return "--";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function JudgeProfileSection() {
  const profile = useJudgeStore((state) => state.dashboard?.profile);
  const accountStatus = profile?.status ?? "--";
  const verificationStatus = profile?.verified ? "Verificado" : "Pendiente";
  const clubLabel = profile?.club ? `${profile.club.name} - ${profile.club.place}` : "Sin club";

  return (
    <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <h2 className={`${judgeHeadingFont.className} text-[24px] font-semibold text-white`}>Mi perfil</h2>
        <p className="text-sm text-[#9C9C9C]">
          Datos principales del juez para contacto y gestion administrativa.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[#242424] bg-[#111111] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[#7B7B7B]">Correo</p>
          <p className="mt-2 text-sm text-white">{profile?.email ?? "--"}</p>
        </article>
        <article className="rounded-2xl border border-[#242424] bg-[#111111] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[#7B7B7B]">Estado</p>
          <p className="mt-2 text-sm text-white">
            {accountStatus} - {verificationStatus}
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4 md:col-span-2">
          <p className="text-xs text-[#9C9C9C]">Nombre completo</p>
          <p className="mt-1 text-sm font-semibold text-white">{profile?.fullName ?? "--"}</p>
        </article>

        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="text-xs text-[#9C9C9C]">C.I.</p>
          <p className="mt-1 text-sm font-semibold text-white">{profile?.ci || "--"}</p>
        </article>
        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="text-xs text-[#9C9C9C]">Fecha de nacimiento</p>
          <p className="mt-1 text-sm font-semibold text-white">{formatBirthDate(profile?.birthDate)}</p>
        </article>

        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="text-xs text-[#9C9C9C]">Pais</p>
          <p className="mt-1 text-sm font-semibold text-white">{profile?.country || "--"}</p>
        </article>
        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="text-xs text-[#9C9C9C]">Ciudad</p>
          <p className="mt-1 text-sm font-semibold text-white">{profile?.city || "--"}</p>
        </article>

        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="text-xs text-[#9C9C9C]">Telefono</p>
          <p className="mt-1 text-sm font-semibold text-white">{profile?.phone || "--"}</p>
        </article>
        <article className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
          <p className="text-xs text-[#9C9C9C]">Club</p>
          <p className="mt-1 text-sm font-semibold text-white">{clubLabel}</p>
        </article>
      </div>
    </section>
  );
}
