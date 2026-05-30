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

export type EventCategoryScaleGroup = {
  id: Identifier;
  eventId: Identifier;
  finalCategoryId: Identifier;
  name: string;
  scaleIds: Identifier[];
};

export type EventCategoryScaleGroupInput = {
  name: string;
  scaleIds: Identifier[];
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
  type?: string;
  signature?: string;
  title: string;
  detail: string;
  severity: AlertSeverity;
  status: AlertStatus;
  occurrenceCount?: number;
  firstTriggeredAt?: string;
  lastTriggeredAt?: string;
  resolvedAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
};

export type ActivityLogItem = {
  id: Identifier;
  title: string;
  detail: string;
  createdAt: string;
};

export type AuditLogResult = "SUCCESS" | "FAILED" | "ERROR";

export type AuditLogListItem = {
  id: Identifier;
  createdAt: string;
  title: string;
  detail: string;
  action: string | null;
  module: string | null;
  result: string | null;
  entityType: string | null;
  entityId: string | null;
  actorRole: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  actor: {
    id: Identifier;
    name: string;
    email: string;
  } | null;
};

export type AuditLogDetailItem = AuditLogListItem & {
  previousData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
};

export type AuditLogListResponse = {
  items: AuditLogListItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
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

export type EventControlModelSortOption =
  | "SCORE_DESC"
  | "SCORE_ASC"
  | "DATE_DESC"
  | "DATE_ASC";

export type AdminEventControlSummary = {
  eventId: Identifier;
  eventName: string;
  eventStatus: CatalogEventStatus;
  startDate: string | null;
  endDate: string | null;
  organizerClubName: string | null;
  registrationsCount: number;
  uniqueParticipantsCount: number;
  verifiedParticipantsCount: number;
  unverifiedParticipantsCount: number;
  suspendedParticipantsCount: number;
  participantsWithModelsCount: number;
  participantsWithoutModelsCount: number;
  modelsCount: number;
  modelsEnviadasCount: number;
  modelsEnRevisionCount: number;
  modelsCalificadasCount: number;
  pendingReviewModelsCount: number;
  averageFinalScore: number | null;
  qualifiedModelsRate: number;
  judgeReviewsSubmittedCount: number;
  judgeReviewsDraftCount: number;
  topSegmentsByScore: Array<{
    eventCategoryId: Identifier;
    finalCategoryId: Identifier;
    categoryLabel: string;
    scaleId: Identifier;
    scaleValue: string;
    modelsCount: number;
    averageFinalScore: number | null;
  }>;
  topSegmentsByVolume: Array<{
    eventCategoryId: Identifier;
    finalCategoryId: Identifier;
    categoryLabel: string;
    scaleId: Identifier;
    scaleValue: string;
    modelsCount: number;
    averageFinalScore: number | null;
  }>;
  recentActivity: Array<{
    type: "REGISTRATION_CREATED" | "MODEL_CREATED" | "JUDGE_REVIEW_SUBMITTED";
    timestamp: string;
    actorName: string;
    detail: string;
  }>;
};

export type AdminEventControlPage<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminEventParticipantRow = {
  userId: Identifier;
  name: string;
  email: string;
  status: string;
  verified: boolean;
  clubName: string | null;
  registrationsCount: number;
  modelsCount: number;
  lastRegistrationDate: string | null;
};

export type AdminEventParticipantDetail = {
  eventId: Identifier;
  user: {
    id: Identifier;
    name: string;
    email: string;
    status: string;
    verified: boolean;
    clubName: string | null;
  };
  registrations: Array<{
    registrationId: Identifier;
    registrationCode: string;
    registrationStatus: string;
    registrationDate: string;
    eventCategoryId: Identifier;
    finalCategoryId: Identifier;
    categoryLabel: string;
    modelsCount: number;
  }>;
  models: Array<{
    id: Identifier;
    nombreModelo: string;
    code: string;
    status: string;
    finalScore: number | null;
    createdAt: string;
    eventCategoryId: Identifier;
    finalCategoryId: Identifier;
    categoryLabel: string;
    scaleValue: string;
  }>;
};

export type AdminEventModelRow = {
  id: Identifier;
  nombreModelo: string;
  code: string;
  status: string;
  finalScore: number | null;
  createdAt: string;
  participantUserId: Identifier;
  participantName: string;
  participantEmail: string;
  registrationCode: string;
  registrationStatus: string;
  eventCategoryId: Identifier;
  finalCategoryId: Identifier;
  categoryLabel: string;
  scaleId?: Identifier;
  scaleValue: string;
};

export type AdminEventModelDetail = {
  eventId: Identifier;
  model: {
    id: Identifier;
    nombreModelo: string;
    code: string;
    brand: string;
    description: string;
    status: string;
    finalScore: number | null;
    createdAt: string;
    updatedAt: string;
  };
  owner: {
    userId: Identifier;
    name: string;
    email: string;
    clubName: string | null;
  };
  registration: {
    registrationId: Identifier;
    registrationCode: string;
    registrationStatus: string;
    registrationDate: string;
    eventCategoryId: Identifier;
    finalCategoryId: Identifier;
    categoryLabel: string;
    scaleValue: string;
  };
  media: {
    images: Array<{
      id: Identifier;
      fileName: string;
      mimeType: string;
      publicUrl: string | null;
      sortOrder: number;
    }>;
    documents: Array<{
      id: Identifier;
      fileName: string;
      mimeType: string;
      publicUrl: string | null;
      sortOrder: number;
    }>;
  };
  scoring: {
    finalScore: number | null;
    judgeBreakdown: Array<{
      judgeUserId: Identifier;
      judgeName: string;
      totalScore: number | null;
      criteria: {
        armado?: number;
        pintura?: number;
        detallesAgregados?: number;
      } | null;
      generalComment: string | null;
      submittedAt: string | null;
    }>;
  };
};

export type AdminPodiumTieBreakCandidate = {
  modelId: Identifier;
  nombreModelo: string;
  codigo: string;
  participantName: string;
  finalScore: number;
  automaticRank: number;
};

export type AdminPodiumTieBreakState = {
  eventId: Identifier;
  finalCategoryId: Identifier;
  scaleId: Identifier;
  eventStatus: CatalogEventStatus;
  locked: boolean;
  tieGroups: Array<{
    baseRank: number;
    modelIds: Identifier[];
  }>;
  candidates: AdminPodiumTieBreakCandidate[];
  manualDecision: {
    orderedModelIds: Identifier[];
    updatedAt: string;
    updatedByUserId: Identifier;
  } | null;
};

export type AdminPodiumTieBreakGroupState = {
  eventId: Identifier;
  groupId: Identifier;
  eventStatus: CatalogEventStatus;
  locked: boolean;
  tieGroups: Array<{
    baseRank: number;
    modelIds: Identifier[];
  }>;
  candidates: AdminPodiumTieBreakCandidate[];
  manualDecision: {
    orderedModelIds: Identifier[];
    updatedAt: string;
    updatedByUserId: Identifier;
  } | null;
};

export type AdminPodiumTieBreakDecisionInput = {
  eventId: Identifier;
  finalCategoryId: Identifier;
  scaleId: Identifier;
  orderedModelIds: Identifier[];
};

export type AdminPodiumTieBreakGroupDecisionInput = {
  eventId: Identifier;
  groupId: Identifier;
  orderedModelIds: Identifier[];
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
