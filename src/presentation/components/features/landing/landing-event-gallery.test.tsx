import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingEventGallery } from "./landing-event-gallery";

const photos = [
  { id: "one", imageUrl: "https://cdn.test/one.webp", altText: "Primera foto", caption: "Primera", position: 0 },
  { id: "two", imageUrl: "https://cdn.test/two.webp", altText: "Segunda foto", caption: "Segunda", position: 1 },
];

describe("LandingEventGallery", () => {
  it("opens, navigates and closes the lightbox", () => {
    render(<LandingEventGallery photos={photos} title="Evento" />);

    fireEvent.click(screen.getByAltText("Primera foto"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Imagen siguiente" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Imagen anterior" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Imagen siguiente" }));
    expect(screen.getByRole("dialog").querySelector('img[alt="Segunda foto"]')).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Imagen siguiente" })).toBeNull();
    expect(screen.getByRole("button", { name: "Imagen anterior" })).toBeTruthy();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
