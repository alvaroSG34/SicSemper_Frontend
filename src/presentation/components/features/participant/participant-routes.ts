import type { ParticipantSectionId } from "@/domain/participant/participant.types";

export const participantSectionRouteById: Record<ParticipantSectionId, string> = {
  inicio: "/participante/inicio",
  eventos: "/participante/eventos",
  maquetas: "/participante/maquetas",
  resultados: "/participante/resultados",
  perfil: "/participante/perfil",
};

export const participantDefaultRoute = participantSectionRouteById.inicio;

export const isParticipantSectionId = (value: string): value is ParticipantSectionId =>
  Object.prototype.hasOwnProperty.call(participantSectionRouteById, value);
