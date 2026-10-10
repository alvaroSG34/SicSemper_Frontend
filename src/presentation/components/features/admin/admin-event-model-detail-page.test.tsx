import { render, screen } from "@testing-library/react";
import { AdminEventModelDetailPage } from "./admin-event-model-detail-page";

const mockUseAdminEventModelDetail = vi.fn();

vi.mock("./use-admin-event-model-detail", () => ({
  useAdminEventModelDetail: (...args: unknown[]) => mockUseAdminEventModelDetail(...args),
}));

vi.mock("@/presentation/components/features/participant/model-detail-view", () => ({
  ModelDetailView: ({ backHref }: { backHref: string }) => (
    <div>
      <span>Detalle compartido</span>
      <a href={backHref}>Volver al podio</a>
    </div>
  ),
}));

describe("AdminEventModelDetailPage", () => {
  it("carga el detalle administrativo y vuelve a la pestaña Podio", () => {
    mockUseAdminEventModelDetail.mockReturnValue({
      loading: false,
      error: null,
      detail: {
        eventId: "event-1",
        eventName: "Expo",
        model: {
          id: "model-1",
          nombreModelo: "Spitfire",
          code: "SIC-001",
          brand: "Tamiya",
          description: "Modelo",
          status: "CALIFICADA",
          finalScore: 98,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        owner: { userId: "user-1", name: "Ana", email: "ana@example.com", clubName: null },
        registration: {
          registrationId: "registration-1",
          registrationCode: "REG-001",
          registrationStatus: "ACTIVA",
          registrationDate: "2026-01-01T00:00:00.000Z",
          eventCategoryId: "event-category-1",
          finalCategoryId: "category-1",
          categoryLabel: "Aviones",
          scaleValue: "1:72",
        },
        media: { images: [], documents: [] },
        scoring: { finalScore: 98, judgeBreakdown: [] },
      },
    });

    render(<AdminEventModelDetailPage eventId="event-1" modelId="model-1" />);

    expect(screen.getByText("Detalle compartido")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Volver al podio" }).getAttribute("href")).toBe(
      "/admin/eventos/event-1/control?tab=podio",
    );
  });
});
