import { act, renderHook, waitFor } from "@testing-library/react";
import { useJudgeDashboardPage } from "./use-judge-dashboard-page";

const push = vi.fn();
const logout = vi.fn<Promise<void>, []>();
const loadDashboard = vi.fn<Promise<void>, []>();
const startReview = vi.fn<Promise<void>, [string]>();
const clearError = vi.fn();

const authState = {
  logout,
};

const judgeState = {
  dashboard: {
    profile: {
      displayName: "Juez Uno",
      initials: "JU",
      verified: true,
    },
    summary: {
      pendingUrgent: 1,
      nextCutoff: "Hoy 18:00",
      coveragePercent: 50,
    },
    kpis: {
      pendingCount: 2,
      reviewedToday: 3,
      averageReviewMinutes: 10,
    },
    pendingQueue: [
      {
        id: "m-1",
        project: "Modelo",
        category: "Categoria",
        participantName: "Participante",
        eventName: "Evento",
        priority: "ALTA",
        time: "10m",
        status: "PENDIENTE",
        canStart: true,
        canComplete: false,
      },
    ],
    recentReviews: [],
    assignedEvents: [],
  },
  loading: false,
  error: null as string | null,
  loadDashboard,
  startReview,
  clearError,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/presentation/stores", () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
  useJudgeStore: (selector: (state: typeof judgeState) => unknown) => selector(judgeState),
}));

describe("useJudgeDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carga dashboard al montar y expone datos derivados", async () => {
    const { result } = renderHook(() => useJudgeDashboardPage());

    await waitFor(() => {
      expect(loadDashboard).toHaveBeenCalledTimes(1);
    });

    expect(result.current.profile?.displayName).toBe("Juez Uno");
    expect(result.current.pendingQueue).toHaveLength(1);
    expect(result.current.kpis?.pendingCount).toBe(2);
  });

  it("expone acciones del store", async () => {
    const { result } = renderHook(() => useJudgeDashboardPage());

    await act(async () => {
      await result.current.startReview("m-1");
    });

    expect(startReview).toHaveBeenCalledWith("m-1");
  });

  it("hace logout y redirige", async () => {
    logout.mockResolvedValue(undefined);
    const { result } = renderHook(() => useJudgeDashboardPage());

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(logout).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/login");
  });
});
