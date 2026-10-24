import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
  canEdit: false,
  editingDeadline: null,
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

const scoredModel: ParticipantModel = {
  ...baseModel,
  id: "model-scored",
  nombreModelo: "Scored Aircraft",
  status: "CALIFICADA",
  files: [],
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
    expect(screen.getByText("Tus maquetas")).toBeTruthy();
    expect(screen.queryByText("Orden: Mas recientes")).toBeNull();
  });

  it("shows the count of scored models instead of total files", () => {
    render(<ParticipantMyModels models={[baseModel, scoredModel, { ...scoredModel, id: "model-scored-2" }]} />);

    expect(screen.getByText("Maquetas calificadas")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.queryByText("Archivos")).toBeNull();
  });

  it("keeps the scored-model count independent from filters and shows file details per model", () => {
    render(<ParticipantMyModels models={[baseModel, scoredModel]} />);

    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre, codigo, marca o evento"), {
      target: { value: "Scored Aircraft" },
    });
    const scoredSummary = screen.getByText("Maquetas calificadas").closest("div");
    expect(scoredSummary).toBeTruthy();
    expect(within(scoredSummary!).getByText("1")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "Ver detalle de la maqueta" })[0]);
    expect(screen.getAllByText("Imagenes y PDF").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Archivos:/).length).toBeGreaterThan(0);
  });

  it("shows zero when no model is scored", () => {
    render(<ParticipantMyModels models={[baseModel, secondModel]} />);

    expect(screen.getByText("Maquetas calificadas")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
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

  it("shows the edit action only for a model the backend marks editable", () => {
    const { rerender } = render(<ParticipantMyModels models={[baseModel]} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Ver detalle de la maqueta" })[0]);
    expect(screen.queryAllByRole("button", { name: "Editar maqueta" })).toHaveLength(0);

    rerender(
      <ParticipantMyModels
        models={[{ ...baseModel, canEdit: true, editingDeadline: "2026-05-02T15:31:00.000Z" }]}
      />,
    );

    expect(screen.getAllByRole("button", { name: "Editar maqueta" })).toHaveLength(2);
  });

  it("allows deleting only a model the backend marks editable", async () => {
    const onDeleteModel = vi.fn().mockResolvedValue(undefined);
    render(
      <ParticipantMyModels
        models={[{ ...baseModel, canEdit: true, editingDeadline: "2026-05-02T15:31:00.000Z" }]}
        onDeleteModel={onDeleteModel}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Ver detalle de la maqueta" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar maqueta" })[0]);

    const dialog = screen.getByRole("dialog", { name: "¿Eliminar maqueta?" });
    expect(dialog).toBeTruthy();
    expect(screen.getAllByText(baseModel.nombreModelo).length).toBeGreaterThan(0);
    expect(onDeleteModel).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar maqueta" }));

    await waitFor(() => expect(onDeleteModel).toHaveBeenCalledWith(baseModel.id));
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
