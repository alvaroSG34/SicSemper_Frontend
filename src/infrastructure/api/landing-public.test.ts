import { afterEach, describe, expect, it, vi } from "vitest";
import { loadPublicEvent, loadPublicEvents } from "./landing-public";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("public event loading", () => {
  it("uses the public endpoint and encodes event identifiers", async () => {
    vi.stubEnv("API_URL", "https://backend.test/api/v1");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "a/b" })));
    vi.stubGlobal("fetch", fetchMock);
    await expect(loadPublicEvent("a/b")).resolves.toEqual({ id: "a/b" });
    expect(fetchMock).toHaveBeenCalledWith("https://backend.test/api/v1/landing/events/a%2Fb", {
      next: { revalidate: 60 },
    });
  });

  it("distinguishes missing events from backend failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    await expect(loadPublicEvent("missing")).resolves.toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(loadPublicEvent("existing")).rejects.toThrow();
    await expect(loadPublicEvents()).rejects.toThrow();
  });
});
