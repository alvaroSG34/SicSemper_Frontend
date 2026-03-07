import type { Identifier } from "@/core/types";

export type ParticipantSidebarItemId =
  | "inicio"
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
  photoUrl?: string;
  verified: boolean;
};

export type ParticipantUserStatus = "ACTIVO" | "INACTIVO" | "SUSPENDIDO";

export type ParticipantProfileDetails = {
  userId: Identifier;
  name: string;
  email: string;
  ci: string;
  country: string;
  city: string;
  phone: string;
  photoUrl: string;
  birthDate: string;
  status: ParticipantUserStatus;
  verified: boolean;
  club: {
    id: Identifier;
    name: string;
    place: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateParticipantProfilePayload = {
  name?: string;
  birthDate?: string | null;
  ci?: string | null;
  country?: string | null;
  city?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  clubId?: string | null;
};

export type ParticipantNextChallenge = {
  eventId?: Identifier | null;
  eyebrow: string;
  title: string;
  categoryLine: string;
  organizer: string;
  startDate?: string | null;
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
  imageUrl?: string | null;
  status: ParticipantEventStatus;
  place: string;
  startDate: string;
  endDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  organizerClub?: {
    id: Identifier;
    name: string;
  };
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

export type ParticipantEventAllowedCategoryGroup = {
  category: ParticipantCategoryOption;
  subcategories: ParticipantSubcategoryOption[];
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

export type ParticipantModelFile = {
  id: Identifier;
  modelId: Identifier;
  publicUrl: string;
  order: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
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
  nombreModelo: string;
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
  files: ParticipantModelFile[];
};

export type ParticipantUploadFileInput = {
  name: string;
  type: string;
  size: number;
  publicUrl?: string | null;
  storageKey?: string | null;
};

export type CreateParticipantModelPayload = {
  userId: Identifier;
  eventId: Identifier;
  categoryId: Identifier;
  subcategoryId: Identifier;
  usuarioEventoCategoriaId: Identifier;
  nombreModelo: string;
  marca: string;
  descripcion?: string;
  escalaId: Identifier;
  files: ParticipantUploadFileInput[];
};

export type ParticipantDashboardData = {
  sidebarItems: ParticipantSidebarItem[];
  profile: ParticipantProfile;
  nextChallenge: ParticipantNextChallenge;
  kpis: ParticipantKpi[];
  openEvents: ParticipantOpenEvent[];
};

