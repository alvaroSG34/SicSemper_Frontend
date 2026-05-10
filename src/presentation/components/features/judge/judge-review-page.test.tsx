import { render, screen } from "@testing-library/react";
import { JudgeReviewPage } from "./judge-review-page";

const selectModel = vi.fn<Promise<void>, [string | null]>(() => Promise.resolve());
const startReview = vi.fn<Promise<void>, [string]>(() => Promise.resolve());
const submitReview = vi.fn();

const baseModelDetail = {
  id: "model-1",
  nombreModelo: "Yamala - Nave Insignia",
  brand: "Bandai",
  description: "Descripcion de prueba",
  code: "MO-045",
  status: "EN_REVISION" as const,
  finalScore: null,
  finalReviewedAt: null,
  participant: {
    id: "participant-1",
    name: "Juan Perez",
  },
  event: {
    id: "event-1",
    name: "Mandalas",
    endDate: null,
  },
  category: {
    label: "Figuras - Ciencia Ficcion",
    name: "Ciencia Ficcion",
    parentName: "Figuras",
  },
  media: [],
  myReview: {
    id: "review-1",
    status: "DRAFT" as const,
    criteria: {
      armado: 7,
      pintura: 8,
      detallesAgregados: 6,
    },
    generalComment: "",
    totalScore: null,
    submittedAt: null,
    updatedAt: "2026-04-19T10:00:00.000Z",
  },
  panelReviews: [
    {
      judgeUserId: "judge-1",
      judgeName: "Juez Garcia",
      isCurrentJudge: true,
      status: "DRAFT" as const,
      criteria: {
        armado: 7,
        pintura: 8,
        detallesAgregados: 6,
      },
      totalScore: null,
      submittedAt: null,
    },
  ],
  reviewSummary: {
    currentJudgeScore: null,
    maxScore: 30,
    averageScore: null,
    assignedJudgeCount: 3,
    submittedJudgeCount: 1,
  },
  progress: {
    assignedJudgeCount: 3,
    submittedJudgeCount: 1,
    allJudgesSubmitted: false,
    finalScore: null,
  },
};

let mockJudgeState = {
  selectedModelId: "model-1",
  modelDetail: baseModelDetail,
  detailLoading: false,
  detailError: null as string | null,
  loading: false,
  selectModel,
  startReview,
  submitReview,
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

describe("JudgeReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJudgeState = {
      ...mockJudgeState,
      modelDetail: {
        ...baseModelDetail,
        myReview: {
          ...baseModelDetail.myReview,
          status: "DRAFT",
        },
      },
    };
  });

  it("renderiza criterios y boton de guardado cuando la review es editable", () => {
    render(
      <JudgeReviewPage
        modelId="model-1"
        backHref="/juez/calificar/event-1/maquetas/cat-1/final-1"
        level1Name="Figuras"
        level2Name={null}
        finalCategoryName="Ciencia Ficcion"
      />,
    );

    expect(screen.getAllByText("Armado").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pintura").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Detalles agregados").length).toBeGreaterThan(0);
    expect(screen.getByText("Guardar calificacion")).toBeTruthy();
  });

  it("muestra estado solo lectura cuando la review ya fue enviada", () => {
    mockJudgeState = {
      ...mockJudgeState,
      modelDetail: {
        ...baseModelDetail,
        myReview: {
          ...baseModelDetail.myReview,
          status: "SUBMITTED",
          totalScore: 21,
        },
      },
    };

    render(
      <JudgeReviewPage
        modelId="model-1"
        backHref="/juez/calificar/event-1/maquetas/cat-1/final-1"
        level1Name="Figuras"
        level2Name={null}
        finalCategoryName="Ciencia Ficcion"
      />,
    );

    expect(screen.getByText("Calificacion enviada (solo lectura)")).toBeTruthy();
    expect(screen.queryByText("Guardar calificacion")).toBeNull();
  });
});
