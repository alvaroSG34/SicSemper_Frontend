import { render, screen } from "@testing-library/react";
import { ParticipantEventPodiumPage } from "./participant-event-podium-page";

vi.mock("./participant-dashboard-shell", () => ({
  ParticipantDashboardShell: ({
    activeSection,
    children,
  }: {
    activeSection: string;
    children: (ctx: {
      effectiveUserId: string;
      clearFlowState: () => void;
      handleSelectSection: () => void;
    }) => React.ReactNode;
  }) => (
    <div data-testid="mock-dashboard-shell" data-active-section={activeSection}>
      {children({
        effectiveUserId: "user-1",
        clearFlowState: vi.fn(),
        handleSelectSection: vi.fn(),
      })}
    </div>
  ),
}));

vi.mock("./participant-event-podium-section", () => ({
  ParticipantEventPodiumSection: ({ eventId }: { eventId: string }) => (
    <div data-testid="mock-podium-section">Podio de {eventId}</div>
  ),
}));

describe("ParticipantEventPodiumPage", () => {
  it("renderiza dentro de ParticipantDashboardShell con activeSection='eventos'", () => {
    render(<ParticipantEventPodiumPage eventId="event-123" />);

    const shell = screen.getByTestId("mock-dashboard-shell");
    expect(shell).toBeTruthy();
    expect(shell.getAttribute("data-active-section")).toBe("eventos");
    expect(screen.getByText("Podio de event-123")).toBeTruthy();
  });
});

