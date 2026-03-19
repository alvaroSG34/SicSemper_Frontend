import { act, renderHook } from "@testing-library/react";
import type { ParticipantDashboardData } from "@/domain/participant/participant.types";
import { useParticipantHome } from "./use-participant-home";

const selectEvent = vi.fn<Promise<boolean>, [string]>();

const dashboard: ParticipantDashboardData = {
  sidebarItems: [
    {
      id: "inicio",
      label: "Inicio",
      icon: "home",
      active: true,
    },
  ],
  profile: {
    userId: "user-1",
    displayName: "Usuario",
    subtitle: "Participante",
    initials: "US",
    verified: true,
  },
  nextChallenge: {
    eventId: "event-1",
    eyebrow: "Proximo reto",
    title: "Evento Uno",
    categoryLine: "Categoria",
    organizer: "Club",
    startDate: "2026-03-20T00:00:00.000Z",
    countdown: {
      days: "01",
      hours: "10",
      minutes: "20",
    },
    imageAlt: "Imagen",
  },
  kpis: [
    {
      id: "kpi-1",
      label: "Eventos",
      value: "3",
      tone: "neutral",
      icon: "trophy",
    },
  ],
  openEvents: [],
};

let currentDashboard: ParticipantDashboardData | null = dashboard;

vi.mock("@/presentation/stores/participant-home.slice", () => ({
  useParticipantHomeSlice: () => ({
    dashboard: currentDashboard,
    selectEvent,
  }),
}));

describe("useParticipantHome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentDashboard = dashboard;
  });

  it("expone challenge y kpis del dashboard", () => {
    const { result } = renderHook(() => useParticipantHome({ onGoToResults: vi.fn() }));

    expect(result.current.challenge?.eventId).toBe("event-1");
    expect(result.current.kpis).toHaveLength(1);
    expect(result.current.isStartingUploadFromNextChallenge).toBe(false);
  });

  it("navega a resultados si selectEvent retorna true", async () => {
    const goToResults = vi.fn();
    selectEvent.mockResolvedValue(true);
    const { result } = renderHook(() => useParticipantHome({ onGoToResults: goToResults }));

    await act(async () => {
      result.current.handleStartUploadFromNextChallenge();
      await Promise.resolve();
    });

    expect(selectEvent).toHaveBeenCalledWith("event-1");
    expect(goToResults).toHaveBeenCalledTimes(1);
  });

  it("no ejecuta seleccion si no existe eventId", () => {
    currentDashboard = {
      ...dashboard,
      nextChallenge: {
        ...dashboard.nextChallenge,
        eventId: null,
      },
    };
    const { result } = renderHook(() => useParticipantHome({ onGoToResults: vi.fn() }));

    act(() => {
      result.current.handleStartUploadFromNextChallenge();
    });

    expect(selectEvent).not.toHaveBeenCalled();
  });
});
