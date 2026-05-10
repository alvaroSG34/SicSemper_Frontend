import { render, waitFor } from "@testing-library/react";
import type { User } from "@/domain/user/user.types";
import { useAuthStore } from "@/presentation/stores";
import { DashboardRoleGuard } from "./dashboard-role-guard";

const { replace } = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
  }),
}));

const makeUser = (roles: User["roles"]): User => ({
  id: "user-1",
  name: "User",
  email: "user@test.dev",
  roles,
  verified: true,
});

describe("DashboardRoleGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      currentRole: null,
      initialized: true,
      initializing: false,
    });
  });

  it("redirects unauthenticated users to login", async () => {
    render(
      <DashboardRoleGuard allowedRoles={["ADMIN"]}>
        <div>Admin content</div>
      </DashboardRoleGuard>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/login");
    });
  });

  it("redirects authenticated users away from dashboards for a different active role", async () => {
    useAuthStore.setState({
      user: makeUser(["PARTICIPANTE", "JUEZ"]),
      currentRole: "PARTICIPANTE",
    });

    render(
      <DashboardRoleGuard allowedRoles={["JUEZ"]}>
        <div>Judge content</div>
      </DashboardRoleGuard>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/participante/inicio");
    });
  });
});
