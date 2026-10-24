import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { landingDefaultContent } from "@/presentation/components/features/landing/landing-data";
import { adminLandingService } from "@/application/admin/services/admin-landing.service";
import { AdminLandingSection } from "./admin-landing-section";

vi.mock("@/application/admin/services/admin-landing.service", () => ({
  adminLandingService: {
    getLandingDraftState: vi.fn(),
    listLandingEvents: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const getDraftState = vi.mocked(adminLandingService.getLandingDraftState);
const listLandingEvents = vi.mocked(adminLandingService.listLandingEvents);

beforeEach(() => {
  vi.clearAllMocks();
  const content = structuredClone(landingDefaultContent);
  getDraftState.mockResolvedValue({
    draftContent: content,
    publishedContent: structuredClone(content),
    draftUpdatedAt: "2026-01-01T00:00:00.000Z",
    draftUpdatedBy: null,
    publishedAt: "2026-01-01T00:00:00.000Z",
    publishedBy: null,
    isDraftDirty: false,
  });
  listLandingEvents.mockResolvedValue([]);
});

describe("AdminLandingSection accordion", () => {
  it("opens Hero initially and switches to one section at a time", async () => {
    render(<AdminLandingSection headingClassName="" />);

    const hero = await screen.findByRole("button", { name: "Portada principal" });
    const contact = screen.getByRole("button", { name: "Datos de contacto" });

    expect(hero.getAttribute("aria-expanded")).toBe("true");
    expect(contact.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByText("Título principal")).toBeTruthy();
    expect(screen.queryByText("Correo de contacto")).toBeNull();

    fireEvent.click(contact);

    await waitFor(() => {
      expect(contact.getAttribute("aria-expanded")).toBe("true");
      expect(hero.getAttribute("aria-expanded")).toBe("false");
    });
    expect(screen.getByText("Correo de contacto")).toBeTruthy();
    expect(screen.queryByText("Título principal")).toBeNull();
  });

  it("allows closing the active section", async () => {
    render(<AdminLandingSection headingClassName="" />);

    const hero = await screen.findByRole("button", { name: "Portada principal" });
    fireEvent.click(hero);

    await waitFor(() => expect(hero.getAttribute("aria-expanded")).toBe("false"));
    expect(screen.queryByText("Título principal")).toBeNull();
  });

  it("includes historical events as a closed tenth section", async () => {
    render(<AdminLandingSection headingClassName="" />);

    const hero = await screen.findByRole("button", { name: "Portada principal" });
    const historicalEvents = screen.getByRole("button", { name: "Eventos históricos" });

    expect(historicalEvents.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Administra fichas, imágenes y memorias de eventos pasados.")).toBeNull();

    fireEvent.click(historicalEvents);

    await waitFor(() => {
      expect(historicalEvents.getAttribute("aria-expanded")).toBe("true");
      expect(hero.getAttribute("aria-expanded")).toBe("false");
    });
    expect(screen.getByText("Administra fichas, imágenes y memorias de eventos pasados.")).toBeTruthy();
  });
});
