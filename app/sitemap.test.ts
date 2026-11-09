import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "./sitemap";

afterEach(() => vi.unstubAllGlobals());

describe("public sitemap", () => {
  it("discovers published events from the API, includes the club and omits account pages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            { id: "event-1", updatedAt: "2026-11-09T00:00:00Z" },
            { id: "event-2", updatedAt: "invalid" },
          ]),
        ),
      ),
    );
    const entries = await sitemap();
    expect(entries.map((entry) => entry.url)).toEqual([
      "https://sicsempermodelismo.com.bo/",
      "https://sicsempermodelismo.com.bo/club-modelismo-santa-cruz",
      "https://sicsempermodelismo.com.bo/eventos",
      "https://sicsempermodelismo.com.bo/eventos/event-1",
      "https://sicsempermodelismo.com.bo/eventos/event-2",
      "https://sicsempermodelismo.com.bo/privacidad",
      "https://sicsempermodelismo.com.bo/terminos",
    ]);
    expect(entries[3].lastModified).toEqual(new Date("2026-11-09T00:00:00Z"));
    expect(entries[4]).not.toHaveProperty("lastModified");
  });

  it("fails rather than publishing a partial sitemap during an API outage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(sitemap()).rejects.toThrow();
  });
});
