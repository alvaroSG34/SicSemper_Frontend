import { Outfit } from "next/font/google";
import { BadgeCheck } from "lucide-react";
import type { ParticipantProfile } from "@/domain/participant/participant.types";
import { AccountMenu } from "@/presentation/components/layout";
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
    <header className="flex w-full min-w-0 items-center justify-between gap-2.5 sm:gap-3 md:gap-6">
      <div className="min-w-0 flex-1">
        <h1 className={`${outfit.className} hidden truncate text-xl leading-none font-bold text-white md:block md:text-3xl`}>
          Hola, {profile.displayName}
        </h1>
        <p className="hidden text-sm text-[#AAAAAA] md:block">{profile.subtitle}</p>
      </div>

      <div className="ml-2 flex shrink-0 items-center gap-2 sm:gap-3 md:gap-6">
        {profile.verified ? (
          <BadgeCheck className="h-7 w-7 text-[#10B981]" aria-label="Perfil verificado" />
        ) : null}

        <ParticipantNotificationsBell />

        <AccountMenu initials={profile.initials} photoUrl={profile.photoUrl} profileHref="/participante/perfil" />
      </div>
    </header>
  );
}

