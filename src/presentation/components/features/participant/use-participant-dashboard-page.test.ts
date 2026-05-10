import { act, renderHook, waitFor } from "@testing-library/react";
import type { ParticipantSectionId } from "@/domain/participant/participant.types";
import { useParticipantDashboardPage } from "./use-participant-dashboard-page";

const push = vi.fn();
const logout = vi.fn<Promise<void>, []>();
const loadDashboard = vi.fn<Promise<void>, [string | undefined]>();
const loadExploreEvents = vi.fn<Promise<void>, []>();
const clearError = vi.fn();
const clearFlowState = vi.fn();

const authState = {
  user: { id: "user-1" },
  logout,
};

const participantState = {
  dashboard: {
    sidebarItems: [
      { id: "inicio", label: "Inicio", icon: "home" },
      { id: "eventos", label: "Eventos", icon: "compass" },
    ],
    profile: {
      userId: "user-dashboard",
      displayName: "User",
      subtitle: "",
      initials: "US",
      verified: true,
    },
    nextChallenge: {
      eventId: null,
      eyebrow: "",
      title: "",
      categoryLine: "",
      organizer: "",
      countdown: {
        days: "00",
        hours: "00",
        minutes: "00",
      },
      imageAlt: "",
    },
    kpis: [],
    openEvents: [],
    clubRanking: {
      enabled: false,
      clubName: "Sin club",
      message: "Sin club asignado",
      position: null,
      totalParticipants: 0,
      averageScore: null,
      scoredModels: 0,
    },
  },
  loading: false,
  error: null as string | null,
  exploreEvents: [] as Array<{ id: string }>,
  loadDashboard,
  loadExploreEvents,
  clearError,
  clearFlowState,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/presentation/stores", () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
  useParticipantStore: (selector: (state: typeof participantState) => unknown) =>
    selector(participantState),
}));

describe("useParticipantDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    participantState.exploreEvents = [];
  });

  it("inicializa estado y marca sidebar activo", () => {
    const { result } = renderHook(() =>
      useParticipantDashboardPage({ activeSection: "eventos" as ParticipantSectionId }),
    );

    expect(result.current.activeSection).toBe("eventos");
    expect(result.current.sidebarItems.find((item) => item.id === "eventos")?.active).toBe(true);
    expect(result.current.effectiveUserId).toBe("user-1");
  });

  it("ejecuta carga inicial y carga eventos cuando la seccion lo requiere", async () => {
    renderHook(() => useParticipantDashboardPage({ activeSection: "eventos" }));

    await waitFor(() => {
      expect(loadDashboard).toHaveBeenCalledWith("user-1");
    });
    await waitFor(() => {
      expect(loadExploreEvents).toHaveBeenCalledTimes(1);
    });
  });

  it("navega de seccion limpiando flow state", () => {
    const { result } = renderHook(() => useParticipantDashboardPage({ activeSection: "inicio" }));

    act(() => {
      result.current.handleSelectSection("resultados");
    });

    expect(clearFlowState).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/participante/resultados");
  });

  it("hace logout y redirige", async () => {
    logout.mockResolvedValue(undefined);
    const { result } = renderHook(() => useParticipantDashboardPage({ activeSection: "inicio" }));

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(logout).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/login");
  });
});
