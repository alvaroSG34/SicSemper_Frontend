import type { Identifier } from "@/core/types";

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
  createdAt?: string;
  updatedAt?: string;
};

export type CatalogCategory = {
  id: Identifier;
  eventId: Identifier;
  name: string;
  parentId?: Identifier | null;
};

export type CatalogSubcategory = {
  id: Identifier;
  categoryId: Identifier;
  name: string;
};

export type JudgeAssignmentScope = {
  id: Identifier;
  judgeUserId: Identifier;
  eventId: Identifier;
  categoryId: Identifier;
  subcategoryId: Identifier;
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

export type AdminDashboardData = {
  kpis: AdminKpis;
  activity: ActivityLogItem[];
  alerts: SystemAlert[];
  assignments: JudgeAssignmentScope[];
  catalog: {
    events: CatalogEvent[];
    categories: CatalogCategory[];
    subcategories: CatalogSubcategory[];
  };
};

export type CreateEventPayload = {
  name: string;
  place: string;
  startDate: string;
  endDate: string;
  description: string;
  status?: CatalogEventStatus;
};

export type UpdateEventPayload = {
  id: Identifier;
  name: string;
  place: string;
  startDate: string;
  endDate: string;
  description: string;
  status: CatalogEventStatus;
};

export type CreateCategoryPayload = {
  eventId: Identifier;
  name: string;
};

export type UpdateCategoryPayload = {
  id: Identifier;
  eventId: Identifier;
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
  categoryId: Identifier;
  subcategoryId: Identifier;
};
