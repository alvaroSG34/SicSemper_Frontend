// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { proxyApiRequest } from "./proxy";

const fetchMock = vi.fn<typeof fetch>();

describe("same-origin API proxy", () => {
  beforeEach(() => {
    vi.stubEnv("API_URL", "https://backend.up.railway.app/api/v1");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it("delivers all login cookies on the frontend domain, preserving expiry and HttpOnly", async () => {
    const headers = new Headers({ "content-type": "application/json", "x-csrf-token": "csrf" });
    headers.append("set-cookie", "ss_access=access; Domain=backend.up.railway.app; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=900");
    headers.append("set-cookie", "ss_refresh=refresh; Domain=backend.up.railway.app; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800");
    headers.append("set-cookie", "ss_csrf=csrf; Domain=backend.up.railway.app; Path=/; Secure; SameSite=None");
    fetchMock.mockResolvedValue(new Response('{"user":{"id":"1"}}', { headers }));

    const response = await proxyApiRequest(new Request("https://frontend.app/api/v1/auth/login", {
      method: "POST",
      headers: { origin: "https://frontend.app", "content-type": "application/json" },
      body: '{"email":"user@example.com"}',
    }));

    expect(response.headers.getSetCookie()).toEqual([
      "ss_access=access; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900",
      "ss_refresh=refresh; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800",
      "ss_csrf=csrf; Path=/; Secure; SameSite=Lax",
    ]);
    expect(response.headers.get("x-csrf-token")).toBe("csrf");
    expect(await response.json()).toEqual({ user: { id: "1" } });
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://backend.up.railway.app/api/v1/auth/login");
  });

  it("forwards cookies and CSRF on refresh and preserves a backend 401", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "CSRF_TOKEN_INVALID" }, { status: 401 }));
    const response = await proxyApiRequest(new Request("https://frontend.app/api/v1/auth/refresh", {
      method: "POST",
      headers: { cookie: "ss_refresh=refresh; ss_csrf=csrf", "x-csrf-token": "csrf" },
    }));
    const headers = fetchMock.mock.calls[0][1]!.headers as Headers;
    expect(headers.get("cookie")).toBe("ss_refresh=refresh; ss_csrf=csrf");
    expect(headers.get("x-csrf-token")).toBe("csrf");
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: "CSRF_TOKEN_INVALID" });
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("rejects cross-origin mutations before contacting the backend", async () => {
    const response = await proxyApiRequest(new Request("https://frontend.app/api/v1/auth/login", {
      method: "POST", headers: { origin: "https://other.app" },
    }));
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("streams SSE immediately without waiting for the connection to close", async () => {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({ start(value) { controller = value; } });
    controller.enqueue(new TextEncoder().encode("event: sync\ndata: {}\n\n"));
    fetchMock.mockResolvedValue(new Response(stream, { headers: { "content-type": "text/event-stream" } }));
    const response = await proxyApiRequest(new Request("https://frontend.app/api/v1/sync/stream", {
      headers: { cookie: "ss_access=access" },
    }));
    const reader = response.body!.getReader();
    expect(new TextDecoder().decode((await reader.read()).value)).toContain("event: sync");
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect((fetchMock.mock.calls[0][1]!.headers as Headers).get("cookie")).toBe("ss_access=access");
    controller.close();
    await reader.cancel();
  });

  it("preserves multipart uploads and query parameters", async () => {
    fetchMock.mockResolvedValue(Response.json({ success: true }));
    const form = new FormData();
    form.set("file", new Blob(["image"], { type: "image/png" }), "model.png");
    await proxyApiRequest(new Request("https://frontend.app/api/v1/uploads?modelId=123", { method: "POST", body: form }));
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://backend.up.railway.app/api/v1/uploads?modelId=123");
    const forwardedForm = await new Response(init!.body, { headers: init!.headers }).formData();
    const file = forwardedForm.get("file") as File;
    expect(file.name).toBe("model.png");
    expect(await file.text()).toBe("image");
  });

  it("returns 502 when the backend cannot be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const response = await proxyApiRequest(new Request("https://frontend.app/api/v1/auth/session"));
    expect(response.status).toBe(502);
  });
});
