import { act, renderHook } from "@testing-library/react";
import { useParticipantProfile } from "./use-participant-profile";

const loadDashboard = vi.fn<Promise<void>, [string | undefined]>();
const useAuthStoreMock = vi.fn();

vi.mock("@/presentation/stores", () => ({
  useAuthStore: (selector: (state: { user: { id: string } | null }) => unknown) =>
    selector(useAuthStoreMock()),
}));

vi.mock("@/presentation/stores/participant-profile.slice", () => ({
  useParticipantProfileSlice: () => ({
    loadDashboard,
  }),
}));

describe("useParticipantProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStoreMock.mockReturnValue({
      user: {
        id: "user-1",
      },
    });
  });

  it("recarga dashboard con user id cuando se actualiza perfil", () => {
    const { result } = renderHook(() => useParticipantProfile());

    act(() => {
      result.current.handleProfileUpdated();
    });

    expect(loadDashboard).toHaveBeenCalledWith("user-1");
  });

  it("recarga dashboard sin user id cuando no hay usuario", () => {
    useAuthStoreMock.mockReturnValue({
      user: null,
    });
    const { result } = renderHook(() => useParticipantProfile());

    act(() => {
      result.current.handleProfileUpdated();
    });

    expect(loadDashboard).toHaveBeenCalledWith(undefined);
  });
});
