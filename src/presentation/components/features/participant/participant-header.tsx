import { ImageWithSkeleton } from "@/presentation/components/ui";
import { Outfit } from "next/font/google";
import { BadgeCheck, Bell } from "lucide-react";
import type { ParticipantProfile } from "@/domain/participant/participant.types";
import { DashboardRoleSwitch } from "@/presentation/components/layout";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantHeaderProps = {
  profile: ParticipantProfile;
};

export function ParticipantHeader({ profile }: ParticipantHeaderProps) {
  const hasPhoto = Boolean(profile.photoUrl?.trim());

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="flex flex-col gap-1">
        <h1 className={`${outfit.className} text-[30px] leading-none font-bold text-white md:text-[32px]`}>
          Hola, {profile.displayName}
        </h1>
        <p className="text-sm text-[#AAAAAA]">{profile.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
        {profile.verified ? (
          <div className="rounded-full border border-[#10B981] bg-[rgba(16,185,129,0.1)] px-3 py-1.5 sm:px-4 sm:py-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]">
              <BadgeCheck className="h-3.5 w-3.5" />
              Perfil verificado
            </span>
          </div>
        ) : null}

        <div className="relative flex h-10 w-10 items-center justify-center">
          <Bell className="h-5 w-5 text-white" />
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-[5px] bg-[#F15BB5]" />
        </div>

        <DashboardRoleSwitch />

        <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-[#5B68F1] bg-[#2D2D2D] sm:h-12 sm:w-12">
          {hasPhoto ? (
            <ImageWithSkeleton
              src={profile.photoUrl ?? ""}
              alt="Foto de perfil"
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-white">{profile.initials}</span>
          )}
        </div>
      </div>
    </header>
  );
}

