import { render, screen } from "@testing-library/react";
import { JudgeMobileNavigation } from "./judge-dashboard-shell";

vi.mock("next/font/google", () => ({
  Outfit: () => ({ className: "outfit" }),
}));

describe("JudgeMobileNavigation", () => {
  it("renders two app-style navigation tabs", () => {
    render(<JudgeMobileNavigation pathname="/juez/inicio" />);

    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Inicio" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Eventos" }).getAttribute("href")).toBe("/juez/eventos");
  });

  it("keeps Eventos active inside the review flow", () => {
    render(<JudgeMobileNavigation pathname="/juez/calificar/event-1/maquetas/category-1/model-1" />);

    expect(screen.getByRole("link", { name: "Eventos" }).getAttribute("aria-current")).toBe("page");
  });
});
