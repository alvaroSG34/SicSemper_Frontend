import { Outfit } from "next/font/google";
import { BadgeCheck } from "lucide-react";
import type { ParticipantProfile } from "@/domain/participant/participant.types";
import { AccountMenu, DashboardRoleSwitch } from "@/presentation/components/layout";
import { ParticipantNotificationsBell } from "./participant-notifications-bell";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type ParticipantHeaderProps = {
  profile: ParticipantProfile;
};

export function ParticipantHeader({ profile }: ParticipantHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 md:gap-6">
      <div className="min-w-0 flex-1">
        <h1 className={`${outfit.className} truncate text-[26px] leading-none font-bold text-white md:text-[32px]`}>
          Hola, {profile.displayName}
        </h1>
        <p className="hidden text-sm text-[#AAAAAA] md:block">{profile.subtitle}</p>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2 sm:gap-3 md:gap-6">
        {profile.verified ? (
          <BadgeCheck className="h-7 w-7 text-[#10B981]" aria-label="Perfil verificado" />
        ) : null}

        <ParticipantNotificationsBell />

        <DashboardRoleSwitch hideParticipantJudgeOnly />

        <AccountMenu initials={profile.initials} photoUrl={profile.photoUrl} profileHref="/participante/perfil" />
      </div>
    </header>
  );
}

