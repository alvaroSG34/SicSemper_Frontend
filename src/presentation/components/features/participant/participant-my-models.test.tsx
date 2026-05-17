import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ParticipantModel } from "@/domain/participant/participant.types";
import { ParticipantMyModels } from "./participant-my-models";

vi.mock("next/font/google", () => ({
  Outfit: () => ({ className: "font-outfit" }),
}));

const baseModel: ParticipantModel = {
  id: "model-1",
  userId: "user-1",
  eventId: "event-1",
  categoryId: "category-1",
  subcategoryId: "subcategory-1",
  escalaId: "scale-1",
  usuarioEventoCategoriaId: "uec-1",
  nombreModelo: "Aircraft 97",
  marca: "Bebe",
  descripcion: "Descripcion de prueba",
  codigo: "MQ-63B-B4D89K-THIS-IS-A-LONG-CODE",
  status: "ENVIADA",
  createdAt: "2026-05-01T15:31:00.000Z",
  updatedAt: "2026-05-01T15:31:00.000Z",
  eventName: "Maquetrix",
  categoryName: "Figuras",
  subcategoryName: "Historicas",
  escalaValue: "1:100",
  files: [
    {
      id: "file-1",
      modelId: "model-1",
      publicUrl: "https://example.com/img-1.png",
      order: 1,
      fileName: "IA.png",
      mimeType: "image/png",
      sizeBytes: 27361,
      createdAt: "2026-05-01T15:31:00.000Z",
      updatedAt: "2026-05-01T15:31:00.000Z",
    },
  ],
};

const secondModel: ParticipantModel = {
  ...baseModel,
  id: "model-2",
  nombreModelo: "Tank 2",
  codigo: "TK-002",
  eventName: "Expo Norte",
  eventId: "event-2",
};

describe("ParticipantMyModels", () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders mobile cards and keeps desktop table wrapper", () => {
    const { container } = render(<ParticipantMyModels models={[baseModel, secondModel]} />);

    expect(container.querySelector(".lg\\:hidden")).toBeTruthy();
    expect(container.querySelector(".hidden.lg\\:block")).toBeTruthy();
    expect(screen.getAllByText("Aircraft 97").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tank 2").length).toBeGreaterThan(0);
  });

  it("expands and collapses model detail by model id", () => {
    render(<ParticipantMyModels models={[baseModel]} />);

    const toggleButtons = screen.getAllByRole("button", { name: "Ver detalle de la maqueta" });
    fireEvent.click(toggleButtons[0]);

    expect(screen.getAllByText("Imagenes y PDF").length).toBeGreaterThan(0);

    const hideButtons = screen.getAllByRole("button", { name: "Ocultar detalle de la maqueta" });
    fireEvent.click(hideButtons[0]);

    expect(screen.queryByText("Imagenes y PDF")).toBeNull();
  });

  it("copies long model code from expanded detail", async () => {
    render(<ParticipantMyModels models={[baseModel]} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Ver detalle de la maqueta" })[0]);

    const copyButton = screen.getAllByRole("button", {
      name: `Copiar codigo ${baseModel.codigo}`,
    })[0];
    fireEvent.click(copyButton);

    await waitFor(() =>
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(baseModel.codigo),
    );
    expect(screen.getAllByText(baseModel.codigo).length).toBeGreaterThan(0);
  });

  it("keeps filters working with the same dataset", () => {
    render(<ParticipantMyModels models={[baseModel, secondModel]} />);

    const searchInput = screen.getByPlaceholderText("Buscar por nombre, codigo, marca o evento");
    fireEvent.change(searchInput, { target: { value: "Tank 2" } });

    expect(screen.getAllByText("Tank 2").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Aircraft 97")).toHaveLength(0);
  });
});
