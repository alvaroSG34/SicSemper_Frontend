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
  it("muestra evento y acceso a calificar sin bloque de alcances", () => {
    render(<JudgeEventosSection />);

    expect(screen.getByText("Open 2026")).toBeTruthy();
    expect(screen.queryByText("Alcances asignados")).toBeNull();
    expect(screen.queryByText("Aeronaves")).toBeNull();
    expect(screen.queryByText("Helicopteros")).toBeNull();
    expect(screen.queryByText("Jets")).toBeNull();

    const actionLink = screen.getByRole("link", { name: /Calificar maquetas/i });
    expect(actionLink.getAttribute("href")).toBe("/juez/calificar/event-1/nivel-1");
  });
});
