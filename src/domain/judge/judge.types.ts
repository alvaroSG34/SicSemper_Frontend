import type { Identifier } from "@/core/types";

export type JudgeQueueStatus = "ENVIADA" | "EN_REVISION" | "CALIFICADA";
export type JudgePriority = "Alta" | "Media" | "Baja";
export type JudgeReviewStatus = "DRAFT" | "SUBMITTED";

export type JudgeProfile = {
  userId: Identifier;
  displayName: string;
  fullName: string;
  initials: string;
  email?: string;
  status?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  ci?: string;
  country?: string;
  city?: string;
  phone?: string;
  birthDate?: string;
  club?: {
    id: Identifier;
    name: string;
    place: string;
  } | null;
  verified: boolean;
};

export type JudgeSummary = {
  pendingUrgent: number;
  nextCutoff: string;
  coveragePercent: number;
};

export type JudgeKpis = {
  pendingCount: number;
  reviewedToday: number;
  averageReviewMinutes: number;
};

export type JudgeQueueItem = {
  id: Identifier;
  project: string;
  participantName: string;
  eventName: string;
  category: string;
  priority: JudgePriority;
  time: string;
  status: JudgeQueueStatus;
  canStart: boolean;
  canComplete: boolean;
  reviewStatus: JudgeReviewStatus;
  myScore: number | null;
};

export type JudgeRecentReview = {
  id: Identifier;
  project: string;
  participantName: string;
  scoreLabel: string;
  result: string;
  updatedAt: string;
};

export type JudgeAssignedEvent = {
  id: Identifier;
  name: string;
  imageUrl?: string | null;
  detail: string;
  pendingCount: number;
  assignedScopes: Array<{
    categoryName: string;
    subcategoryName: string | null;
  }>;
};

export type JudgeDashboardData = {
  profile: JudgeProfile;
  summary: JudgeSummary;
  kpis: JudgeKpis;
  pendingQueue: JudgeQueueItem[];
  recentReviews: JudgeRecentReview[];
  assignedEvents: JudgeAssignedEvent[];
};

export type JudgeReviewCriteria = Partial<
  Record<"tecnica" | "pintura" | "fidelidad" | "detalle" | "presentacion", number>
>;

export type JudgeModelListItem = {
  id: Identifier;
  project: string;
  code: string;
  participantName: string;
  eventName: string;
  category: string;
  priority: JudgePriority;
  dueLabel: string;
  status: JudgeQueueStatus;
  reviewStatus: JudgeReviewStatus;
  myScore: number | null;
  finalScore: number | null;
  submittedAt: string | null;
};

export type JudgeModelListResponse = {
  items: JudgeModelListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type JudgeCategoryNavigationItem = {
  id: Identifier;
  name: string;
  parentId: Identifier | null;
  hasChildren: boolean;
  isLeaf: boolean;
};

export type JudgeModelDetail = {
  id: Identifier;
  nombreModelo: string;
  brand: string;
  description: string;
  code: string;
  status: JudgeQueueStatus;
  finalScore: number | null;
  finalReviewedAt: string | null;
  participant: {
    id: Identifier;
    name: string;
  };
  event: {
    id: Identifier;
    name: string;
    endDate: string | null;
  };
  category: {
    label: string;
    name: string;
    parentName: string | null;
  };
  media: Array<{
    id: Identifier;
    publicUrl: string | null;
    storageKey: string | null;
    mimeType: string;
    fileName: string;
    sortOrder: number;
  }>;
  myReview: {
    id: Identifier;
    status: JudgeReviewStatus;
    criteria: JudgeReviewCriteria | null;
    generalComment: string;
    totalScore: number | null;
    submittedAt: string | null;
    updatedAt: string;
  } | null;
  progress: {
    assignedJudgeCount: number;
    submittedJudgeCount: number;
    allJudgesSubmitted: boolean;
    finalScore: number | null;
  };
};

export type JudgeSaveDraftPayload = {
  criteria?: JudgeReviewCriteria;
  generalComment?: string;
};

export type JudgeSubmitReviewPayload = {
  criteria: Record<"tecnica" | "pintura" | "fidelidad" | "detalle" | "presentacion", number>;
  generalComment?: string;
};

export type JudgeReviewMutationResult = {
  review: {
    id: Identifier;
    status: JudgeReviewStatus;
    criteria: JudgeReviewCriteria | null;
    generalComment: string;
    totalScore: number | null;
    submittedAt: string | null;
    updatedAt: string;
  };
  model: {
    id: Identifier;
    status: JudgeQueueStatus;
    finalScore: number | null;
    finalReviewedAt: string | null;
    assignedJudgeCount: number;
    submittedJudgeCount: number;
    allJudgesSubmitted: boolean;
  };
};

export type JudgeNotificationType =
  | "ASIGNACION_CREADA"
  | "ASIGNACION_REMOVIDA"
  | "PERMISO_OTORGADO"
  | "PERMISO_REVOCADO"
  | "REVISION_REABIERTA"
  | "ROL_JUEZ_OTORGADO"
  | "ALERTA_SISTEMA";

export type JudgeNotificationSeverity = "BAJA" | "MEDIA" | "ALTA";

export type JudgeNotificationItem = {
  id: Identifier;
  type: JudgeNotificationType;
  severity: JudgeNotificationSeverity;
  title: string;
  detail: string;
  targetPath: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
};

export type JudgeNotificationsPageResponse = {
  items: JudgeNotificationItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  unreadCount: number;
};

export type JudgeNotificationsMutationResult = {
  success: boolean;
  marked?: number;
};
