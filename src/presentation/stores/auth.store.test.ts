import type { User } from "@/domain/user/user.types";
import { useAuthStore } from "./auth.store";

const { authServiceMock, sessionRoleState } = vi.hoisted(() => ({
  authServiceMock: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    switchRole: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  sessionRoleState: {
    current: null as User["roles"][number] | null,
  },
}));

vi.mock("@/application/auth/auth.service", () => ({
  authService: authServiceMock,
  getCurrentSessionRole: () => sessionRoleState.current,
}));

const makeUser = (roles: User["roles"]): User => ({
  id: "user-1",
  name: "User",
  email: "user@test.dev",
  roles,
  verified: true,
});

describe("useAuthStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionRoleState.current = null;
    useAuthStore.setState({
      user: null,
      currentRole: null,
      initialized: false,
      initializing: false,
    });
  });

  it("stores the active role returned by the backend after login", async () => {
    sessionRoleState.current = "JUEZ";
    authServiceMock.login.mockResolvedValue(makeUser(["PARTICIPANTE", "JUEZ"]));

    await expect(useAuthStore.getState().login("judge@test.dev", "password123")).resolves.toBe(true);

    expect(useAuthStore.getState().currentRole).toBe("JUEZ");
    expect(useAuthStore.getState().user?.roles).toEqual(["PARTICIPANTE", "JUEZ"]);
  });

  it("updates only the active role when switching roles", async () => {
    useAuthStore.setState({
      user: makeUser(["PARTICIPANTE", "JUEZ"]),
      currentRole: "PARTICIPANTE",
      initialized: true,
      initializing: false,
    });
    authServiceMock.switchRole.mockResolvedValue("JUEZ");

    await useAuthStore.getState().switchRole("JUEZ");

    expect(authServiceMock.switchRole).toHaveBeenCalledWith("JUEZ");
    expect(useAuthStore.getState().currentRole).toBe("JUEZ");
    expect(useAuthStore.getState().user?.roles).toEqual(["PARTICIPANTE", "JUEZ"]);
  });

  it("clears local state on logout even after an active session", async () => {
    useAuthStore.setState({
      user: makeUser(["ADMIN"]),
      currentRole: "ADMIN",
      initialized: true,
      initializing: false,
    });
    authServiceMock.logout.mockResolvedValue(undefined);

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().currentRole).toBeNull();
    expect(useAuthStore.getState().initialized).toBe(true);
  });
});
