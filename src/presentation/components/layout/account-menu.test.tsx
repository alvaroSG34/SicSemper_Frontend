import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { User } from "@/domain/user/user.types";
import { useAuthStore } from "@/presentation/stores";
import { AccountMenu } from "./account-menu";

const { push } = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const makeUser = (roles: User["roles"]): User => ({
  id: "user-1",
  name: "User",
  email: "user@test.dev",
  roles,
  verified: true,
});

describe("AccountMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      currentRole: null,
      logout: vi.fn().mockResolvedValue(undefined),
      switchRole: vi.fn().mockResolvedValue(undefined),
      initialized: true,
      initializing: false,
    });
  });

  it.each([
    ["participante", "/participante/perfil"],
    ["juez", "/juez/perfil"],
  ])("navigates a %s user to their profile", (_, profileHref) => {
    render(<AccountMenu initials="US" profileHref={profileHref} />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu de cuenta" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Mi perfil" }));

    expect(push).toHaveBeenCalledWith(profileHref);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("shows only logout for an administrator", () => {
    render(<AccountMenu initials="AD" />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu de cuenta" }));

    expect(screen.queryByRole("menuitem", { name: "Mi perfil" })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Cerrar sesion" })).toBeTruthy();
  });

  it("closes on outside click and Escape", () => {
    render(<AccountMenu initials="US" profileHref="/participante/perfil" />);
    const trigger = screen.getByRole("button", { name: "Abrir menu de cuenta" });

    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu")).toBeNull();

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("prevents duplicate logout requests and redirects after completion", async () => {
    let resolveLogout: (() => void) | undefined;
    const logout = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLogout = resolve;
        }),
    );
    useAuthStore.setState({ logout });
    render(<AccountMenu initials="AD" />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu de cuenta" }));
    const logoutAction = screen.getByRole("menuitem", { name: "Cerrar sesion" });
    fireEvent.click(logoutAction);
    fireEvent.click(logoutAction);

    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("menuitem", { name: "Cerrando sesion..." })).toHaveProperty("disabled", true);

    resolveLogout?.();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"));
  });

  it("switches a participant to the judge dashboard from the account menu", async () => {
    const switchRole = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({
      user: makeUser(["PARTICIPANTE", "JUEZ"]),
      currentRole: "PARTICIPANTE",
      switchRole,
    });
    render(<AccountMenu initials="US" profileHref="/participante/perfil" />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu de cuenta" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Cambiar a Juez" }));

    await waitFor(() => expect(switchRole).toHaveBeenCalledWith("JUEZ"));
    expect(push).toHaveBeenCalledWith("/juez/inicio");
  });

  it("prevents duplicate role switches while the request is pending", async () => {
    let resolveSwitch: (() => void) | undefined;
    const switchRole = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSwitch = resolve;
        }),
    );
    useAuthStore.setState({
      user: makeUser(["PARTICIPANTE", "JUEZ"]),
      currentRole: "JUEZ",
      switchRole,
    });
    render(<AccountMenu initials="US" profileHref="/juez/perfil" />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu de cuenta" }));
    const changeRoleAction = screen.getByRole("menuitem", { name: "Cambiar a Participante" });
    fireEvent.click(changeRoleAction);
    fireEvent.click(changeRoleAction);

    expect(switchRole).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("menuitem", { name: "Cambiando rol..." })).toHaveProperty("disabled", true);

    resolveSwitch?.();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/participante/inicio"));
  });
});
