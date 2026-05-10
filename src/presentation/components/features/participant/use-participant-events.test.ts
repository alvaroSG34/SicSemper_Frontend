import { act, renderHook, waitFor } from "@testing-library/react";
import type { ParticipantEventDetail } from "@/domain/participant/participant.types";
import { useParticipantEvents } from "./use-participant-events";

const selectEvent = vi.fn<Promise<boolean>, [string]>();
const loadEventCategoriesForDetail = vi.fn<Promise<void>, [string]>();
const getMyRegisteredEventIds = vi.fn();
const getEventDetailForParticipant = vi.fn();

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

vi.mock("@/application/participant/participant.service", () => ({
  participantService: {
    getMyRegisteredEventIds: () => getMyRegisteredEventIds(),
    getEventDetailForParticipant: (eventId: string) => getEventDetailForParticipant(eventId),
  },
}));

describe("useParticipantEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyRegisteredEventIds.mockResolvedValue({ eventIds: ["event-1"] });
    getEventDetailForParticipant.mockResolvedValue(events[0]);
  });

  it("retorna estado base del explorer", async () => {
    const onStartUpload = vi.fn();
    const { result } = renderHook(() => useParticipantEvents({ onStartUpload }));

    expect(result.current.exploreEvents).toHaveLength(1);
    expect(result.current.selectedEvent?.id).toBe("event-1");
    expect(result.current.loading).toBe(false);
    expect(result.current.loadEventCategoriesForDetail).toBe(loadEventCategoriesForDetail);
    await waitFor(() => {
      expect(result.current.registeredEventIdSet.has("event-1")).toBe(true);
    });
    expect(result.current.pastEvents).toHaveLength(1);
    expect(result.current.pastEvents[0]?.id).toBe("event-1");
  });

  it("inicia flujo de subida cuando selecciona evento correctamente", async () => {
    const onStartUpload = vi.fn();
    selectEvent.mockResolvedValue(true);
    const { result } = renderHook(() => useParticipantEvents({ onStartUpload }));

    let wasSelected = false;
    await act(async () => {
      wasSelected = await result.current.handleStartUpload("event-1");
    });

    expect(selectEvent).toHaveBeenCalledWith("event-1");
    expect(onStartUpload).toHaveBeenCalledWith("event-1");
    expect(wasSelected).toBe(true);
  });

  it("no inicia flujo de subida si falla seleccion del evento", async () => {
    const onStartUpload = vi.fn();
    selectEvent.mockResolvedValue(false);
    const { result } = renderHook(() => useParticipantEvents({ onStartUpload }));

    await act(async () => {
      await result.current.handleStartUpload("event-1");
    });

    expect(onStartUpload).not.toHaveBeenCalled();
  });
});
