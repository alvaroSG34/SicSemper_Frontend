import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import PrivacyPage from "./privacidad/page";
import TermsPage from "./terminos/page";

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

vi.mock("@/presentation/components/layout", () => ({
  AutoPublicHeader: () => <div data-testid="auto-public-header" />,
}));

describe("Legal pages", () => {
  it("renders privacy page content", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: "Politica de privacidad" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Volver al inicio" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "contacto@ipmsbolivia.org" }).getAttribute("href")).toBe(
      "mailto:contacto@ipmsbolivia.org",
    );
  });

  it("renders terms page content", () => {
    render(<TermsPage />);

    expect(screen.getByRole("heading", { name: "Terminos y condiciones" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Volver al inicio" }).getAttribute("href")).toBe("/");
  });
});
