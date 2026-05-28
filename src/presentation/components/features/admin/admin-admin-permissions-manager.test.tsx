import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { AdminPermissionEntry } from "@/domain/admin/admin.types";
import type { User } from "@/domain/user/user.types";
import { AdminAdminPermissionsManager } from "./admin-admin-permissions-manager";

const loadAdminPermissionsMock = vi.fn();
const toggleAdminPermissionMock = vi.fn();
const clearErrorMock = vi.fn();
let accessControlState: {
  adminPermissionsMap: Record<string, AdminPermissionEntry[]>;
  adminPermissionsLoading: Record<string, boolean>;
  adminPermissionsError: Record<string, string | null>;
  loadAdminPermissions: typeof loadAdminPermissionsMock;
  toggleAdminPermission: typeof toggleAdminPermissionMock;
};

vi.mock("@/presentation/stores/admin-access-control.slice", () => ({
  useAdminAccessControlSlice: () => accessControlState,
}));

vi.mock("@/presentation/stores/admin.store", () => ({
  useAdminStore: (selector: (state: { clearError: () => void }) => unknown) =>
    selector({
      clearError: clearErrorMock,
    }),
}));

const users: User[] = [
  {
    id: "admin-1",
    name: "Admin Uno",
    email: "admin1@test.dev",
    roles: ["ADMIN"],
    verified: true,
  },
  {
    id: "super-1",
    name: "Super",
    email: "super@test.dev",
    roles: ["SUPERADMIN"],
    verified: true,
  },
];

const createEntry = (
  code: string,
  granted = false,
  description = "Descripcion",
): AdminPermissionEntry => ({
  code,
  name: code,
  description,
  granted,
  grantedByRole: granted,
  grantedDirectly: false,
  grantedAt: null,
  grantedBy: null,
});

const renderManager = (entries: AdminPermissionEntry[]) => {
  accessControlState = {
    adminPermissionsMap: { "admin-1": entries },
    adminPermissionsLoading: {},
    adminPermissionsError: {},
    loadAdminPermissions: loadAdminPermissionsMock,
    toggleAdminPermission: toggleAdminPermissionMock,
  };

  return render(
    <AdminAdminPermissionsManager
      headingClassName="heading"
      users={users}
      selectedAdminId="admin-1"
      onSelectAdmin={vi.fn()}
      onBackToAdmins={vi.fn()}
      loading={false}
      canManageAdminPermissions
    />,
  );
};

describe("AdminAdminPermissionsManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessControlState = {
      adminPermissionsMap: { "admin-1": [] },
      adminPermissionsLoading: {},
      adminPermissionsError: {},
      loadAdminPermissions: loadAdminPermissionsMock,
      toggleAdminPermission: toggleAdminPermissionMock,
    };
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("renders CRUD modules including AdminPermissions and special permissions section", () => {
    renderManager([
      createEntry("ADMIN_USERS_CREATE"),
      createEntry("ADMIN_USERS_READ"),
      createEntry("ADMIN_USERS_UPDATE"),
      createEntry("ADMIN_USERS_DELETE"),
      createEntry("ADMIN_ADMIN_PERMISSIONS_CREATE"),
      createEntry("ADMIN_ADMIN_PERMISSIONS_READ"),
      createEntry("ADMIN_ADMIN_PERMISSIONS_UPDATE"),
      createEntry("ADMIN_ADMIN_PERMISSIONS_DELETE"),
      createEntry("ADMIN_DASHBOARD_READ", true),
      createEntry("ADMIN_JUDGE_REVIEWS_REOPEN"),
      createEntry("JUDGE_MODELS_READ"),
      createEntry("PARTICIPANT_MODELS_READ"),
      createEntry("AUTH_LOGIN"),
    ]);

    expect(screen.getByRole("button", { name: /AdminPermissions/i })).toBeTruthy();
    expect(screen.getByText("Permisos especiales (no CRUD)")).toBeTruthy();
    expect(screen.getByText(/Admin \(2\)/)).toBeTruthy();
    expect(screen.getByText(/Judge \(1\)/)).toBeTruthy();
    expect(screen.getByText(/Participant \(1\)/)).toBeTruthy();
    expect(screen.getByText(/Auth \(1\)/)).toBeTruthy();
  });

  it("asks confirmation when disabling critical read permission", () => {
    renderManager([createEntry("ADMIN_DASHBOARD_READ", true)]);

    const permissionCard = screen.getByText("ADMIN_DASHBOARD_READ").closest("article");
    expect(permissionCard).toBeTruthy();
    const toggleButton = within(permissionCard as HTMLElement).getByRole("button", {
      name: /Activado/i,
    });
    vi.spyOn(window, "confirm").mockReturnValue(false);

    fireEvent.click(toggleButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(toggleAdminPermissionMock).not.toHaveBeenCalled();
  });

  it("bulk deactivation affects only granted CRUD permissions in active module", async () => {
    renderManager([
      createEntry("ADMIN_USERS_CREATE", false),
      createEntry("ADMIN_USERS_READ", true),
      createEntry("ADMIN_USERS_UPDATE", true),
      createEntry("ADMIN_USERS_DELETE", false),
      createEntry("ADMIN_DASHBOARD_READ", true),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Desactivar todo CRUD" }));

    await waitFor(() =>
      expect(toggleAdminPermissionMock).toHaveBeenCalledWith("admin-1", "ADMIN_USERS_READ", true),
    );
    await waitFor(() =>
      expect(toggleAdminPermissionMock).toHaveBeenCalledWith("admin-1", "ADMIN_USERS_UPDATE", true),
    );
    expect(toggleAdminPermissionMock).not.toHaveBeenCalledWith(
      "admin-1",
      "ADMIN_DASHBOARD_READ",
      true,
    );
  });
});
