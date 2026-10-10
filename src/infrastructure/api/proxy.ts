import { getApiBaseUrl } from "@/core/api-base-url";

const REQUEST_HEADERS = ["accept", "content-type", "cookie", "authorization", "x-csrf-token", "origin"];
const RESPONSE_HEADERS = ["content-type", "content-disposition", "x-csrf-token", "x-accel-buffering"];

export async function proxyApiRequest(request: Request): Promise<Response> {
  const incomingUrl = new URL(request.url);
  const isMutation = request.method !== "GET" && request.method !== "HEAD";
  // Railway/Cloudflare can expose an internal host in request.url while the
  // browser uses the public custom domain. Do not compare those values here.

  const baseUrl = new URL(getApiBaseUrl());
  const targetUrl = new URL(`${baseUrl.href.replace(/\/+$/, "")}${incomingUrl.pathname.slice("/api/v1".length)}${incomingUrl.search}`);
  if (targetUrl.origin !== baseUrl.origin || !targetUrl.pathname.startsWith(`${baseUrl.pathname.replace(/\/+$/, "")}/`)) {
    return Response.json({ message: "PATH_INVALID" }, { status: 400 });
  }

  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    cache: "no-store",
    redirect: "manual",
    signal: request.signal,
  };
  if (isMutation && request.body) {
    init.body = request.body;
    init.duplex = "half";
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, init);
  } catch {
    return Response.json({ message: "BACKEND_UNAVAILABLE" }, { status: 502 });
  }

  const responseHeaders = new Headers({ "cache-control": "no-store, no-transform" });
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  for (const cookie of upstream.headers.getSetCookie()) {
    // The backend domain is not the browser-facing domain. Keep HttpOnly,
    // Secure and expiry, and make the cookies first-party on this origin.
    responseHeaders.append("set-cookie", cookie
      .replace(/;\s*Domain=[^;]*/gi, "")
      .replace(/;\s*SameSite=[^;]*/gi, "; SameSite=Lax"));
  }

  // Pass the stream through without buffering (SSE and file responses).
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}
