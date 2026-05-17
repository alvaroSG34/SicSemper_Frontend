import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { LandingFooter } from "./landing-footer";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("LandingFooter", () => {
  it("renders clickable navigation links", () => {
    render(<LandingFooter />);

    expect(screen.getByRole("link", { name: "Inicio" }).getAttribute("href")).toBe("#inicio");
    expect(screen.getByRole("link", { name: "Acerca de" }).getAttribute("href")).toBe("#acerca");
    expect(screen.getByRole("link", { name: "Agenda" }).getAttribute("href")).toBe("#agenda");
    expect(screen.getByRole("link", { name: "Organizadores" }).getAttribute("href")).toBe("#equipo");
    expect(screen.getByRole("link", { name: "Ubicacion" }).getAttribute("href")).toBe("#ubicacion");
  });

  it("renders contact and legal links", () => {
    render(<LandingFooter />);

    expect(screen.getByRole("link", { name: "contacto@ipmsbolivia.org" }).getAttribute("href")).toBe(
      "mailto:contacto@ipmsbolivia.org",
    );
    expect(screen.getByRole("link", { name: "Politica de privacidad" }).getAttribute("href")).toBe(
      "/privacidad",
    );
    expect(screen.getByRole("link", { name: "Terminos y condiciones" }).getAttribute("href")).toBe(
      "/terminos",
    );
  });
});
