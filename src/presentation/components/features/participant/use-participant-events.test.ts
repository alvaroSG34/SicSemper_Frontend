import { act, renderHook } from "@testing-library/react";
import type { ParticipantEventDetail } from "@/domain/participant/participant.types";
import { useParticipantEvents } from "./use-participant-events";

const selectEvent = vi.fn<Promise<boolean>, [string]>();
const loadEventCategoriesForDetail = vi.fn<Promise<void>, [string]>();

const events: ParticipantEventDetail[] = [
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
];

vi.mock("@/presentation/stores/participant-events.slice", () => ({
  useParticipantEventsSlice: () => ({
    exploreEvents: events,
    selectedEvent: events[0],
    categoriesByEventId: {},
    categoriesLoadingByEventId: {},
    categoriesErrorByEventId: {},
    flowLoading: false,
    selectEvent,
    loadEventCategoriesForDetail,
  }),
}));

describe("useParticipantEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna estado base del explorer", () => {
    const goToResults = vi.fn();
    const { result } = renderHook(() => useParticipantEvents({ onGoToResults: goToResults }));

    expect(result.current.exploreEvents).toHaveLength(1);
    expect(result.current.selectedEvent?.id).toBe("event-1");
    expect(result.current.loading).toBe(false);
    expect(result.current.loadEventCategoriesForDetail).toBe(loadEventCategoriesForDetail);
  });

  it("navega a resultados cuando selecciona evento correctamente", async () => {
    const goToResults = vi.fn();
    selectEvent.mockResolvedValue(true);
    const { result } = renderHook(() => useParticipantEvents({ onGoToResults: goToResults }));

    let wasSelected = false;
    await act(async () => {
      wasSelected = await result.current.handleStartUpload("event-1");
    });

    expect(selectEvent).toHaveBeenCalledWith("event-1");
    expect(goToResults).toHaveBeenCalledTimes(1);
    expect(wasSelected).toBe(true);
  });

  it("no navega a resultados si falla seleccion del evento", async () => {
    const goToResults = vi.fn();
    selectEvent.mockResolvedValue(false);
    const { result } = renderHook(() => useParticipantEvents({ onGoToResults: goToResults }));

    await act(async () => {
      await result.current.handleStartUpload("event-1");
    });

    expect(goToResults).not.toHaveBeenCalled();
  });
});
