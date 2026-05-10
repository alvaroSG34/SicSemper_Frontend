import { render, screen } from "@testing-library/react";
import { ParticipantHomeSection } from "./participant-home-section";

const useParticipantHomeMock = vi.fn();

vi.mock("next/font/google", () => ({
  Outfit: () => ({ className: "font-outfit" }),
}));

vi.mock("./use-participant-home", () => ({
  useParticipantHome: (params: { onStartUpload: (eventId: string) => void }) =>
    useParticipantHomeMock(params),
}));

describe("ParticipantHomeSection", () => {
  beforeEach(() => {
    useParticipantHomeMock.mockReset();
  });

  it("renders ranking card when hook has ranking data", () => {
    useParticipantHomeMock.mockReturnValue({
      challenge: {
        eventId: "event-1",
        eyebrow: "Reto",
        title: "Evento",
        categoryLine: "Categoria",
        organizer: "Club",
        startDate: null,
        countdown: { days: "00", hours: "00", minutes: "00" },
        imageAlt: "x",
      },
      kpis: [],
      clubRanking: {
        enabled: true,
        clubName: "Club Uno",
        message: null,
        position: 1,
        totalParticipants: 10,
        averageScore: 9.11,
        scoredModels: 5,
      },
      isStartingUploadFromNextChallenge: false,
      handleStartUploadFromNextChallenge: vi.fn(),
    });

    render(<ParticipantHomeSection onStartUpload={vi.fn()} />);

    expect(screen.getByText("Tu posicion en el club")).toBeTruthy();
    expect(screen.getByText("Club Uno")).toBeTruthy();
  });
});
