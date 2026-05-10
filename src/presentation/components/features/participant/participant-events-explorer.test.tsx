import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ParticipantEventsExplorer } from "./participant-events-explorer";
import type { ParticipantEventDetail } from "@/domain/participant/participant.types";

vi.mock("next/font/google", () => ({
  Outfit: () => ({ className: "font-outfit" }),
}));

const events: ParticipantEventDetail[] = [
  {
    id: "event-1",
    name: "Expo Modelismo",
    imageUrl: null,
    status: "ACTIVO",
    place: "La Paz",
    startDate: "2026-06-01T16:40:00.000Z",
    endDate: "2026-06-02T17:47:00.000Z",
    description: "Descripcion del evento",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    organizerClub: { id: "club-1", name: "IPMS" },
  },
  {
    id: "event-2",
    name: "Copa Sur",
    imageUrl: null,
    status: "PAUSADO",
    place: "Cochabamba",
    startDate: "2026-07-01T16:40:00.000Z",
    endDate: "2026-07-02T17:47:00.000Z",
    description: "Descripcion del evento 2",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    organizerClub: { id: "club-2", name: "Club Sur" },
  },
];

describe("ParticipantEventsExplorer", () => {
  it("renders compact cards with status badges and actions", () => {
    render(
      <ParticipantEventsExplorer
        events={events}
        selectedEventId={null}
        categoriesByEventId={{}}
        categoriesLoadingByEventId={{}}
        categoriesErrorByEventId={{}}
        registeredEventIdSet={new Set(["event-1", "event-2"])}
        registeredEventIdsLoading={false}
        onLoadEventCategories={vi.fn().mockResolvedValue(undefined)}
        onStartUpload={vi.fn().mockResolvedValue(true)}
        onGoToMyModelsByEvent={vi.fn()}
        onOpenParticipantsByEvent={vi.fn()}
      />,
    );

    expect(screen.getByText("Eventos proximos")).toBeTruthy();
    expect(screen.getByText("Disponibles")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("ACTIVO")).toBeTruthy();
    expect(screen.getByText("PAUSADO")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Subir maqueta" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Ver maquetas" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Ver participantes" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Mas detalles" })).toHaveLength(2);
  });

  it("triggers callbacks for upload, models and participants", async () => {
    const onStartUpload = vi.fn().mockResolvedValue(true);
    const onGoToMyModelsByEvent = vi.fn();
    const onOpenParticipantsByEvent = vi.fn();

    render(
      <ParticipantEventsExplorer
        events={[events[0]]}
        selectedEventId={null}
        categoriesByEventId={{}}
        categoriesLoadingByEventId={{}}
        categoriesErrorByEventId={{}}
        registeredEventIdSet={new Set(["event-1"])}
        registeredEventIdsLoading={false}
        onLoadEventCategories={vi.fn().mockResolvedValue(undefined)}
        onStartUpload={onStartUpload}
        onGoToMyModelsByEvent={onGoToMyModelsByEvent}
        onOpenParticipantsByEvent={onOpenParticipantsByEvent}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Subir maqueta" }));
    await waitFor(() => expect(onStartUpload).toHaveBeenCalledWith("event-1"));

    fireEvent.click(screen.getByRole("button", { name: "Ver maquetas" }));
    expect(onGoToMyModelsByEvent).toHaveBeenCalledWith("event-1");

    fireEvent.click(screen.getByRole("button", { name: "Ver participantes" }));
    expect(onOpenParticipantsByEvent).toHaveBeenCalledWith("event-1");
  });

  it("renders improved empty state", () => {
    render(
      <ParticipantEventsExplorer
        events={[]}
        selectedEventId={null}
        categoriesByEventId={{}}
        categoriesLoadingByEventId={{}}
        categoriesErrorByEventId={{}}
        registeredEventIdSet={new Set()}
        registeredEventIdsLoading={false}
        onLoadEventCategories={vi.fn().mockResolvedValue(undefined)}
        onStartUpload={vi.fn().mockResolvedValue(true)}
        onGoToMyModelsByEvent={vi.fn()}
        onOpenParticipantsByEvent={vi.fn()}
      />,
    );

    expect(
      screen.getByText("No hay eventos proximos por ahora. Vuelve mas tarde para descubrir nuevas competencias."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Refrescar" })).toBeTruthy();
  });

  it("allows switching to past events filter and keeps participants action", () => {
    const onOpenParticipantsByEvent = vi.fn();
    const pastEvent: ParticipantEventDetail = {
      id: "event-past-1",
      name: "Copa Historica",
      imageUrl: null,
      status: "ACTIVO",
      place: "Santa Cruz",
      startDate: "2025-01-01T16:40:00.000Z",
      endDate: "2025-01-02T17:47:00.000Z",
      description: "Evento ya finalizado",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
      organizerClub: { id: "club-3", name: "Club Historico" },
    };

    render(
      <ParticipantEventsExplorer
        events={[events[0]]}
        pastEvents={[pastEvent]}
        selectedEventId={null}
        categoriesByEventId={{}}
        categoriesLoadingByEventId={{}}
        categoriesErrorByEventId={{}}
        registeredEventIdSet={new Set(["event-1", "event-past-1"])}
        registeredEventIdsLoading={false}
        onLoadEventCategories={vi.fn().mockResolvedValue(undefined)}
        onStartUpload={vi.fn().mockResolvedValue(true)}
        onGoToMyModelsByEvent={vi.fn()}
        onOpenParticipantsByEvent={onOpenParticipantsByEvent}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pasados" }));
    expect(screen.getByText("Eventos pasados")).toBeTruthy();
    expect(screen.getByText("Copa Historica")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Ver participantes" }));
    expect(onOpenParticipantsByEvent).toHaveBeenCalledWith("event-past-1");
  });

  it("blocks upload button in past events", () => {
    const onStartUpload = vi.fn().mockResolvedValue(true);
    const pastEvent: ParticipantEventDetail = {
      id: "event-past-2",
      name: "Retro Cup",
      imageUrl: null,
      status: "ACTIVO",
      place: "Sucre",
      startDate: "2024-01-01T10:00:00.000Z",
      endDate: "2024-01-02T10:00:00.000Z",
      description: "Evento cerrado",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      organizerClub: { id: "club-9", name: "Club Retro" },
    };

    render(
      <ParticipantEventsExplorer
        events={[]}
        pastEvents={[pastEvent]}
        selectedEventId={null}
        categoriesByEventId={{}}
        categoriesLoadingByEventId={{}}
        categoriesErrorByEventId={{}}
        registeredEventIdSet={new Set(["event-past-2"])}
        registeredEventIdsLoading={false}
        onLoadEventCategories={vi.fn().mockResolvedValue(undefined)}
        onStartUpload={onStartUpload}
        onGoToMyModelsByEvent={vi.fn()}
        onOpenParticipantsByEvent={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pasados" }));
    const uploadButton = screen.getByRole("button", { name: "Evento finalizado" }) as HTMLButtonElement;
    expect(uploadButton.disabled).toBe(true);

    fireEvent.click(uploadButton);
    expect(onStartUpload).not.toHaveBeenCalled();
  });

  it("opens detail modal with keyboard Enter", async () => {
    render(
      <ParticipantEventsExplorer
        events={[events[0]]}
        selectedEventId={null}
        categoriesByEventId={{}}
        categoriesLoadingByEventId={{}}
        categoriesErrorByEventId={{}}
        registeredEventIdSet={new Set(["event-1"])}
        registeredEventIdsLoading={false}
        onLoadEventCategories={vi.fn().mockResolvedValue(undefined)}
        onStartUpload={vi.fn().mockResolvedValue(true)}
        onGoToMyModelsByEvent={vi.fn()}
        onOpenParticipantsByEvent={vi.fn()}
      />,
    );

    const card = screen.getByRole("button", { name: "Ver detalles del evento Expo Modelismo" });
    fireEvent.keyDown(card, { key: "Enter" });

    expect(await screen.findByText("Detalle del evento")).toBeTruthy();
  });
});
