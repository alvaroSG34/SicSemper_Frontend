import { render, screen } from "@testing-library/react";
import type { ParticipantSidebarItem } from "@/domain/participant/participant.types";
import { ParticipantMobileSidebar } from "./participant-sidebar";

const navigation = vi.hoisted(() => ({ pathname: "/participante/eventos" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

const items: ParticipantSidebarItem[] = [
  { id: "inicio", label: "Inicio", icon: "home" },
  { id: "eventos", label: "Eventos", icon: "trophy", active: true },
  { id: "maquetas", label: "Maquetas", icon: "folderOpen" },
];

describe("ParticipantMobileSidebar", () => {
  it("renders the three app-style navigation tabs and marks the active section", () => {
    render(<ParticipantMobileSidebar items={items} />);

    const navigationBar = screen.getByRole("navigation", { name: "Navegacion de participante" });
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Inicio" }).getAttribute("href")).toBe("/participante/inicio");
    expect(screen.getByRole("link", { name: "Eventos" }).getAttribute("aria-current")).toBe("page");
    expect(navigationBar.textContent).not.toContain("IPMS BOLIVIA");
  });
});
