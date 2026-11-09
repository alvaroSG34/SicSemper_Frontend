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
    expect(
      screen.getByRole("link", { name: "Club de modelismo en Santa Cruz" }).getAttribute("href"),
    ).toBe("/club-modelismo-santa-cruz");
    expect(screen.getByRole("link", { name: "Eventos de modelismo" }).getAttribute("href")).toBe(
      "/eventos",
    );
    expect(screen.getByRole("link", { name: "Cronograma" }).getAttribute("href")).toBe("#agenda");
    expect(screen.getByRole("link", { name: "Crear cuenta" }).getAttribute("href")).toBe(
      "/register",
    );
    expect(screen.getByRole("link", { name: "Iniciar sesión" }).getAttribute("href")).toBe(
      "/login",
    );
    expect(screen.getByRole("link", { name: "Organizadores" }).getAttribute("href")).toBe(
      "#equipo",
    );
    expect(screen.getByRole("link", { name: "Ubicación del evento" }).getAttribute("href")).toBe(
      "#ubicacion",
    );
  });

  it("renders contact and legal links", () => {
    render(<LandingFooter />);

    expect(
      screen.getByRole("link", { name: "contacto@SICSEMPERbolivia.org" }).getAttribute("href"),
    ).toBe("mailto:contacto@SICSEMPERbolivia.org");
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
