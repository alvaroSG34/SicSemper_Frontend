import { render, screen } from "@testing-library/react";
import { JudgePodiumModelDetailPage } from "./judge-podium-model-detail-page";

const mockUseJudgePodiumModelDetail = vi.fn();

vi.mock("./use-judge-podium-model-detail", () => ({
  useJudgePodiumModelDetail: (...args: unknown[]) => mockUseJudgePodiumModelDetail(...args),
}));

vi.mock("@/presentation/components/features/participant/model-detail-view", () => ({
  ModelDetailView: ({ backHref }: { backHref: string }) => (
    <div>
      <span>Detalle de maqueta juez</span>
      <a href={backHref}>Volver</a>
    </div>
  ),
}));

describe("JudgePodiumModelDetailPage", () => {
  it("carga el detalle de podio y muestra ModelDetailView con el enlace volver por defecto", () => {
    mockUseJudgePodiumModelDetail.mockReturnValue({
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
        owner: { userId: "user-2", name: "Carlos", email: "carlos@example.com", clubName: "Club IPMS" },
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

    render(<JudgePodiumModelDetailPage eventId="event-1" modelId="model-1" />);

    expect(screen.getByText("Detalle de maqueta juez")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Volver" }).getAttribute("href")).toBe(
      "/juez/eventos/event-1/podio",
    );
  });

  it("utiliza backHref personalizado cuando se provee", () => {
    mockUseJudgePodiumModelDetail.mockReturnValue({
      loading: false,
      error: null,
      detail: {
        eventId: "event-1",
        eventName: "Nacional 2026",
        model: {
          id: "model-1",
          nombreModelo: "Messerschmitt",
          code: "SIC-109",
          brand: "Eduard",
          description: "Caza",
          status: "CALIFICADA",
          finalScore: 95,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        owner: { userId: "user-2", name: "Carlos", email: "carlos@example.com", clubName: null },
        registration: {
          registrationId: "registration-2",
          registrationCode: "REG-109",
          registrationStatus: "ACTIVA",
          registrationDate: "2026-01-01T00:00:00.000Z",
          eventCategoryId: "event-category-2",
          finalCategoryId: "category-2",
          categoryLabel: "Aviación",
          scaleValue: "1:48",
        },
        media: { images: [], documents: [] },
        scoring: { finalScore: 95, judgeBreakdown: [] },
      },
    });

    render(
      <JudgePodiumModelDetailPage
        eventId="event-1"
        modelId="model-1"
        backHref="/juez/eventos/event-1/podio?path=cat-1&scaleId=scale-1"
      />,
    );

    expect(screen.getByRole("link", { name: "Volver" }).getAttribute("href")).toBe(
      "/juez/eventos/event-1/podio?path=cat-1&scaleId=scale-1",
    );
  });
});

