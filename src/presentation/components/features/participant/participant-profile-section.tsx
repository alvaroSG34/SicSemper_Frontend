"use client";

import { ParticipantProfilePanel } from "./participant-profile-panel";
import { useParticipantProfile } from "./use-participant-profile";

export function ParticipantProfileSection() {
  const { handleProfileUpdated } = useParticipantProfile();

  return <ParticipantProfilePanel onProfileUpdated={handleProfileUpdated} />;
}
