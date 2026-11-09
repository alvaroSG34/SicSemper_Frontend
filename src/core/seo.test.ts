import { describe, expect, it } from "vitest";
import { publicPageMetadata, serializeJsonLd } from "./seo";

describe("page SEO", () => {
  it("gives each event its own canonical and social preview", () => {
    const metadata = publicPageMetadata({
      title: "Concurso Carlos Castrillo | SICSEMPER",
      description: "Concurso de modelismo en Santa Cruz",
      path: "/eventos/event-1",
      image: "/Images/Evento.webp",
    });
    expect(metadata.alternates?.canonical).toBe(
      "https://sicsempermodelismo.com.bo/eventos/event-1",
    );
    expect(metadata.openGraph).toMatchObject({
      url: "https://sicsempermodelismo.com.bo/eventos/event-1",
      title: metadata.title,
      description: metadata.description,
      images: [{ url: "https://sicsempermodelismo.com.bo/Images/Evento.webp" }],
    });
  });

  it("prevents editorial text from closing the JSON-LD script", () => {
    const input = { name: "</script><script>alert(1)</script>" };
    const serialized = serializeJsonLd(input);
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(input);
  });
});
