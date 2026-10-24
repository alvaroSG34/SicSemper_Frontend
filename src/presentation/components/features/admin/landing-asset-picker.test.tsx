import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LandingAssetPicker } from "./landing-asset-picker";

describe("LandingAssetPicker", () => {
  it("hides the library selector when direct upload is required", () => {
    render(
      <LandingAssetPicker
        value=""
        assets={[{ id: "asset-1", url: "https://cdn.test/image.webp", storageKey: "image.webp", mimetype: "image/webp", sizeBytes: 10, originalFilename: "image.webp", createdAt: "", createdBy: null }]}
        label="Portada"
        onChange={vi.fn()}
        onUpload={vi.fn().mockResolvedValue("https://cdn.test/uploaded.webp")}
        showLibrary={false}
        help="Imagen que representará el evento."
      />,
    );

    expect(screen.getByText("Subir imagen")).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByRole("button", { name: "Mostrar ayuda" })).toBeTruthy();
    expect(screen.getByRole("tooltip").textContent).toContain("Imagen que representará el evento.");
  });

  it("uploads a dropped image through the clickable dropzone", async () => {
    const onUpload = vi.fn().mockResolvedValue("https://cdn.test/uploaded.webp");
    render(
      <LandingAssetPicker
        value=""
        assets={[]}
        label="Portada"
        onChange={vi.fn()}
        onUpload={onUpload}
        showLibrary={false}
        dropzone
      />,
    );

    const file = new File(["image"], "cover.webp", { type: "image/webp" });
    const dropzone = screen.getByText("Arrastra una imagen aquí").closest("label");
    fireEvent.drop(dropzone!, { dataTransfer: { files: [file] } });

    await waitFor(() => expect(onUpload).toHaveBeenCalledWith(file));
    expect(screen.getByText("o haz clic para seleccionar una foto")).toBeTruthy();
  });
});
