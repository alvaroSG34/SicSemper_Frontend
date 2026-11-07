import { apiRequestBlob } from "@/infrastructure/api/http-client";
import { adminEventControlService } from "./admin-event-control.service";

vi.mock("@/infrastructure/api/http-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/infrastructure/api/http-client")>()),
  apiRequest: vi.fn(),
  apiRequestBlob: vi.fn(),
}));

describe("participants export request", () => {
  beforeEach(() => vi.clearAllMocks());

  it("omits optional columns by default", async () => {
    const response = { blob: new Blob(["xlsx"]), headers: new Headers() };
    vi.mocked(apiRequestBlob).mockResolvedValue(response);
    expect(await adminEventControlService.exportEventControlParticipants("event-1")).toBe(response);
    expect(apiRequestBlob).toHaveBeenCalledWith(
      "/admin/events/event-1/control/participants/export.xlsx",
    );
  });

  it("sends selected columns as a comma-separated query parameter", async () => {
    vi.mocked(apiRequestBlob).mockResolvedValue({ blob: new Blob(), headers: new Headers() });
    await adminEventControlService.exportEventControlParticipants("event-1", ["club", "scale"]);
    const path = vi.mocked(apiRequestBlob).mock.calls[0][0];
    expect(new URL(path, "https://example.test").searchParams.get("extraColumns")).toBe(
      "club,scale",
    );
  });

  it("propagates download errors", async () => {
    vi.mocked(apiRequestBlob).mockRejectedValue(new Error("No se pudo descargar"));
    await expect(
      adminEventControlService.exportEventControlParticipants("event-1"),
    ).rejects.toThrow("No se pudo descargar");
  });
});
