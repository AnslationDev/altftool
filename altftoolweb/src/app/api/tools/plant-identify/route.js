import { NextResponse } from "next/server";
import { getServerEnv } from "@altftool/core/env";
import {
  enforceRateLimit,
  fetchJson,
  jsonResponse,
} from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_BASE64_LENGTH = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 8;
const DETAILS = [
  "common_names",
  "url",
  "description",
  "taxonomy",
  "rank",
  "gbif_id",
  "inaturalist_id",
  "image",
  "synonyms",
  "edible_parts",
  "watering",
  "propagation_methods",
].join(",");

function providerAvailable() {
  return Boolean(getServerEnv(SERVER_ENV.plantId));
}

function unavailableResponse() {
  return NextResponse.json(
    {
      available: false,
      code: "provider_unavailable",
      error: "Plant identification is temporarily unavailable.",
    },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function GET() {
  return jsonResponse(
    NextResponse,
    { available: providerAvailable() },
    { cache: { sMaxage: 300, staleWhileRevalidate: 900 } },
  );
}

export async function POST(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 5,
    scope: "tools:plant-identify",
    windowMs: 60_000,
  });
  if (limited) return limited;

  const apiKey = getServerEnv(SERVER_ENV.plantId);
  if (!apiKey) return unavailableResponse();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 },
    );
  }

  const image = typeof body?.image === "string" ? body.image.trim() : "";
  if (
    !image ||
    image.length > MAX_BASE64_LENGTH ||
    !/^[a-z0-9+/]+={0,2}$/i.test(image)
  ) {
    return NextResponse.json(
      { error: "Upload a valid image smaller than 4 MB." },
      { status: 400 },
    );
  }

  const upstream = new URL("https://api.plant.id/v3/identification");
  upstream.searchParams.set("details", DETAILS);

  try {
    const result = await fetchJson(upstream, {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: [image],
        similar_images: true,
      }),
      timeoutMs: 30_000,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            result.status === 429
              ? "The plant service is busy. Please try again shortly."
              : "The plant could not be identified right now.",
        },
        {
          status: result.status === 429 ? 429 : 502,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return NextResponse.json(result.data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "The plant service did not respond. Please try again." },
      {
        status: 504,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
