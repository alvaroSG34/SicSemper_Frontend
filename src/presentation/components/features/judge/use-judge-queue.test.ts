import { act, renderHook } from "@testing-library/react";
import { useJudgeQueue } from "./use-judge-queue";

const startReview = vi.fn<Promise<void>, [string]>();
const completeReview = vi.fn<Promise<void>, [string]>();

let loading = false;
let pendingQueue = [
  {
    id: "m-1",
    project: "Modelo",
    participantName: "Participante",
    eventName: "Evento",
    category: "Categoria",
    priority: "Alta",
    time: "10m",
    status: "ENVIADA",
    canStart: true,
    canComplete: false,
  },
];
const summary = {
  pendingUrgent: 2,
  nextCutoff: "Hoy 18:00",
  coveragePercent: 40,
};

vi.mock("@/presentation/stores/judge-queue.slice", () => ({
  useJudgeQueueSlice: () => ({
    loading,
    pendingQueue,
    summary,
    startReview,
    completeReview,
  }),
}));

describe("useJudgeQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loading = false;
    pendingQueue = [
      {
        id: "m-1",
        project: "Modelo",
        participantName: "Participante",
        eventName: "Evento",
        category: "Categoria",
        priority: "Alta",
        time: "10m",
        status: "ENVIADA",
        canStart: true,
        canComplete: false,
      },
    ];
  });

  it("construye headline segun loading y cantidad", () => {
    const { result, rerender } = renderHook(() => useJudgeQueue());
    expect(result.current.queueHeadline).toBe("1 maquetas por revisar");

    loading = true;
    rerender();
    expect(result.current.queueHeadline).toBe("Cargando asignaciones...");
  });

  it("expone acciones del slice", async () => {
    const { result } = renderHook(() => useJudgeQueue());

    await act(async () => {
      await result.current.startReview("m-1");
      await result.current.completeReview("m-1");
    });

    expect(startReview).toHaveBeenCalledWith("m-1");
    expect(completeReview).toHaveBeenCalledWith("m-1");
  });
});
