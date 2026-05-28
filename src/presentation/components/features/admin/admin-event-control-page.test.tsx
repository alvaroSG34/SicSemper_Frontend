import { render, screen } from "@testing-library/react";
import { AdminEventControlPage } from "./admin-event-control-page";

const mockUseAdminEventControl = vi.fn();
const mockCreateAdminAccessMatrix = vi.fn();

const authState = {
  user: { id: "admin-1", roles: ["ADMIN"] },
  currentRole: "ADMIN",
};

const adminState = {
  dashboard: { effectivePermissions: ["ADMIN_EVENTS_READ", "ADMIN_USERS_UPDATE"] },
  summary: null,
  loadSummary: vi.fn(),
};

vi.mock("next/font/google", () => ({
  Outfit: () => ({ className: "outfit" }),
}));

vi.mock("@/presentation/components/ui", () => ({
  ImageWithSkeleton: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));

vi.mock("@/presentation/components/features/admin/use-admin-event-control", () => ({
  useAdminEventControl: (...args: unknown[]) => mockUseAdminEventControl(...args),
}));

vi.mock("@/presentation/components/features/admin/admin-access-matrix", () => ({
  createAdminAccessMatrix: (...args: unknown[]) => mockCreateAdminAccessMatrix(...args),
}));

vi.mock("@/presentation/stores", () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
  useAdminStore: (selector: (state: typeof adminState) => unknown) => selector(adminState),
}));

describe("AdminEventControlPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateAdminAccessMatrix.mockReturnValue({
      module: {
        events: { read: true },
        users: { update: true },
      },
    });
    mockUseAdminEventControl.mockReturnValue({
      loading: false,
      error: null,
      pendingAction: null,
      summary: {
        eventId: "event-1",
        eventName: "Expo 2026",
        eventStatus: "ACTIVO",
        startDate: "2026-10-10T08:00:00.000Z",
        endDate: "2026-10-12T20:00:00.000Z",
        organizerClubName: "IPMS Bolivia",
        registrationsCount: 12,
        uniqueParticipantsCount: 10,
        verifiedParticipantsCount: 7,
        unverifiedParticipantsCount: 3,
        suspendedParticipantsCount: 1,
        participantsWithModelsCount: 8,
        participantsWithoutModelsCount: 2,
        modelsCount: 24,
        modelsEnviadasCount: 6,
        modelsEnRevisionCount: 7,
        modelsCalificadasCount: 11,
        pendingReviewModelsCount: 13,
        averageFinalScore: 17.53,
        qualifiedModelsRate: 45.83,
        judgeReviewsSubmittedCount: 31,
        judgeReviewsDraftCount: 4,
        topSegmentsByScore: [],
        topSegmentsByVolume: [],
        recentActivity: [],
      },
      participants: [],
      participantsFilters: { search: "", userStatus: "", registrationStatus: "", verified: "" },
      setParticipantsFilters: vi.fn(),
      participantsPage: 1,
      setParticipantsPage: vi.fn(),
      participantsPageSize: 20,
      setParticipantsPageSize: vi.fn(),
      participantSummary: { total: 0, page: 1, pageSize: 20, totalPages: 1 },
      selectedParticipantDetail: null,
      setSelectedParticipantDetail: vi.fn(),
      openParticipantDetail: vi.fn(),
      setParticipantVerifiedFromList: vi.fn(),
      toggleParticipantBanFromList: vi.fn(),
      models: [],
      modelsFilters: { search: "", status: "", sort: "SCORE_DESC" },
      setModelsFilters: vi.fn(),
      modelsPage: 1,
      setModelsPage: vi.fn(),
      modelsPageSize: 20,
      setModelsPageSize: vi.fn(),
      modelsSummary: { total: 0, page: 1, pageSize: 20, totalPages: 1 },
      selectedModelDetail: null,
      setSelectedModelDetail: vi.fn(),
      openModelDetail: vi.fn(),
    });
  });

  it("renders operational summary blocks", () => {
    render(<AdminEventControlPage eventId="event-1" />);

    expect(screen.getByText("Salud del evento")).toBeTruthy();
    expect(screen.getByText("Embudo operativo")).toBeTruthy();
    expect(screen.getByText("Podio operativo por segmento")).toBeTruthy();
    expect(screen.getByText("Actividad reciente")).toBeTruthy();
    expect(screen.getByText("Sin actividad reciente para este evento.")).toBeTruthy();
  });
});

