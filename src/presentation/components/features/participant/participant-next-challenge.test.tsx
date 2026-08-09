import { render, screen } from "@testing-library/react";
import type { ParticipantNextChallenge } from "@/domain/participant/participant.types";
import { ParticipantNextChallenge as ParticipantNextChallengeCard } from "./participant-next-challenge";

vi.mock("next/font/google", () => ({
  Outfit: () => ({ className: "font-outfit" }),
}));

const baseChallenge: ParticipantNextChallenge = {
  eventId: "event-1",
  eyebrow: "PROXIMO RETO",
  title: "Desafio Abierto",
  categoryLine: "Categoria principal",
  organizer: "Organiza: SICSEMPER",
  startDate: null,
  countdown: {
    days: "00",
    hours: "00",
    minutes: "00",
  },
  imageAlt: "challenge",
};

describe("ParticipantNextChallenge", () => {
  it("shows organizer when there is active event", () => {
    render(<ParticipantNextChallengeCard challenge={baseChallenge} />);

    expect(screen.getByText("Organiza: SICSEMPER")).toBeTruthy();
  });

  it("hides organizer in empty state without eventId", () => {
    render(
      <ParticipantNextChallengeCard
        challenge={{
          ...baseChallenge,
          eventId: null,
          eyebrow: "SIN EVENTOS ACTIVOS",
          title: "Todavia no hay desafios abiertos",
        }}
      />,
    );

    expect(screen.queryByText("Organiza: SICSEMPER")).toBeNull();
    expect(screen.getByText("Todavia no hay desafios abiertos")).toBeTruthy();
  });
});
