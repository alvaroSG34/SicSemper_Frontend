import { render, screen } from "@testing-library/react";
import { PublicHeader } from "./public-header";

describe("PublicHeader", () => {
  it("uses compact responsive logo sizing on mobile", () => {
    render(<PublicHeader isLandingPage />);

    const brand = screen.getByText("IPMS BOLIVIA");
    const brandLink = brand.closest("a");
    const headerInner = brandLink?.parentElement;

    expect(brand.className).toContain("text-[28px]");
    expect(brand.className).toContain("sm:text-[34px]");
    expect(brand.className).toContain("md:text-[42px]");
    expect(brand.className).toContain("lg:text-[52px]");
    expect(brand.className).toContain("max-w-[calc(100vw-6.5rem)]");
    expect(brandLink?.className).toContain("min-w-0");
    expect(headerInner?.className).toContain("flex");
    expect(headerInner?.className).toContain("justify-center");
    expect(headerInner?.className).toContain("lg:grid");
    expect(headerInner?.className).toContain("lg:justify-normal");
    expect(headerInner?.className).toContain("px-5");
    expect(headerInner?.className).toContain("lg:px-16");
  });

  it("keeps desktop navigation and auth actions hidden until large screens", () => {
    render(<PublicHeader isLandingPage />);

    expect(screen.getByRole("navigation").className).toContain("hidden");
    expect(screen.getByRole("navigation").className).toContain("lg:flex");
    expect(screen.getByRole("link", { name: /INICIAR SESI.N/ }).parentElement?.className).toContain("hidden");
    expect(screen.getByRole("link", { name: /INICIAR SESI.N/ }).parentElement?.className).toContain("lg:flex");
  });

  it("uses a solid dark login header on mobile and keeps the split background for desktop", () => {
    const { container } = render(<PublicHeader variant="login" activeAuthAction="login" />);
    const header = container.querySelector("header");
    const brand = screen.getByText("IPMS BOLIVIA");

    expect(header?.className).toContain("bg-[#0a0a0a]");
    expect(header?.className).toContain("xl:bg-[linear-gradient");
    expect(brand.className).toContain("text-white");
    expect(brand.className).toContain("xl:text-[#0f172a]");
  });
});
