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

    expect(screen.getByRole("link", { name: "contacto@SICSEMPERbolivia.org" }).getAttribute("href")).toBe(
      "mailto:contacto@SICSEMPERbolivia.org",
    );
    expect(screen.getByRole("link", { name: "Politica de privacidad" }).getAttribute("href")).toBe(
      "/privacidad",
    );
    expect(screen.getByRole("link", { name: "Terminos y condiciones" }).getAttribute("href")).toBe(
      "/terminos",
    );
  });

  it("uses configurable contact details and builds the WhatsApp link", () => {
    render(<LandingFooter contactEmail="hola@example.com" whatsappNumber="+591 700-12345" />);

    expect(screen.getByRole("link", { name: "hola@example.com" }).getAttribute("href")).toBe(
      "mailto:hola@example.com",
    );
    expect(screen.getByRole("link", { name: "Contactar por WhatsApp" }).getAttribute("href")).toBe(
      "https://wa.me/59170012345",
    );
  });

  it("hides WhatsApp when no number is configured", () => {
    render(<LandingFooter whatsappNumber="" />);

    expect(screen.queryByRole("link", { name: "Contactar por WhatsApp" })).toBeNull();
  });
});
