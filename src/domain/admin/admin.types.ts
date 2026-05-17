import type { Identifier } from "@/core/types";
import type { User } from "@/domain/user/user.types";

export type CatalogEventStatus = "ACTIVO" | "PAUSADO" | "BORRADOR" | "FINALIZADO";

export type AlertSeverity = "BAJA" | "MEDIA" | "ALTA";
export type AlertStatus = "ABIERTA" | "EN_PROGRESO" | "RESUELTA";

export type CatalogEvent = {
  id: Identifier;
  name: string;
  organizerClubId?: Identifier;
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

export type CatalogScale = {
  id: Identifier;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type EventCategoryScaleConfig = {
  eventCategoryId: Identifier;
  categoryId: Identifier;
  categoryName: string;
  categoryParentId: Identifier | null;
  categoryParentName: string | null;
  scaleIds: Identifier[];
  scaleValues: string[];
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

export type AdminPermissionRole = {
  code: User["roles"][number];
  name: string;
};

export type AdminPermission = {
  id: Identifier;
  code: string;
  name: string;
  description: string | null;
  assignedRoles: AdminPermissionRole[];
  roleAssignmentsCount: number;
  userAssignmentsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminDashboardData = {
  kpis: AdminKpis;
  effectivePermissions: string[];
  users: User[];
  activity: ActivityLogItem[];
  alerts: SystemAlert[];
  assignments: JudgeAssignmentScope[];
  clubs: AdminClub[];
  permissions: {
    total: number;
    items: AdminPermission[];
  };
  catalog: {
    events: CatalogEvent[];
    categories: CatalogCategory[];
    subcategories: CatalogSubcategory[];
    eventCategories: EventCategoryOption[];
    scales: CatalogScale[];
  };
};

export type AdminDashboardSummary = Pick<
  AdminDashboardData,
  "kpis" | "effectivePermissions" | "alerts" | "activity"
>;

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

export type ScaleDeleteImpact = {
  scaleId: Identifier;
  scaleValue: string;
  eventCategoryRules: number;
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

export type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  ci?: string;
  country?: string;
  city?: string;
  phone?: string;
  clubId?: string;
};

export type CreateEventPayload = {
  organizerClubId: Identifier;
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
  organizerClubId: Identifier;
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
  | "JUDGE_DASHBOARD_READ"
  | "JUDGE_REVIEW_START"
  | "JUDGE_REVIEW_COMPLETE"
  | "JUDGE_MODELS_READ";

export type JudgePermissionEntry = {
  code: JudgePermissionCode;
  granted: boolean;
  grantedByRole: boolean;
  grantedDirectly: boolean;
  grantedAt: string | null;
  grantedBy: { id: string; name: string } | null;
};

export type AdminPermissionCode = string;

export type AdminPermissionEntry = {
  code: AdminPermissionCode;
  name: string;
  description: string | null;
  granted: boolean;
  grantedByRole: boolean;
  grantedDirectly: boolean;
  grantedAt: string | null;
  grantedBy: { id: string; name: string } | null;
};

export type AdminNotificationType =
  | "EVENTO_CREADO_ACTUALIZADO_ELIMINADO"
  | "ASIGNACION_JUEZ_CREADA_ELIMINADA"
  | "PERMISO_JUEZ_OTORGADO_REVOCADO"
  | "PERMISO_ADMIN_OTORGADO_REVOCADO"
  | "ROL_USUARIO_ACTUALIZADO"
  | "PARTICIPANTE_BANEADO"
  | "PARTICIPANTE_REHABILITADO"
  | "ALERTA_SISTEMA"
  | "NUEVO_REGISTRO_PARTICIPANTE";

export type AdminNotificationSeverity = "BAJA" | "MEDIA" | "ALTA";

export type AdminNotificationItem = {
  id: Identifier;
  type: AdminNotificationType;
  severity: AdminNotificationSeverity;
  title: string;
  detail: string;
  targetPath: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
};

export type AdminNotificationsPageResponse = {
  items: AdminNotificationItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  unreadCount: number;
};

export type AdminNotificationsMutationResult = {
  success: boolean;
  marked?: number;
};
