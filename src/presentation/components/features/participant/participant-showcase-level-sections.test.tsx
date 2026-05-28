import { fireEvent, render, screen } from "@testing-library/react";
import { ParticipantShowcaseLevelTwoSection } from "./participant-showcase-level-two-section";
import { ParticipantShowcaseLevelThreeSection } from "./participant-showcase-level-three-section";

const retryEventContext = vi.fn();

vi.mock("next/font/google", () => ({
  Outfit: () => ({ className: "font-outfit" }),
}));

vi.mock("./use-participant-upload-event-context", () => ({
  useParticipantUploadEventContext: () => ({
    showcaseTree: {
      eventId: "event-1",
      rootIds: ["l1"],
      nodes: [
        { id: "l1", name: "Categoria", parentId: null, hasModels: true, children: ["l2"] },
        { id: "l2", name: "Subcategoria", parentId: "l1", hasModels: true, children: ["l3"] },
        { id: "l3", name: "Final", parentId: "l2", hasModels: true, children: [] },
      ],
    },
    loading: false,
    error: "No se pudieron cargar las subcategorias.",
    retryEventContext,
  }),
}));

describe("Participant showcase level sections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows retry action when level two has loading error", () => {
    render(
      <ParticipantShowcaseLevelTwoSection
        eventId="event-1"
        level1Id="l1"
        level1Name="Categoria"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(retryEventContext).toHaveBeenCalledTimes(1);
  });

  it("shows retry action when level three has loading error", () => {
    render(
      <ParticipantShowcaseLevelThreeSection
        eventId="event-1"
        level1Id="l1"
        level2Id="l2"
        level1Name="Categoria"
        level2Name="Subcategoria"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(retryEventContext).toHaveBeenCalledTimes(1);
  });
});
