import { act, renderHook } from "@testing-library/react";
import { useJudgeQueue } from "./use-judge-queue";

const loadModels = vi.fn<Promise<void>, [unknown?]>();
const startReview = vi.fn<Promise<void>, [string]>();

let modelsLoading = false;
let models: {
  items: Array<{ id: string }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} | null = {
  items: [{ id: "m-1" }],
  total: 1,
  page: 1,
  pageSize: 12,
  totalPages: 1,
};

vi.mock("@/presentation/stores/judge-queue.slice", () => ({
  useJudgeQueueSlice: () => ({
    loading: false,
    summary: null,
    modelFilters: { page: 1, pageSize: 12 },
    models,
    modelsLoading,
    modelsError: null,
    selectedModelId: null,
    modelDetail: null,
    detailLoading: false,
    detailError: null,
    loadModels,
    selectModel: vi.fn<Promise<void>, [string | null]>(),
    startReview,
    saveDraft: vi.fn(),
    submitReview: vi.fn(),
  }),
}));

describe("useJudgeQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    modelsLoading = false;
    models = {
      items: [{ id: "m-1" }],
      total: 1,
      page: 1,
      pageSize: 12,
      totalPages: 1,
    };
  });

  it("construye headline segun loading y total", () => {
    const { result, rerender } = renderHook(() => useJudgeQueue());
    expect(result.current.queueHeadline).toBe("1 maquetas asignadas");

    modelsLoading = true;
    rerender();
    expect(result.current.queueHeadline).toBe("Cargando asignaciones...");
  });

  it("carga modelos al montar y expone acciones", async () => {
    models = null;
    const { result } = renderHook(() => useJudgeQueue());

    expect(loadModels).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.startReview("m-1");
    });

    expect(startReview).toHaveBeenCalledWith("m-1");
  });
});
