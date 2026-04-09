import { fireEvent, render, screen } from "@testing-library/react";
import { ImageWithSkeleton } from "./image-with-skeleton";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, ...props }: Record<string, unknown>) => <img {...props} alt={typeof alt === "string" ? alt : ""} />,
}));

describe("ImageWithSkeleton", () => {
  it("shows skeleton while loading and removes it when image loads", () => {
    render(
      <ImageWithSkeleton
        src="https://example.com/image.jpg"
        alt="Imagen de prueba"
        width={240}
        height={160}
        className="object-cover rounded-lg"
      />,
    );

    const image = screen.getByAltText("Imagen de prueba");

    expect(image.getAttribute("data-image-status")).toBe("loading");
    expect(image.className).toContain("ui-skeleton");
    expect(image.className).toContain("object-cover");

    fireEvent.load(image);

    expect(image.getAttribute("data-image-status")).toBe("loaded");
    expect(image.className).toContain("opacity-100");
    expect(image.className).not.toContain("ui-skeleton");
  });

  it("removes skeleton on error and keeps callback passthrough", () => {
    const onError = vi.fn();
    const onLoad = vi.fn();

    render(
      <ImageWithSkeleton
        src="https://example.com/missing.jpg"
        alt="Imagen fallida"
        width={120}
        height={120}
        onError={onError}
        onLoad={onLoad}
      />,
    );

    const image = screen.getByAltText("Imagen fallida");

    fireEvent.error(image);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onLoad).not.toHaveBeenCalled();
    expect(image.getAttribute("data-image-status")).toBe("error");
    expect(image.className).not.toContain("ui-skeleton");
  });
});
