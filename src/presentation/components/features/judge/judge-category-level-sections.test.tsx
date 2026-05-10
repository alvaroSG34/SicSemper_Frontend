import { render, screen, waitFor } from "@testing-library/react";
import { JudgeLevelOneSection } from "./judge-level-one-section";
import { JudgeLevelTwoSection } from "./judge-level-two-section";
import { JudgeLevelThreeSection } from "./judge-level-three-section";

const listEventRootCategories = vi.fn();
const listEventCategoryChildren = vi.fn();

const mockJudgeState = {
  dashboard: {
    assignedEvents: [
      {
        id: "event-1",
        name: "Mandalas",
      },
    ],
  },
  listEventRootCategories,
  listEventCategoryChildren,
};

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/font/google", () => ({
  Outfit: () => ({
    className: "font",
  }),
}));

vi.mock("@/presentation/stores", () => ({
  useJudgeStore: (selector: (state: typeof mockJudgeState) => unknown) =>
    selector(mockJudgeState),
}));

describe("Judge category level sections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pending count in level 1 cards", async () => {
    listEventRootCategories.mockResolvedValueOnce([
      {
        id: "cat-1",
        name: "Aviones",
        parentId: null,
        hasChildren: true,
        isLeaf: false,
        pendingCount: 5,
      },
    ]);

    render(<JudgeLevelOneSection eventId="event-1" />);

    expect(await screen.findByText("Aviones")).toBeTruthy();
    expect(screen.getByText("5 maquetas por calificar")).toBeTruthy();

    await waitFor(() => {
      expect(listEventRootCategories).toHaveBeenCalledWith("event-1");
    });
  });

  it("renders pending count in level 2 cards", async () => {
    listEventCategoryChildren.mockResolvedValueOnce([
      {
        id: "cat-2",
        name: "Biplano",
        parentId: "cat-1",
        hasChildren: true,
        isLeaf: false,
        pendingCount: 2,
      },
    ]);

    render(
      <JudgeLevelTwoSection eventId="event-1" level1Id="cat-1" level1Name="Aviones" />,
    );

    expect(await screen.findByText("Biplano")).toBeTruthy();
    expect(screen.getByText("2 maquetas por calificar")).toBeTruthy();

    await waitFor(() => {
      expect(listEventCategoryChildren).toHaveBeenCalledWith("event-1", "cat-1");
    });
  });

  it("renders singular pending label in level 3 cards", async () => {
    listEventCategoryChildren.mockResolvedValueOnce([
      {
        id: "cat-3",
        name: "Metraplano",
        parentId: "cat-2",
        hasChildren: false,
        isLeaf: true,
        pendingCount: 1,
      },
    ]);

    render(
      <JudgeLevelThreeSection
        eventId="event-1"
        level1Id="cat-1"
        level2Id="cat-2"
        level1Name="Aviones"
        level2Name="Biplano"
      />,
    );

    expect(await screen.findByText("Metraplano")).toBeTruthy();
    expect(screen.getByText("1 maqueta por calificar")).toBeTruthy();

    await waitFor(() => {
      expect(listEventCategoryChildren).toHaveBeenCalledWith("event-1", "cat-2");
    });
  });

  it("hides pending indicator when count is zero", async () => {
    listEventCategoryChildren.mockResolvedValueOnce([
      {
        id: "cat-4",
        name: "Cuatriplano",
        parentId: "cat-1",
        hasChildren: false,
        isLeaf: true,
        pendingCount: 0,
      },
    ]);

    render(
      <JudgeLevelTwoSection eventId="event-1" level1Id="cat-1" level1Name="Aviones" />,
    );

    expect(await screen.findByText("Cuatriplano")).toBeTruthy();
    expect(screen.queryByText(/maquetas por calificar/i)).toBeNull();
    expect(screen.queryByText(/maqueta por calificar/i)).toBeNull();
  });
});
