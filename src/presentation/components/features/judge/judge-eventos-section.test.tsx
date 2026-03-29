import { render, screen } from "@testing-library/react";
import { JudgeEventosSection } from "./judge-eventos-section";

const mockJudgeState = {
  loading: false,
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
          { categoryName: "Aeronaves", subcategoryName: "Helicopteros" },
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

vi.mock("next/font/google", () => ({
  Outfit: () => ({
    className: "font",
  }),
}));

vi.mock("@/presentation/stores", () => ({
  useJudgeStore: (selector: (state: typeof mockJudgeState) => unknown) =>
    selector(mockJudgeState),
}));

describe("JudgeEventosSection", () => {
  it("muestra alcances agrupados por categoria en cada evento", () => {
    render(<JudgeEventosSection />);

    expect(screen.getByText("Open 2026")).toBeTruthy();
    expect(screen.getByText("Alcances asignados")).toBeTruthy();
    expect(screen.getByText("Aeronaves")).toBeTruthy();
    expect(screen.getByText("General (toda la categoría)")).toBeTruthy();
    expect(screen.getByText("Helicopteros")).toBeTruthy();
    expect(screen.getByText("Jets")).toBeTruthy();
  });
});
