import { render, screen } from "@testing-library/react";
import { PublicHeader } from "./public-header";

describe("PublicHeader", () => {
  it("uses compact responsive logo sizing on mobile", () => {
    render(<PublicHeader isLandingPage />);

    const brand = screen.getByText("SICSEMPER");
    const brandLink = brand.closest("a");
    const headerInner = brandLink?.parentElement;

    expect(brand.className).toContain("text-[20px]");
    expect(brand.className).toContain("xl:text-[52px]");
    expect(brand.className).toContain("w-[114px]");
    expect(brandLink?.className).toContain("w-[150px]");
    expect(headerInner?.className).toContain("flex");
    expect(headerInner?.className).toContain("h-[80px]");
    expect(headerInner?.className).toContain("border-b");
    expect(headerInner?.className).toContain("xl:grid");
    expect(headerInner?.className).toContain("px-4");
    expect(headerInner?.className).toContain("xl:px-16");
  });

  it("keeps desktop navigation hidden while auth actions remain visible on mobile", () => {
    render(<PublicHeader isLandingPage />);

    expect(screen.getByRole("navigation").className).toContain("hidden");
    expect(screen.getByRole("navigation").className).toContain("xl:flex");
    expect(screen.getByRole("link", { name: /INICIAR SESI.N/ }).className).toContain("inline-flex");
    expect(screen.getByRole("link", { name: /REGISTRARSE/ }).className).toContain("inline-flex");
  });

  it("uses a solid dark login header on mobile and keeps the split background for desktop", () => {
    const { container } = render(<PublicHeader variant="login" activeAuthAction="login" />);
    const header = container.querySelector("header");
    const brand = screen.getByText("SICSEMPER");

    expect(header?.className).toContain("bg-[#0a0a0a]");
    expect(header?.className).toContain("xl:bg-[linear-gradient");
    expect(brand.className).toContain("text-white");
    expect(brand.className).toContain("xl:text-[#0f172a]");
  });

  it("hides role selector for logged-in users on landing", () => {
    render(
      <PublicHeader
        isLandingPage
        currentUserName="David"
        availableRoles={["PARTICIPANTE", "JUEZ"]}
        currentRole="PARTICIPANTE"
        dashboardHref="/participante/inicio"
      />,
    );

    expect(screen.queryByText("Rol")).toBeNull();
    expect(screen.getByRole("link", { name: "MI PANEL" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "CERRAR SESIÓN" })).toBeTruthy();
  });

  it("shows the Eventos link when historical events are available", () => {
    render(<PublicHeader isLandingPage eventsAvailable />);

    expect(screen.getByRole("link", { name: "Eventos" }).getAttribute("href")).toBe("#eventos");
  });
});
