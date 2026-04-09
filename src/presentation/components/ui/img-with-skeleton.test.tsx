import { fireEvent, render, screen } from "@testing-library/react";
import { ImgWithSkeleton } from "./img-with-skeleton";

describe("ImgWithSkeleton", () => {
  it("shows skeleton while loading and removes it when image loads", () => {
    render(
      <ImgWithSkeleton
        src="https://example.com/image.jpg"
        alt="Preview"
        loading="lazy"
        className="h-20 w-20 object-cover"
      />,
    );

    const image = screen.getByAltText("Preview");

    expect(image.getAttribute("loading")).toBe("lazy");
    expect(image.getAttribute("data-image-status")).toBe("loading");
    expect(image.className).toContain("ui-skeleton");
    expect(image.className).toContain("object-cover");

    fireEvent.load(image);

    expect(image.getAttribute("data-image-status")).toBe("loaded");
    expect(image.className).toContain("opacity-100");
    expect(image.className).not.toContain("ui-skeleton");
  });

  it("removes skeleton on error and forwards callbacks", () => {
    const onError = vi.fn();
    const onLoad = vi.fn();

    render(
      <ImgWithSkeleton
        src="https://example.com/missing.jpg"
        alt="Broken preview"
        onError={onError}
        onLoad={onLoad}
      />,
    );

    const image = screen.getByAltText("Broken preview");

    fireEvent.error(image);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onLoad).not.toHaveBeenCalled();
    expect(image.getAttribute("data-image-status")).toBe("error");
    expect(image.className).not.toContain("ui-skeleton");
  });
});
