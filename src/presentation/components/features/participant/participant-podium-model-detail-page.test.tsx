import { render, screen } from "@testing-library/react";
import { ParticipantPodiumModelDetailPage } from "./participant-podium-model-detail-page";

const mockUseParticipantPodiumModelDetail = vi.fn();

vi.mock("./use-participant-podium-model-detail", () => ({
  useParticipantPodiumModelDetail: (...args: unknown[]) =>
    mockUseParticipantPodiumModelDetail(...args),
}));

vi.mock("./participant-dashboard-shell", () => ({
  ParticipantDashboardShell: ({
    children,
  }: {
    children: (ctx: {
      effectiveUserId: string;
      clearFlowState: () => void;
      handleSelectSection: () => void;
    }) => React.ReactNode;
  }) => (
    <div data-testid="mock-dashboard-shell">
      {children({
        effectiveUserId: "user-1",
        clearFlowState: vi.fn(),
        handleSelectSection: vi.fn(),
      })}
    </div>
  ),
}));

vi.mock("@/presentation/components/features/participant/model-detail-view", () => ({
  ModelDetailView: ({ backHref }: { backHref: string }) => (
    <div>
      <span>Detalle de maqueta participante</span>
      <a href={backHref}>Volver</a>
    </div>
  ),
}));

describe("ParticipantPodiumModelDetailPage", () => {
  it("carga el detalle de podio y muestra ModelDetailView con el enlace volver por defecto", () => {
    mockUseParticipantPodiumModelDetail.mockReturnValue({
      loading: false,
      error: null,
      detail: {
        eventId: "event-1",
        eventName: "Nacional 2026",
        model: {
          id: "model-1",
          nombreModelo: "Messerschmitt Bf 109",
          code: "SIC-109",
          brand: "Eduard",
          description: "Caza de la segunda guerra",
          status: "CALIFICADA",
          finalScore: 95,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        owner: {
          userId: "user-2",
          name: "Carlos",
          email: "carlos@example.com",
          clubName: "Club IPMS",
        },
        registration: {
          registrationId: "registration-2",
          registrationCode: "REG-109",
          registrationStatus: "ACTIVA",
          registrationDate: "2026-01-01T00:00:00.000Z",
          eventCategoryId: "event-category-2",
          finalCategoryId: "category-2",
          categoryLabel: "Aviación Militar",
          scaleValue: "1:48",
        },
        media: { images: [], documents: [] },
        scoring: { finalScore: 95, judgeBreakdown: [] },
      },
    });

    render(<ParticipantPodiumModelDetailPage eventId="event-1" modelId="model-1" />);

    expect(screen.getByText("Detalle de maqueta participante")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Volver" }).getAttribute("href")).toBe(
      "/participante/eventos/event-1/podio",
    );
  });

  it("permite especificar un backHref personalizado", () => {
    mockUseParticipantPodiumModelDetail.mockReturnValue({
      loading: false,
      error: null,
      detail: {
        eventId: "event-1",
        eventName: "Nacional 2026",
        model: {
          id: "model-1",
          nombreModelo: "Messerschmitt Bf 109",
          code: "SIC-109",
          brand: "Eduard",
          description: "Caza",
          status: "CALIFICADA",
          finalScore: 95,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        owner: { userId: "user-2", name: "Carlos" },
        registration: {
          registrationId: "reg-1",
          registrationCode: "REG-1",
          registrationStatus: "ACTIVA",
          registrationDate: "2026-01-01T00:00:00.000Z",
          eventCategoryId: "cat-1",
          finalCategoryId: "cat-1",
          categoryLabel: "Aeronaves",
          scaleValue: "1:48",
        },
        media: { images: [], documents: [] },
        scoring: { finalScore: 95, judgeBreakdown: [] },
      },
    });

    render(
      <ParticipantPodiumModelDetailPage
        eventId="event-1"
        modelId="model-1"
        backHref="/participante/eventos/event-1/podio?path=cat-1&scaleId=sc-1"
      />,
    );

    expect(screen.getByRole("link", { name: "Volver" }).getAttribute("href")).toBe(
      "/participante/eventos/event-1/podio?path=cat-1&scaleId=sc-1",
    );
  });

  it("muestra estado de carga y error según corresponda", () => {
    mockUseParticipantPodiumModelDetail.mockReturnValue({
      loading: true,
      error: null,
      detail: null,
    });

    const { rerender } = render(
      <ParticipantPodiumModelDetailPage eventId="event-1" modelId="model-1" />,
    );
    expect(screen.getByText("Cargando detalle de la maqueta...")).toBeTruthy();

    mockUseParticipantPodiumModelDetail.mockReturnValue({
      loading: false,
      error: "Error al cargar la maqueta",
      detail: null,
    });

    rerender(<ParticipantPodiumModelDetailPage eventId="event-1" modelId="model-1" />);
    expect(screen.getByText("Error al cargar la maqueta")).toBeTruthy();
  });
});

