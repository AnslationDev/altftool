import { NextResponse } from "next/server.js";

export const runtime = "nodejs";

const ALLOWED_IMAGE_HOSTS = new Set(["images.unsplash.com"]);
const ALLOWED_CONTENT_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

function parseAllowedImageUrl(value) {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !ALLOWED_IMAGE_HOSTS.has(url.hostname.toLowerCase())
    ) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function safeFilename(value) {
  const cleaned = String(value || "altpinterest-pin.jpg")
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 120);
  return cleaned || "altpinterest-pin.jpg";
}

async function readLimitedBody(response) {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES) {
    throw new Error("image-too-large");
  }

  if (!response.body) return new Uint8Array();

  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE_BYTES) {
        await reader.cancel("image-too-large");
        throw new Error("image-too-large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = parseAllowedImageUrl(searchParams.get("url"));

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Only approved HTTPS image sources can be downloaded." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif",
        "User-Agent": "AltFTool-Image-Downloader/1.0",
      },
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "The approved image source could not be reached." },
        { status: 502 },
      );
    }

    const contentType = response.headers.get("content-type")?.split(";", 1)[0]?.toLowerCase();
    if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "The source did not return a supported image." },
        { status: 415 },
      );
    }

    const body = await readLimitedBody(response);
    if (!body.byteLength) {
      return NextResponse.json({ error: "The source returned an empty image." }, { status: 502 });
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Content-Disposition": `attachment; filename="${safeFilename(searchParams.get("filename"))}"`,
        "Content-Length": String(body.byteLength),
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "image-too-large";
    return NextResponse.json(
      { error: tooLarge ? "The image exceeds the 12 MB download limit." : "Image download failed." },
      { status: tooLarge ? 413 : 502 },
    );
  }
}
