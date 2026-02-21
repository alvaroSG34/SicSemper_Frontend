import type { Identifier } from "@/core/types";

export type ParticipantSidebarItemId =
  | "inicio"
  | "competencias"
  | "eventos"
  | "maquetas"
  | "resultados"
  | "perfil";

export type ParticipantSidebarIcon =
  | "home"
  | "trophy"
  | "compass"
  | "folderOpen"
  | "barChart3"
  | "settings";

export type ParticipantSidebarItem = {
  id: ParticipantSidebarItemId;
  label: string;
  icon: ParticipantSidebarIcon;
  active?: boolean;
};

export type ParticipantSectionId = ParticipantSidebarItemId;

export type ParticipantProfile = {
  userId: Identifier;
  displayName: string;
  subtitle: string;
  initials: string;
  verified: boolean;
};

export type ParticipantNextChallenge = {
  eyebrow: string;
  title: string;
  categoryLine: string;
  organizer: string;
  countdown: {
    days: string;
    hours: string;
    minutes: string;
  };
  imageAlt: string;
};

export type ParticipantKpiTone = "neutral" | "primary" | "accent";
export type ParticipantKpiIcon = "medal" | "trophy";

export type ParticipantKpi = {
  id: Identifier;
  label: string;
  value: string;
  tone: ParticipantKpiTone;
  icon: ParticipantKpiIcon;
  suffix?: string;
};

export type ParticipantCompetitionStatus = "CONFIRMADO" | "PENDIENTE";

export type ParticipantCompetition = {
  id: Identifier;
  title: string;
  subtitle: string;
  status: ParticipantCompetitionStatus;
};

export type ParticipantOpenEvent = {
  id: Identifier;
  title: string;
  description: string;
  ctaLabel: string;
};

export type ParticipantEventStatus = "ACTIVO" | "PAUSADO" | "BORRADOR";

export type ParticipantEventDetail = {
  id: Identifier;
  name: string;
  status: ParticipantEventStatus;
  place: string;
  startDate: string;
  endDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type ParticipantCategoryOption = {
  id: Identifier;
  eventId: Identifier;
  name: string;
  parentId?: Identifier | null;
};

export type ParticipantSubcategoryOption = {
  id: Identifier;
  categoryId: Identifier;
  name: string;
};

export type ParticipantScale = {
  id: Identifier;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type ParticipantEnrollmentStatus = "ACTIVA" | "PENDIENTE" | "CANCELADA";

export type ParticipantEnrollment = {
  id: Identifier;
  userId: Identifier;
  eventId: Identifier;
  categoryId: Identifier;
  status: ParticipantEnrollmentStatus;
  registrationDate: string;
  registrationCode: string;
  createdAt: string;
  updatedAt: string;
};

export type ParticipantModelStatus = "ENVIADA" | "EN_REVISION" | "CALIFICADA";

export type ParticipantModelImage = {
  id: Identifier;
  modelId: Identifier;
  imageUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type ParticipantModel = {
  id: Identifier;
  userId: Identifier;
  eventId: Identifier;
  categoryId: Identifier;
  subcategoryId: Identifier;
  escalaId: Identifier;
  usuarioEventoCategoriaId: Identifier;
  nombre: string;
  modelo: string;
  marca: string;
  descripcion: string;
  codigo: string;
  status: ParticipantModelStatus;
  createdAt: string;
  updatedAt: string;
  eventName: string;
  categoryName: string;
  subcategoryName: string;
  escalaValue: string;
  images: ParticipantModelImage[];
};

export type ParticipantUploadImageInput = {
  name: string;
  type: string;
  size: number;
};

export type CreateParticipantModelPayload = {
  userId: Identifier;
  eventId: Identifier;
  categoryId: Identifier;
  subcategoryId: Identifier;
  usuarioEventoCategoriaId: Identifier;
  nombre: string;
  modelo: string;
  marca: string;
  descripcion?: string;
  codigo: string;
  escalaId: Identifier;
  images: ParticipantUploadImageInput[];
};

export type ParticipantDashboardData = {
  sidebarItems: ParticipantSidebarItem[];
  profile: ParticipantProfile;
  nextChallenge: ParticipantNextChallenge;
  kpis: ParticipantKpi[];
  competitions: ParticipantCompetition[];
  openEvents: ParticipantOpenEvent[];
};
