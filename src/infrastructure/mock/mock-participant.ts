import type {
  ParticipantCompetition,
  ParticipantDashboardData,
  ParticipantKpi,
  ParticipantNextChallenge,
  ParticipantOpenEvent,
  ParticipantProfile,
  ParticipantSidebarItem,
} from "@/domain/participant/participant.types";

export const mockParticipantSidebarItems: ParticipantSidebarItem[] = [
  { id: "inicio", label: "Inicio", icon: "home", active: true },
  { id: "competencias", label: "Mis Competencias", icon: "trophy" },
  { id: "eventos", label: "Explorar Eventos", icon: "compass" },
  { id: "maquetas", label: "Mis Maquetas", icon: "folderOpen" },
  { id: "resultados", label: "Resultados", icon: "barChart3" },
  { id: "perfil", label: "Mi Perfil", icon: "settings" },
];

export const mockParticipantProfile: ParticipantProfile = {
  userId: "u-1",
  displayName: "Alex",
  subtitle: "Miembro del Club IPMS | Escuadrón 201",
  initials: "AL",
  verified: true,
};

export const mockParticipantNextChallenge: ParticipantNextChallenge = {
  eyebrow: "TU PRÓXIMO DESAFÍO",
  title: "Hackathon Global 2024",
  categoryLine: "Categoría: Desarrollo Web - Senior | ID: #WEB-2024",
  organizer: "Organiza: Club de Innovación Tecnológica",
  countdown: {
    days: "02",
    hours: "14",
    minutes: "35",
  },
  imageAlt: "Vista previa del desafío",
};

export const mockParticipantKpis: ParticipantKpi[] = [
  {
    id: "kpi-models",
    label: "Maquetas totales",
    value: "12",
    tone: "neutral",
    icon: "medal",
  },
  {
    id: "kpi-events",
    label: "Eventos activos",
    value: "3",
    tone: "primary",
    icon: "trophy",
  },
  {
    id: "kpi-ranking",
    label: "Ranking club",
    value: "#04",
    suffix: "/ 156",
    tone: "accent",
    icon: "medal",
  },
];

export const mockParticipantCompetitions: ParticipantCompetition[] = [
  {
    id: "cmp-1",
    title: "Concurso de Diseño UI",
    subtitle: 'Maqueta: "Space Station Alpha" (Escala 1:100)',
    status: "CONFIRMADO",
  },
  {
    id: "cmp-2",
    title: "Torneo de Robótica",
    subtitle: 'Robot: "Optimus Prime V2" (Categoría Sumo)',
    status: "PENDIENTE",
  },
];

export const mockParticipantOpenEvents: ParticipantOpenEvent[] = [
  {
    id: "evt-1",
    title: "Data Science Challenge 2024",
    description: "Participa en el reto de análisis de datos más grande de la región.",
    ctaLabel: "Inscribirme ahora",
  },
];

const cloneSidebarItem = (item: ParticipantSidebarItem): ParticipantSidebarItem => ({ ...item });
const cloneProfile = (profile: ParticipantProfile): ParticipantProfile => ({ ...profile });
const cloneNextChallenge = (challenge: ParticipantNextChallenge): ParticipantNextChallenge => ({
  ...challenge,
  countdown: { ...challenge.countdown },
});
const cloneKpi = (kpi: ParticipantKpi): ParticipantKpi => ({ ...kpi });
const cloneCompetition = (competition: ParticipantCompetition): ParticipantCompetition => ({
  ...competition,
});
const cloneOpenEvent = (event: ParticipantOpenEvent): ParticipantOpenEvent => ({ ...event });

export const getClonedParticipantDashboardData = (): ParticipantDashboardData => ({
  sidebarItems: mockParticipantSidebarItems.map(cloneSidebarItem),
  profile: cloneProfile(mockParticipantProfile),
  nextChallenge: cloneNextChallenge(mockParticipantNextChallenge),
  kpis: mockParticipantKpis.map(cloneKpi),
  competitions: mockParticipantCompetitions.map(cloneCompetition),
  openEvents: mockParticipantOpenEvents.map(cloneOpenEvent),
});
