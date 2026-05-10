import { render, screen } from "@testing-library/react";
import { ParticipantClubRankingCard } from "./participant-club-ranking-card";

vi.mock("next/font/google", () => ({
  Outfit: () => ({ className: "font-outfit" }),
}));

describe("ParticipantClubRankingCard", () => {
  it("renders ranking metrics when enabled", () => {
    render(
      <ParticipantClubRankingCard
        ranking={{
          enabled: true,
          clubName: "Club Uno",
          message: null,
          position: 3,
          totalParticipants: 12,
          averageScore: 8.456,
          scoredModels: 7,
        }}
      />,
    );

    expect(screen.getByText("Tu posicion en el club")).toBeTruthy();
    expect(screen.getByText("Club Uno")).toBeTruthy();
    expect(screen.getByText("#3")).toBeTruthy();
    expect(screen.getByText("de 12")).toBeTruthy();
    expect(screen.getByText("8.46")).toBeTruthy();
    expect(screen.getByText("7")).toBeTruthy();
  });

  it("renders informational message when disabled", () => {
    render(
      <ParticipantClubRankingCard
        ranking={{
          enabled: false,
          clubName: "Sin club",
          message: "Sin club asignado",
          position: null,
          totalParticipants: 0,
          averageScore: null,
          scoredModels: 0,
        }}
      />,
    );

    expect(screen.getByText("Sin club asignado")).toBeTruthy();
  });
});
