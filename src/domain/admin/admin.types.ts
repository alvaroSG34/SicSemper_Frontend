import type { Identifier } from "@/core/types";
import type { User } from "@/domain/user/user.types";

export type CatalogEventStatus = "ACTIVO" | "PAUSADO" | "BORRADOR";

export type AlertSeverity = "BAJA" | "MEDIA" | "ALTA";
export type AlertStatus = "ABIERTA" | "EN_PROGRESO" | "RESUELTA";

export type CatalogEvent = {
  id: Identifier;
  name: string;
  status: CatalogEventStatus;
  place?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CatalogCategory = {
  id: Identifier;
  eventId?: Identifier | null;
  name: string;
  parentId?: Identifier | null;
};

export type CatalogSubcategory = {
  id: Identifier;
  categoryId: Identifier;
  name: string;
};

export type EventCategoryOption = {
  id: Identifier;
  eventId: Identifier;
  categoryId: Identifier;
  name: string;
};

export type JudgeAssignmentScope = {
  id: Identifier;
  judgeUserId: Identifier;
  eventId: Identifier;
  eventCategoryId: Identifier;
  createdAt: string;
};

export type SystemAlert = {
  id: Identifier;
  title: string;
  detail: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
};

export type ActivityLogItem = {
  id: Identifier;
  title: string;
  detail: string;
  createdAt: string;
};

export type AdminKpis = {
  activeUsers: number;
  activeEvents: number;
  openIncidents: number;
};

export type AdminClub = {
  id: Identifier;
  name: string;
  place: string;
  contactEmail: string;
  description?: string | null;
  logoUrl?: string | null;
  members: number;
};

export type AdminDashboardData = {
  kpis: AdminKpis;
  users: User[];
  activity: ActivityLogItem[];
  alerts: SystemAlert[];
  assignments: JudgeAssignmentScope[];
  clubs: AdminClub[];
  catalog: {
    events: CatalogEvent[];
    categories: CatalogCategory[];
    subcategories: CatalogSubcategory[];
    eventCategories: EventCategoryOption[];
  };
};

export type EventDeleteImpact = {
  eventId: Identifier;
  eventName: string;
  eventCategories: number;
  judgeAssignments: number;
  registrations: number;
  models: number;
};

export type ClubDeleteImpact = {
  clubId: Identifier;
  clubName: string;
  members: number;
  events: number;
};

export type CategoryDeleteImpact = {
  categoryId: Identifier;
  categoryName: string;
  children: number;
  eventCategories: number;
  judgeAssignments: number;
  registrations: number;
  models: number;
};

export type CreateClubPayload = {
  name: string;
  place: string;
  contactEmail: string;
  description?: string;
  logoUrl?: string;
};

export type UpdateClubPayload = CreateClubPayload & {
  id: Identifier;
};

export type CreateEventPayload = {
  name: string;
  place: string;
  startDate: string;
  endDate: string;
  description: string;
  imageUrl?: string;
  status?: CatalogEventStatus;
};

export type UpdateEventPayload = {
  id: Identifier;
  name: string;
  place: string;
  startDate: string;
  endDate: string;
  description: string;
  imageUrl?: string;
  status: CatalogEventStatus;
};

export type CreateCategoryPayload = {
  eventId?: Identifier | null;
  name: string;
};

export type UpdateCategoryPayload = {
  id: Identifier;
  eventId?: Identifier | null;
  name: string;
};

export type CreateSubcategoryPayload = {
  categoryId: Identifier;
  name: string;
};

export type UpdateSubcategoryPayload = {
  id: Identifier;
  categoryId: Identifier;
  name: string;
};

export type AssignJudgeScopePayload = {
  judgeUserId: Identifier;
  eventId: Identifier;
  eventCategoryId: Identifier;
};

export type JudgePermissionCode =
  | "JUDGE_REVIEW_START"
  | "JUDGE_REVIEW_COMPLETE"
  | "JUDGE_MODELS_READ";

export type JudgePermissionEntry = {
  code: JudgePermissionCode;
  granted: boolean;
  grantedAt: string | null;
  grantedBy: { id: string; name: string } | null;
};

