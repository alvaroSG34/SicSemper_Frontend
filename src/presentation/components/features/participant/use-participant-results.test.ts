import { act, renderHook, waitFor } from "@testing-library/react";
import type { ParticipantEventDetail } from "@/domain/participant/participant.types";
import { useParticipantResults } from "./use-participant-results";

const selectEvent = vi.fn<Promise<boolean>, [string]>();
const loadEventCategoriesForDetail = vi.fn<Promise<void>, [string]>();
const submitModel = vi.fn();

const baseEvents: ParticipantEventDetail[] = [
  {
    id: "event-1",
    name: "Evento Uno",
    imageUrl: null,
    status: "ACTIVO",
    place: "Cochabamba",
    startDate: "2026-03-10T00:00:00.000Z",
    endDate: "2026-03-12T00:00:00.000Z",
    description: "Descripcion",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    organizerClub: {
      id: "club-1",
      name: "Club Uno",
    },
  },
  {
    id: "event-2",
    name: "Evento Dos",
    imageUrl: null,
    status: "ACTIVO",
    place: "La Paz",
    startDate: "2026-03-20T00:00:00.000Z",
    endDate: "2026-03-22T00:00:00.000Z",
    description: "Descripcion",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    organizerClub: {
      id: "club-2",
      name: "Club Dos",
    },
  },
];

let selectedEvent: ParticipantEventDetail | null = null;

vi.mock("@/presentation/stores/participant-results.slice", () => ({
  useParticipantResultsSlice: () => ({
    exploreEvents: baseEvents,
    selectedEvent,
    eventCategories: [],
    subcategoriesByCategory: {},
    categoriesByEventId: {},
    categoriesLoadingByEventId: {},
    categoriesErrorByEventId: {},
    scales: [],
    flowLoading: false,
    flowError: null,
    flowSuccessMessage: null,
    selectEvent,
    loadEventCategoriesForDetail,
    submitModel,
  }),
}));

describe("useParticipantResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectedEvent = null;
    selectEvent.mockResolvedValue(true);
    loadEventCategoriesForDetail.mockResolvedValue(undefined);
  });

  it("auto-selecciona el primer evento cuando no hay seleccionado", async () => {
    renderHook(() => useParticipantResults());

    await waitFor(() => {
      expect(selectEvent).toHaveBeenCalledWith("event-1");
    });
  });

  it("cierra el modal y selecciona el evento manualmente", () => {
    const { result } = renderHook(() => useParticipantResults());

    act(() => {
      result.current.setIsSelectedEventModalOpen(true);
    });
    expect(result.current.isSelectedEventModalOpen).toBe(true);

    act(() => {
      result.current.handleSelectEvent("event-2");
    });

    expect(selectEvent).toHaveBeenCalledWith("event-2");
    expect(result.current.isSelectedEventModalOpen).toBe(false);
  });
});
