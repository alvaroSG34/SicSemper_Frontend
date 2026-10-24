import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LandingEventDraftInput } from "@/domain/landing/landing.types";
import { BasicStep, GalleryStep, HighlightsStep } from "./admin-landing-event-editor";

const draft: LandingEventDraftInput = {
  label: "EVENTO PASADO",
  title: "Encuentro",
  summary: "Resumen",
  startDate: null,
  endDate: null,
  place: "",
  format: "",
  coverImageUrl: "",
  storyTitle: "",
  storyParagraphs: [],
  highlights: [{ name: "Ana Pérez", role: "Jueza", imageUrl: "" }],
  gallery: [],
};

describe("HighlightsStep", () => {
  it("muestra los campos de la tarjeta y solo la carga directa de imagen", () => {
    render(<HighlightsStep draft={draft} update={vi.fn()} move={vi.fn()} assets={[]} uploadAsset={vi.fn().mockResolvedValue("/image.webp")} />);

    expect(screen.getByDisplayValue("Ana Pérez")).toBeTruthy();
    expect(screen.getByDisplayValue("Jueza")).toBeTruthy();
    expect(screen.getByText("Subir imagen")).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByRole("button", { name: "Agregar persona destacada" })).toBeTruthy();
  });

  it("mantiene las acciones de orden y eliminación y agrega la tarjeta al final", () => {
    const update = vi.fn();
    const move = vi.fn();
    render(<HighlightsStep draft={draft} update={update} move={move} assets={[]} uploadAsset={vi.fn().mockResolvedValue("/image.webp")} />);

    fireEvent.click(screen.getByRole("button", { name: "Mover arriba" }));
    fireEvent.click(screen.getByRole("button", { name: "Mover abajo" }));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar persona destacada" }));
    expect(move).toHaveBeenNthCalledWith(1, "highlights", 0, -1);
    expect(move).toHaveBeenNthCalledWith(2, "highlights", 0, 1);
    expect(update).toHaveBeenCalledWith("highlights", []);

    fireEvent.click(screen.getByRole("button", { name: "Agregar persona destacada" }));
    expect(update).toHaveBeenLastCalledWith("highlights", [{ name: "Ana Pérez", role: "Jueza", imageUrl: "" }, { name: "", role: "", imageUrl: "" }]);
  });
});

describe("BasicStep portada", () => {
  it("separa la preview del dropzone y conserva la imagen completa", () => {
    render(<BasicStep draft={{ ...draft, coverImageUrl: "/cover.webp" }} update={vi.fn()} assets={[]} uploadAsset={vi.fn().mockResolvedValue("/uploaded.webp")} />);

    const preview = screen.getByAltText("Vista previa de portada");
    expect(preview.getAttribute("src")).toBe("/cover.webp");
    expect(preview.className).toContain("object-contain");
    expect(screen.getByText("Arrastra una imagen aquí")).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("muestra el estado vacío y actualiza la portada al soltar una imagen", async () => {
    const update = vi.fn();
    const uploadAsset = vi.fn().mockResolvedValue("/uploaded.webp");
    render(<BasicStep draft={draft} update={update} assets={[]} uploadAsset={uploadAsset} />);

    expect(screen.getByText("Sin portada")).toBeTruthy();
    const file = new File(["image"], "cover.webp", { type: "image/webp" });
    fireEvent.drop(screen.getByText("Arrastra una imagen aquí").closest("label")!, { dataTransfer: { files: [file] } });

    await waitFor(() => expect(uploadAsset).toHaveBeenCalledWith(file));
    expect(update).toHaveBeenCalledWith("coverImageUrl", "/uploaded.webp");
  });
});

describe("GalleryStep", () => {
  it("agrega una foto desde el selector local sin mostrar campos de texto", async () => {
    const update = vi.fn();
    const uploadAsset = vi.fn().mockResolvedValue("/uploads/ceremonia.webp");
    const galleryDraft = { ...draft, gallery: [] };
    render(<GalleryStep draft={galleryDraft} update={update} move={vi.fn()} uploadAsset={uploadAsset} />);

    expect(screen.getByRole("button", { name: "Agregar foto" })).toBeTruthy();
    expect(screen.queryByPlaceholderText("Texto alternativo *")).toBeNull();
    expect(screen.queryByPlaceholderText("Descripción opcional")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();

    const file = new File(["image"], "ceremonia.webp", { type: "image/webp" });
    fireEvent.change(document.getElementById("gallery-add")!, { target: { files: [file] } });

    await waitFor(() => expect(uploadAsset).toHaveBeenCalledWith(file));
    expect(update).toHaveBeenCalledWith("gallery", [{ imageUrl: "/uploads/ceremonia.webp", altText: "ceremonia", caption: "" }]);
  });

  it("permite cambiar una imagen y conserva las acciones de orden y eliminación", async () => {
    const update = vi.fn();
    const move = vi.fn();
    const uploadAsset = vi.fn().mockResolvedValue("/uploads/nueva.jpg");
    const galleryDraft = { ...draft, gallery: [{ imageUrl: "/uploads/vieja.webp", altText: "vieja", caption: "" }] };
    render(<GalleryStep draft={galleryDraft} update={update} move={move} uploadAsset={uploadAsset} />);

    expect(screen.getByAltText("vieja")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cambiar imagen" })).toBeTruthy();
    const file = new File(["image"], "nueva.jpg", { type: "image/jpeg" });
    const changeInput = document.getElementById("gallery-change-0")!;
    fireEvent.change(changeInput, { target: { files: [file] } });

    await waitFor(() => expect(update).toHaveBeenCalledWith("gallery", [{ imageUrl: "/uploads/nueva.jpg", altText: "nueva", caption: "" }]));
    fireEvent.click(screen.getByRole("button", { name: "Mover arriba" }));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar foto" }));
    expect(move).toHaveBeenCalledWith("gallery", 0, -1);
    expect(update).toHaveBeenLastCalledWith("gallery", []);
  });
});
