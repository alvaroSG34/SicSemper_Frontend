import type { Identifier } from "@/core/types";

export type JudgeQueueStatus = "ENVIADA" | "EN_REVISION" | "CALIFICADA";
export type JudgePriority = "Alta" | "Media" | "Baja";

export type JudgeProfile = {
  userId: Identifier;
  displayName: string;
  fullName: string;
  initials: string;
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
  detail: string;
  pendingCount: number;
};

export type JudgeDashboardData = {
  profile: JudgeProfile;
  summary: JudgeSummary;
  kpis: JudgeKpis;
  pendingQueue: JudgeQueueItem[];
  recentReviews: JudgeRecentReview[];
  assignedEvents: JudgeAssignedEvent[];
};
