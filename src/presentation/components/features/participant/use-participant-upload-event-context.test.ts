import { act, renderHook } from "@testing-library/react";
import { useParticipantUploadEventContext } from "./use-participant-upload-event-context";

const selectEvent = vi.fn<Promise<boolean>, [string, "default" | "upload" | undefined]>();
const loadExploreEvents = vi.fn<Promise<void>, [{ force?: boolean }?]>();
const ensureSubcategoryBranches = vi.fn<Promise<void>, [unknown]>();

const mockStoreState = {
  selectedEvent: null as { id: string; name: string } | null,
  selectedEventSubcategoryPurpose: "default" as "default" | "upload",
  eventCategories: [],
  subcategoriesByCategory: {},
  showcaseTreeByEventId: {},
  showcaseTreeLoadingByEventId: {},
  showcaseTreeErrorByEventId: {},
  subcategoryBranchLoadingByContext: {},
  subcategoryBranchErrorByContext: {},
  exploreEvents: [],
  flowError: null as string | null,
  selectEvent,
  ensureSubcategoryBranches,
  loadExploreEvents,
};

vi.mock("@/presentation/stores", () => ({
  useParticipantStore: (selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
}));

vi.mock("@/application/participant/participant.service", () => ({
  participantService: {
    getScalesForEventCategory: vi.fn(),
  },
}));

describe("useParticipantUploadEventContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.selectedEvent = null;
    mockStoreState.selectedEventSubcategoryPurpose = "default";
    mockStoreState.eventCategories = [];
    mockStoreState.subcategoriesByCategory = {};
    mockStoreState.showcaseTreeByEventId = {};
    mockStoreState.showcaseTreeLoadingByEventId = {};
    mockStoreState.showcaseTreeErrorByEventId = {};
    mockStoreState.subcategoryBranchLoadingByContext = {};
    mockStoreState.subcategoryBranchErrorByContext = {};
    mockStoreState.exploreEvents = [];
    mockStoreState.flowError = null;
    loadExploreEvents.mockResolvedValue(undefined);
    selectEvent.mockResolvedValue(true);
    ensureSubcategoryBranches.mockResolvedValue(undefined);
  });

  it("does not stay loading forever with invalid eventId", () => {
    const { result } = renderHook(() => useParticipantUploadEventContext("   "));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("No se pudo identificar el evento seleccionado.");
  });

  it("retries event context selection on demand", async () => {
    const { result } = renderHook(() => useParticipantUploadEventContext("event-1"));

    await act(async () => {
      result.current.retryEventContext();
    });

    expect(loadExploreEvents).toHaveBeenCalledWith({ force: true });
    expect(selectEvent).toHaveBeenLastCalledWith("event-1", "default");
  });
});
