import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { User } from "@/domain/user/user.types";
import { useAuthStore } from "@/presentation/stores";
import { DashboardRoleSwitch } from "./dashboard-role-switch";

const { push } = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

const makeUser = (roles: User["roles"]): User => ({
  id: "user-1",
  name: "User",
  email: "user@test.dev",
  roles,
  verified: true,
});

describe("DashboardRoleSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      currentRole: null,
      initialized: true,
      initializing: false,
      switchRole: vi.fn(async (role) => {
        useAuthStore.setState({ currentRole: role });
      }),
    });
  });

  it("switches a multi-role user and routes to the selected dashboard", async () => {
    useAuthStore.setState({
      user: makeUser(["PARTICIPANTE", "JUEZ"]),
      currentRole: "PARTICIPANTE",
    });

    render(<DashboardRoleSwitch />);

    fireEvent.change(screen.getByLabelText("Cambiar rol de dashboard"), {
      target: { value: "JUEZ" },
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/juez/inicio");
    });
    expect(useAuthStore.getState().currentRole).toBe("JUEZ");
  });

  it("does not offer invalid role switches for superadmin sessions", () => {
    useAuthStore.setState({
      user: makeUser(["SUPERADMIN", "ADMIN"]),
      currentRole: "SUPERADMIN",
    });

    const { container } = render(<DashboardRoleSwitch />);

    expect(container.firstChild).toBeNull();
  });
});
