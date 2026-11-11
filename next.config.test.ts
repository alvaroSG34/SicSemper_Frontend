// @vitest-environment node
import { describe, expect, it } from "vitest";
import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server";
import nextConfig from "./next.config";

const publicPaths = [
  "/",
  "/club-modelismo-santa-cruz",
  "/eventos",
  "/eventos/6ac3a4da-6739-4918-8242-882f63ceeeb1",
  "/privacidad",
  "/terminos",
  "/sitemap.xml",
  "/robots.txt",
];

describe("public www redirects", () => {
  it.each([
    ["www.sicsempermodelismo.com.bo", "/club-modelismo-santa-cruz/"],
    ["www.sicsempermodelismo.com.bo", "/eventos/"],
    ["sicsempermodelismo.com.bo", "/club-modelismo-santa-cruz/"],
    ["sicsempermodelismo.com.bo", "/eventos/"],
  ])("keeps native slash normalization for %s%s without loops", async (host, path) => {
    let url = `https://${host}${path}?ref=club`;
    let redirects = 0;
    for (; redirects < 3; redirects++) {
      const response = await unstable_getResponseFromNextConfig({ url, nextConfig });
      const location = response.headers.get("location");
      if (!location) break;
      expect(response.status).toBe(308);
      url = new URL(location, url).href;
    }
    expect(redirects).toBeLessThanOrEqual(2);
    expect(url).toBe(`https://sicsempermodelismo.com.bo${path.slice(0, -1)}?ref=club`);
  });

  it.each(publicPaths)("permanently redirects %s and preserves its query", async (path) => {
    const response = await unstable_getResponseFromNextConfig({
      url: `https://www.sicsempermodelismo.com.bo${path}?utm_source=google&ref=club`,
      nextConfig,
    });
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      `https://sicsempermodelismo.com.bo${path}?utm_source=google&ref=club`,
    );
  });

  it.each([
    "sicsempermodelismo.com.bo",
    "localhost:3100",
    "wwwXsicsempermodelismoXcomXbo",
    "www.sicsempermodelismo.com.bo.example.org",
  ])("does not redirect requests to %s", async (host) => {
    const response = await unstable_getResponseFromNextConfig({
      url: `http://${host}/club-modelismo-santa-cruz`,
      nextConfig,
    });
    expect(response.headers.get("location")).toBeNull();
  });

  it.each([
    "/api/v1/auth/session",
    "/login",
    "/register",
    "/recuperar-contrasena",
    "/restablecer-contrasena",
    "/admin/inicio",
    "/participante/inicio",
    "/juez/inicio",
    "/_next/static/chunk.js",
    "/og-image.jpg",
  ])("does not redirect excluded route %s", async (path) => {
    const response = await unstable_getResponseFromNextConfig({
      url: `https://www.sicsempermodelismo.com.bo${path}`,
      nextConfig,
    });
    expect(response.headers.get("location")).toBeNull();
  });
});
