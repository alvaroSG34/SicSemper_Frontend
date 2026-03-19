import { renderHook } from "@testing-library/react";
import { useJudgeKpis } from "./use-judge-kpis";

let kpis: { pendingCount: number; reviewedToday: number; averageReviewMinutes: number } | null = null;

vi.mock("@/presentation/stores/judge-kpis.slice", () => ({
  useJudgeKpisSlice: () => ({
    kpis,
  }),
}));

describe("useJudgeKpis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    kpis = null;
  });

  it("retorna ceros cuando no hay kpis", () => {
    const { result } = renderHook(() => useJudgeKpis());

    expect(result.current.pendingCount).toBe(0);
    expect(result.current.reviewedToday).toBe(0);
    expect(result.current.averageReviewMinutes).toBe(0);
  });

  it("retorna valores reales cuando hay kpis", () => {
    kpis = {
      pendingCount: 8,
      reviewedToday: 4,
      averageReviewMinutes: 15,
    };
    const { result } = renderHook(() => useJudgeKpis());

    expect(result.current.pendingCount).toBe(8);
    expect(result.current.reviewedToday).toBe(4);
    expect(result.current.averageReviewMinutes).toBe(15);
  });
});
