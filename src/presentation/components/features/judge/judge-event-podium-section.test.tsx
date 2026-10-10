import { render, screen } from "@testing-library/react";
import { JudgeEventPodiumSection } from "./judge-event-podium-section";
import type { AdminEventPodiumInitialSelection } from "@/presentation/components/features/admin/use-admin-event-podium";

let capturedModelDetailHref: ((eventId: string, modelId: string, selection: AdminEventPodiumInitialSelection) => string) | undefined;
let capturedInitialSelection: AdminEventPodiumInitialSelection | undefined;

vi.mock("@/presentation/components/features/admin/admin-event-podium-section", () => ({
  AdminEventPodiumSection: ({
    modelDetailHref,
    initialSelection,
  }: {
    modelDetailHref?: (eventId: string, modelId: string, selection: AdminEventPodiumInitialSelection) => string;
    initialSelection?: AdminEventPodiumInitialSelection;
  }) => {
    capturedModelDetailHref = modelDetailHref;
    capturedInitialSelection = initialSelection;
    return <div data-testid="mock-admin-podium">Podium section</div>;
  },
}));

describe("JudgeEventPodiumSection", () => {
  it("renderiza botón volver a eventos en modo activo y genera link a detalle de maqueta en podio", () => {
    render(<JudgeEventPodiumSection eventId="event-1" />);

    expect(screen.getByRole("link", { name: "Volver a eventos" }).getAttribute("href")).toBe(
      "/juez/eventos",
    );
    expect(screen.getByTestId("mock-admin-podium")).toBeTruthy();

    expect(capturedModelDetailHref).toBeDefined();
    const href = capturedModelDetailHref!("event-1", "model-99", {
      selectedPath: ["cat-1", "cat-2"],
      finalCategoryId: "cat-2",
      selectedSegment: { scaleId: "scale-1", groupId: undefined },
    });

    expect(href).toBe(
      "/juez/eventos/event-1/maquetas/model-99?path=cat-1%2Ccat-2&finalCategoryId=cat-2&scaleId=scale-1",
    );
  });

  it("renderiza botón volver al evento en modo histórico y genera link a detalle de maqueta histórica", () => {
    const initialSelection: AdminEventPodiumInitialSelection = {
      selectedPath: ["cat-1"],
      finalCategoryId: "cat-1",
      selectedSegment: { scaleId: undefined, groupId: "group-1" },
    };

    render(
      <JudgeEventPodiumSection
        eventId="event-2"
        historyMode
        initialSelection={initialSelection}
      />,
    );

    expect(screen.getByRole("link", { name: "Volver al evento" }).getAttribute("href")).toBe(
      "/juez/eventos/pasados/event-2",
    );
    expect(capturedInitialSelection).toEqual(initialSelection);

    const href = capturedModelDetailHref!("event-2", "model-100", {
      selectedPath: ["cat-1"],
      finalCategoryId: "cat-1",
      selectedSegment: { scaleId: undefined, groupId: "group-1" },
    });

    expect(href).toBe(
      "/juez/eventos/pasados/event-2/maquetas/model-100?path=cat-1&finalCategoryId=cat-1&groupId=group-1&podium=1",
    );
  });
});
