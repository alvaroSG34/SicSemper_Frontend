import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { extname, join } from "path";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP and GIF images are allowed." },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds 2 MB limit." }, { status: 400 });
  }

  const ext = extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const dir = join(process.cwd(), "public", "Images", "clubs");

  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), Buffer.from(bytes));

  return NextResponse.json({ url: `/Images/clubs/${filename}` });
}
