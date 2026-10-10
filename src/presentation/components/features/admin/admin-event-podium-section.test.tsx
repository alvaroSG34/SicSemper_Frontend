import { fireEvent, render, screen } from "@testing-library/react";
import { AdminEventPodiumSection } from "./admin-event-podium-section";

const mockUseAdminEventPodium = vi.fn();

vi.mock("./use-admin-event-podium", () => ({
  useAdminEventPodium: (...args: unknown[]) => mockUseAdminEventPodium(...args),
}));

vi.mock("@/presentation/components/ui", () => ({
  ImageWithSkeleton: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));

describe("AdminEventPodiumSection", () => {
  it("permite elegir la rama y muestra podium y ranking paginado", () => {
    const selectCategory = vi.fn();
    const selectSegment = vi.fn();
    mockUseAdminEventPodium.mockReturnValue({
      tree: {
        eventName: "Expo",
        nodes: [{ id: "cat-1", name: "Aviones", parentId: null, children: [] }],
        rootIds: ["cat-1"],
      },
      nodesById: new Map([
        ["cat-1", { id: "cat-1", name: "Aviones", parentId: null, children: [] }],
      ]),
      currentOptions: [{ id: "cat-1", name: "Aviones", parentId: null, children: [] }],
      selectedPath: ["cat-1"],
      finalCategoryId: "cat-1",
      segments: [
        {
          id: "scale-1",
          type: "SCALE",
          label: "1:72",
          scaleId: "scale-1",
          groupId: null,
          qualifiedModelsCount: 1,
        },
      ],
      selectedSegment: { scaleId: "scale-1" },
      result: {
        categoryLabel: "Aviones",
        segmentLabel: "1:72",
        total: 1,
        page: 1,
        totalPages: 1,
        pageSize: 20,
        manualTieBreakApplied: false,
        manualTieBreakLabel: null,
        podium: [
          {
            position: 1,
            modelId: "model-1",
            modelName: "Spitfire",
            modelCode: "SIC-001",
            participantName: "Ana",
            finalScore: 98,
            previewImageUrl: null,
          },
        ],
        rankings: [
          {
            position: 1,
            modelId: "model-1",
            modelName: "Spitfire",
            modelCode: "SIC-001",
            participantName: "Ana",
            finalScore: 98,
            previewImageUrl: null,
          },
        ],
      },
      loading: false,
      loadingSegments: false,
      loadingResult: false,
      error: null,
      selectCategory,
      selectSegment,
      goBack: vi.fn(),
      setPage: vi.fn(),
      setPageSize: vi.fn(),
      reload: vi.fn(),
    });

    render(<AdminEventPodiumSection eventId="event-1" />);
    fireEvent.click(screen.getAllByRole("button", { name: /Aviones/ })[1]);
    expect(selectCategory).toHaveBeenCalledWith("cat-1", 0);
    expect(screen.getByText("Podio del evento")).toBeTruthy();
    expect(screen.getAllByText("Spitfire").length).toBeGreaterThan(0);
    expect(screen.getByText("Detalle de posiciones")).toBeTruthy();
    expect(screen.queryByRole("columnheader", { name: "Estado" })).toBeNull();
    expect(screen.getByRole("link", { name: "Ver maqueta" }).getAttribute("href")).toBe(
      "/admin/eventos/event-1/control/maquetas/model-1?tab=podio&path=cat-1&finalCategoryId=cat-1&scaleId=scale-1",
    );
  });
});
