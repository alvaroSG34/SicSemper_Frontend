import { render, screen } from "@testing-library/react";
import { JudgeQueueSection } from "./judge-queue-section";

const loadModels = vi.fn<Promise<void>, [unknown?]>();

const mockJudgeState = {
  dashboard: {
    assignedEvents: [
      {
        id: "event-1",
        name: "Open 2026",
        imageUrl: null,
        detail: "2 maquetas asignadas - Vence en 10 dias",
        pendingCount: 1,
        assignedScopes: [
          { categoryName: "Aeronaves", subcategoryName: null },
          { categoryName: "Aeronaves", subcategoryName: "Jets" },
        ],
      },
    ],
  },
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

vi.mock("@/presentation/stores", () => ({
  useJudgeStore: (selector: (state: typeof mockJudgeState) => unknown) =>
    selector(mockJudgeState),
}));

vi.mock("./use-judge-queue", () => ({
  useJudgeQueue: () => ({
    loading: false,
    modelFilters: {
      page: 1,
      pageSize: 12,
      eventId: undefined,
      status: undefined,
      priority: undefined,
      search: undefined,
    },
    models: {
      items: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 1,
    },
    modelsLoading: false,
    modelsError: null,
    selectedModelId: null,
    modelDetail: null,
    detailLoading: false,
    detailError: null,
    queueHeadline: "0 maquetas asignadas",
    loadModels,
    selectModel: vi.fn<Promise<void>, [string | null]>(),
    startReview: vi.fn<Promise<void>, [string]>(),
    saveDraft: vi.fn(),
    submitReview: vi.fn(),
  }),
}));

describe("JudgeQueueSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el resumen del evento bloqueado en el encabezado", () => {
    render(<JudgeQueueSection headingClassName="heading" lockedEventId="event-1" />);

    expect(screen.getByText("Evento: Open 2026")).toBeTruthy();
    expect(screen.getByText("Volver a eventos")).toBeTruthy();
  });
});
