import { renderHook } from "@testing-library/react";
import type { ParticipantModel } from "@/domain/participant/participant.types";
import { useParticipantModels } from "./use-participant-models";

const loadMyModels = vi.fn<Promise<void>, [string]>();

const baseModels: ParticipantModel[] = [];
let currentModels: ParticipantModel[] = baseModels;
let currentLoading = false;

vi.mock("@/presentation/stores/participant-models.slice", () => ({
  useParticipantModelsSlice: () => ({
    myModels: currentModels,
    myModelsLoading: currentLoading,
    loadMyModels,
  }),
}));

describe("useParticipantModels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentModels = [];
    currentLoading = false;
  });

  it("carga modelos cuando hay usuario y no hay datos", () => {
    renderHook(() => useParticipantModels({ effectiveUserId: "user-1" }));

    expect(loadMyModels).toHaveBeenCalledWith("user-1");
  });

  it("no carga modelos cuando no hay usuario", () => {
    renderHook(() => useParticipantModels({ effectiveUserId: "" }));

    expect(loadMyModels).not.toHaveBeenCalled();
  });

  it("expone loading solo cuando esta cargando y lista vacia", () => {
    currentLoading = true;
    currentModels = [];
    const { result, rerender } = renderHook(() => useParticipantModels({ effectiveUserId: "user-1" }));

    expect(result.current.loading).toBe(true);

    currentModels = [
      {
        id: "model-1",
        userId: "user-1",
        eventId: "event-1",
        categoryId: "cat-1",
        subcategoryId: "sub-1",
        escalaId: "scale-1",
        usuarioEventoCategoriaId: "uec-1",
        nombreModelo: "Modelo",
        marca: "Marca",
        descripcion: "",
        codigo: "MOD-001",
        status: "ENVIADA",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        eventName: "Evento",
        categoryName: "Categoria",
        subcategoryName: "Subcategoria",
        escalaValue: "1/35",
        files: [],
      },
    ];
    rerender();

    expect(result.current.loading).toBe(false);
  });
});
