import { render, screen } from "@testing-library/react";
import { ParticipantShowcaseModelsSection } from "./participant-showcase-models-section";

import type { ParticipantShowcaseModelItem } from "@/domain/participant/participant.types";

const showcaseHookState = vi.hoisted(() => ({
  items: [
    {
      id: "model-1",
      nombreModelo: "Modelo propio",
      codigo: "M-001",
      participantUserId: "user-1",
      participantName: "David",
      status: "ENVIADA",
      finalScore: null,
      previewImageUrl: null,
      scoreRankGlobal: null,
      createdAt: "2026-05-01T00:00:00.000Z",
    },
    {
      id: "model-2",
      nombreModelo: "Modelo de otro",
      codigo: "M-002",
      participantUserId: "user-2",
      participantName: "Ana",
      status: "ENVIADA",
      finalScore: null,
      previewImageUrl: null,
      scoreRankGlobal: null,
      createdAt: "2026-05-02T00:00:00.000Z",
    },
  ] as ParticipantShowcaseModelItem[],
}));

vi.mock("./use-participant-showcase-models", () => ({
  useParticipantShowcaseModels: () => ({
    searchInput: "",
    setSearchInput: vi.fn(),
    sort: "DATE_DESC",
    setSort: vi.fn(),
    items: showcaseHookState.items,
    page: 1,
    total: showcaseHookState.items.length,
    totalPages: 1,
    manualTieBreakApplied: false,
    manualTieBreakLabel: null,
    loadingInitial: false,
    loadingMore: false,
    error: null,
    loadMore: vi.fn(),
  }),
}));

vi.mock("@/presentation/stores/auth.store", () => ({
  useAuthStore: (selector: (state: { user: { id: string } | null }) => unknown) =>
    selector({
      user: { id: "user-1" },
    }),
}));

describe("ParticipantShowcaseModelsSection", () => {
  const baseProps = {
    eventId: "event-1",
    level1Id: "lvl-1",
    finalCategoryId: "cat-final",
    scaleId: "scale-1",
    level1Name: "Aviones",
    level2Name: null,
    level2Id: null,
    finalCategoryName: "Biplano",
    scaleLabel: "1:32",
    segmentType: "scale" as const,
  };

  beforeEach(() => {
    showcaseHookState.items = [
      {
        id: "model-1",
        nombreModelo: "Modelo propio",
        codigo: "M-001",
        participantUserId: "user-1",
        participantName: "David",
        status: "ENVIADA",
        finalScore: null,
        previewImageUrl: null,
        scoreRankGlobal: null,
        createdAt: "2026-05-01T00:00:00.000Z",
      },
      {
        id: "model-2",
        nombreModelo: "Modelo de otro",
        codigo: "M-002",
        participantUserId: "user-2",
        participantName: "Ana",
        status: "ENVIADA",
        finalScore: null,
        previewImageUrl: null,
        scoreRankGlobal: null,
        createdAt: "2026-05-02T00:00:00.000Z",
      },
    ];
  });

  it("renders badge for own model", () => {
    render(<ParticipantShowcaseModelsSection {...baseProps} />);

    const badges = screen.getAllByText("Tu maqueta");
    expect(badges).toHaveLength(1);
  });

  it("shows shared medal for tied first place", () => {
    showcaseHookState.items = [
      {
        id: "model-1",
        nombreModelo: "Modelo A",
        codigo: "A-001",
        participantUserId: "user-1",
        participantName: "David",
        status: "CALIFICADA",
        finalScore: 95,
        previewImageUrl: null,
        scoreRankGlobal: 1,
        createdAt: "2026-05-01T00:00:00.000Z",
      },
      {
        id: "model-2",
        nombreModelo: "Modelo B",
        codigo: "B-001",
        participantUserId: "user-2",
        participantName: "Ana",
        status: "CALIFICADA",
        finalScore: 95,
        previewImageUrl: null,
        scoreRankGlobal: 1,
        createdAt: "2026-05-02T00:00:00.000Z",
      },
      {
        id: "model-3",
        nombreModelo: "Modelo C",
        codigo: "C-001",
        participantUserId: "user-3",
        participantName: "Luis",
        status: "CALIFICADA",
        finalScore: 90,
        previewImageUrl: null,
        scoreRankGlobal: 4,
        createdAt: "2026-05-03T00:00:00.000Z",
      },
    ];

    render(<ParticipantShowcaseModelsSection {...baseProps} />);

    expect(screen.getAllByLabelText("1er lugar")).toHaveLength(2);
    expect(screen.getAllByText("#1")).toHaveLength(2);
    expect(screen.queryByLabelText("3er lugar")).toBeNull();
  });
});
