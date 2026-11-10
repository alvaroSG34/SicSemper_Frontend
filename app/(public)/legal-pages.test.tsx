import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import PrivacyPage, { metadata as privacyMetadata } from "./privacidad/page";
import TermsPage, { metadata as termsMetadata } from "./terminos/page";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/presentation/components/layout", () => ({
  AutoPublicHeader: () => <div data-testid="auto-public-header" />,
}));

const pages = [
  {
    name: "privacy",
    page: PrivacyPage,
    title: "Política de privacidad",
    otherTitle: "Términos y condiciones",
    otherPath: "/terminos",
    path: "/privacidad",
    metadata: privacyMetadata,
  },
  {
    name: "terms",
    page: TermsPage,
    title: "Términos y condiciones",
    otherTitle: "Política de privacidad",
    otherPath: "/privacidad",
    path: "/terminos",
    metadata: termsMetadata,
  },
];

beforeEach(() => {
  vi.stubEnv("API_URL", "https://backend.test/api/v1");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          contactEmail: "privacidad@example.com",
        }),
      ),
    ),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe.each(pages)("$name page", ({ page, title, otherTitle, otherPath, path, metadata }) => {
  it("renders the document structure, fixed revision date and reciprocal links", async () => {
    render(await page());
    expect(screen.getByRole("heading", { name: title, level: 1 })).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(6);
    expect(screen.getByText("10 de noviembre de 2026").getAttribute("datetime")).toBe("2026-11-10");
    expect(screen.getByRole("link", { name: otherTitle }).getAttribute("href")).toBe(otherPath);
    expect(screen.getByRole("link", { name: "Volver al inicio" }).getAttribute("href")).toBe("/");
    expect(metadata.title).toBe(`${title} | SICSEMPER`);
    expect(metadata.alternates?.canonical).toBe(`https://sicsempermodelismo.com.bo${path}`);
    expect(screen.getByText(/autorización por separado/i)).toBeTruthy();
  });

  it("uses the published contact endpoint and the existing 60-second revalidation", async () => {
    render(await page());
    expect(fetch).toHaveBeenCalledWith("https://backend.test/api/v1/landing/content", {
      next: { revalidate: 60 },
    });
    expect(screen.getByRole("link", { name: "privacidad@example.com" }).getAttribute("href")).toBe(
      "mailto:privacidad@example.com",
    );
  });

  it.each(["http", "network"])(
    "keeps the document and default email available after an %s failure",
    async (failure) => {
      vi.stubGlobal(
        "fetch",
        failure === "http"
          ? vi.fn().mockResolvedValue(new Response(null, { status: 503 }))
          : vi.fn().mockRejectedValue(new Error("Network unavailable")),
      );
      render(await page());
      expect(screen.getByRole("heading", { name: title, level: 1 })).toBeTruthy();
      expect(
        screen.getByRole("link", { name: "contacto@SICSEMPERbolivia.org" }).getAttribute("href"),
      ).toBe("mailto:contacto@SICSEMPERbolivia.org");
    },
  );
});
