import { NextResponse } from "next/server";
import { getToolBySlug } from "../../_lib/manifest";
import { runTransform, getServerSample, getServerOptions } from "../../_lib/registry";

// Node runtime: server-engine converters use Node-only libraries.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TRANSFORM_INPUT_CHARS = 200_000;

/**
 * GET /transform/api/[slug] — metadata for the shell (sample + option schema).
 */
export async function GET(_request, { params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    return NextResponse.json({ ok: false, error: "Unknown converter." }, { status: 404 });
  }
  const [sample, options] = await Promise.all([getServerSample(slug), getServerOptions(slug)]);
  return NextResponse.json({ ok: true, slug, engine: tool.engine, sample, options });
}

/**
 * POST /transform/api/[slug] — run the converter. Body: { input, options }.
 * Always returns a TransformResult ({ ok, output|error }).
 */
export async function POST(request, { params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    return NextResponse.json({ ok: false, error: "Unknown converter." }, { status: 404 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const input = typeof body?.input === "string" ? body.input : "";
  const options = body && typeof body.options === "object" && body.options ? body.options : {};

  if (input.length > MAX_TRANSFORM_INPUT_CHARS) {
    return NextResponse.json(
      {
        ok: false,
        error: `Input is too large. Please keep converter input under ${MAX_TRANSFORM_INPUT_CHARS.toLocaleString()} characters.`,
      },
      { status: 413 },
    );
  }

  const result = await runTransform(slug, input, options);
  return NextResponse.json(result);
}
