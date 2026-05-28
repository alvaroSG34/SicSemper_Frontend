import { render, screen } from "@testing-library/react";
import type { SystemAlert } from "@/domain/admin/admin.types";
import { AdminBitacoraSection } from "./admin-bitacora-section";

const listBitacoraMock = vi.fn();
const getBitacoraItemMock = vi.fn();

vi.mock("@/application/admin/services/admin-bitacora.service", () => ({
  adminBitacoraService: {
    listBitacora: (...args: unknown[]) => listBitacoraMock(...args),
    getBitacoraItem: (...args: unknown[]) => getBitacoraItemMock(...args),
  },
}));

describe("AdminBitacoraSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listBitacoraMock.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: false,
    });
    getBitacoraItemMock.mockResolvedValue(null);
  });

  it("shows only operational alerts from the last 24 hours", async () => {
    const now = Date.now();
    const alerts: SystemAlert[] = [
      {
        id: "alert-recent",
        title: "Alerta reciente",
        detail: "Detalle reciente",
        severity: "ALTA",
        status: "ABIERTA",
        createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        lastTriggeredAt: new Date(now - 30 * 60 * 1000).toISOString(),
        occurrenceCount: 8,
      },
      {
        id: "alert-old",
        title: "Alerta antigua",
        detail: "Detalle antiguo",
        severity: "MEDIA",
        status: "RESUELTA",
        createdAt: new Date(now - 72 * 60 * 60 * 1000).toISOString(),
        lastTriggeredAt: new Date(now - 50 * 60 * 60 * 1000).toISOString(),
        occurrenceCount: 2,
      },
    ];

    render(
      <AdminBitacoraSection headingClassName="heading" alerts={alerts} />,
    );

    await screen.findByText("Alerta reciente");

    expect(screen.getByText("Alerta reciente")).toBeTruthy();
    expect(screen.queryByText("Alerta antigua")).toBeNull();
  });
});
