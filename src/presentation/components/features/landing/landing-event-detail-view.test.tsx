import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingEventDetailView } from "./landing-event-detail-view";
import type { LandingEvent } from "@/domain/landing/landing.types";

const event: LandingEvent = {
  id: "current",
  label: "EVENTO PASADO",
  title: "Evento actual",
  summary: "Resumen del evento",
  startDate: null,
  endDate: null,
  place: null,
  format: null,
  coverImageUrl: null,
  storyTitle: null,
  storyParagraphs: [],
  visible: true,
  highlights: [],
  gallery: [],
  createdAt: "",
  updatedAt: "",
};

describe("LandingEventDetailView navigation", () => {
  it("renders only the return link", () => {
    render(<LandingEventDetailView event={event} />);

    expect(screen.getByRole("link", { name: "Volver a eventos" }).getAttribute("href")).toBe("/#eventos");
    expect(screen.queryByRole("link", { name: /Evento anterior/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Evento siguiente/ })).toBeNull();
  });
});
