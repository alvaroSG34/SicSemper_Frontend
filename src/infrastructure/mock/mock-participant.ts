import type {
  ParticipantDashboardData,
  ParticipantKpi,
  ParticipantNextChallenge,
  ParticipantOpenEvent,
  ParticipantProfile,
  ParticipantSidebarItem,
} from "@/domain/participant/participant.types";

export const mockParticipantSidebarItems: ParticipantSidebarItem[] = [
  { id: "inicio", label: "Inicio", icon: "home", active: true },
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
  title: "Copa Nacional de Modelismo 2026",
  categoryLine: "Categoria: Aviones - Senior | ID: #AVI-2026",
  organizer: "Organiza: Federacion Boliviana de Modelismo",
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

export const mockParticipantOpenEvents: ParticipantOpenEvent[] = [
  {
    id: "evt-1",
    title: "Copa Sudamericana de Maquetas 2026",
    description: "Inscribete en la competencia regional de aviones, tanques, barcos y dioramas.",
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
const cloneOpenEvent = (event: ParticipantOpenEvent): ParticipantOpenEvent => ({ ...event });

export const getClonedParticipantDashboardData = (): ParticipantDashboardData => ({
  sidebarItems: mockParticipantSidebarItems.map(cloneSidebarItem),
  profile: cloneProfile(mockParticipantProfile),
  nextChallenge: cloneNextChallenge(mockParticipantNextChallenge),
  kpis: mockParticipantKpis.map(cloneKpi),
  openEvents: mockParticipantOpenEvents.map(cloneOpenEvent),
});
