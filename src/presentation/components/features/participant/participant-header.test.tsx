import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ParticipantProfile } from "@/domain/participant/participant.types";
import { ParticipantHeader } from "./participant-header";

vi.mock("next/font/google", () => ({ Outfit: () => ({ className: "outfit" }) }));

vi.mock("@/presentation/components/layout", () => ({
  AccountMenu: () => <button type="button">Cuenta</button>,
}));

vi.mock("./participant-notifications-bell", () => ({
  ParticipantNotificationsBell: () => <button type="button">Notificaciones</button>,
}));

const profile: ParticipantProfile = {
  userId: "user-1",
  displayName: "María Pérez",
  subtitle: "Participante",
  initials: "MP",
  verified: true,
  photoUrl: undefined,
};

describe("ParticipantHeader", () => {
  it("oculta el saludo en mobile y lo conserva para desktop", () => {
    render(<ParticipantHeader profile={profile} />);

    const heading = screen.getByRole("heading", { name: "Hola, María Pérez" });
    expect(heading.className).toContain("hidden");
    expect(heading.className).toContain("md:block");
    expect(screen.getByRole("button", { name: "Notificaciones" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cambiar rol" })).toBeNull();
    expect(screen.getByRole("button", { name: "Cuenta" })).toBeTruthy();
  });
});
