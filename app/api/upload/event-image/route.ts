import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { extname, join } from "path";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No se envio ninguna imagen." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Solo se permiten imagenes JPG, PNG o WEBP." },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "La imagen supera el limite de 2 MB." }, { status: 400 });
  }

  const ext = extname(file.name) || ".jpg";
  const fileName = `${randomUUID()}${ext}`;
  const dir = join(process.cwd(), "public", "Images", "events");

  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, fileName), Buffer.from(bytes));

  return NextResponse.json({ url: `/Images/events/${fileName}` });
}
