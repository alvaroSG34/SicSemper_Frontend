export type ApiAdminEventControlSummarySegment = {
  eventCategoryId: string;
  finalCategoryId: string;
  categoryLabel: string;
  scaleId: string;
  scaleValue: string;
  modelsCount: number;
  averageFinalScore: number | null;
};

export type ApiAdminEventControlSummaryActivity = {
  type: "REGISTRATION_CREATED" | "MODEL_CREATED" | "JUDGE_REVIEW_SUBMITTED";
  timestamp: string;
  actorName: string;
  detail: string;
};

export type ApiAdminEventControlSummary = {
  eventId: string;
  eventName: string;
  eventStatus: "ACTIVO" | "PAUSADO" | "BORRADOR" | "FINALIZADO";
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
  topSegmentsByScore: ApiAdminEventControlSummarySegment[];
  topSegmentsByVolume: ApiAdminEventControlSummarySegment[];
  recentActivity: ApiAdminEventControlSummaryActivity[];
};

export type ApiAdminEventControlPage<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ApiAdminEventControlParticipantRow = {
  userId: string;
  name: string;
  email: string;
  status: string;
  verified: boolean;
  clubName: string | null;
  registrationsCount: number;
  modelsCount: number;
  lastRegistrationDate: string | null;
};

export type ApiAdminEventControlParticipantDetail = {
  eventId: string;
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
    verified: boolean;
    clubName: string | null;
  };
  registrations: Array<{
    registrationId: string;
    registrationCode: string;
    registrationStatus: string;
    registrationDate: string;
    eventCategoryId: string;
    finalCategoryId: string;
    categoryLabel: string;
    modelsCount: number;
  }>;
  models: Array<{
    id: string;
    nombreModelo: string;
    code: string;
    status: string;
    finalScore: number | null;
    createdAt: string;
    eventCategoryId: string;
    finalCategoryId: string;
    categoryLabel: string;
    scaleValue: string;
  }>;
};

export type ApiAdminEventControlModelRow = {
  id: string;
  nombreModelo: string;
  code: string;
  status: string;
  finalScore: number | null;
  createdAt: string;
  participantUserId: string;
  participantName: string;
  participantEmail: string;
  registrationCode: string;
  registrationStatus: string;
  eventCategoryId: string;
  finalCategoryId: string;
  categoryLabel: string;
  scaleValue: string;
};

export type ApiAdminEventControlModelDetail = {
  eventId: string;
  model: {
    id: string;
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
    userId: string;
    name: string;
    email: string;
    clubName: string | null;
  };
  registration: {
    registrationId: string;
    registrationCode: string;
    registrationStatus: string;
    registrationDate: string;
    eventCategoryId: string;
    finalCategoryId: string;
    categoryLabel: string;
    scaleValue: string;
  };
  media: {
    images: Array<{
      id: string;
      fileName: string;
      mimeType: string;
      publicUrl: string | null;
      sortOrder: number;
    }>;
    documents: Array<{
      id: string;
      fileName: string;
      mimeType: string;
      publicUrl: string | null;
      sortOrder: number;
    }>;
  };
  scoring: {
    finalScore: number | null;
    judgeBreakdown: Array<{
      judgeUserId: string;
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
