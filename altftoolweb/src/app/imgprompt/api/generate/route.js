import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { generateWithProvider } from "../../lib/prompt-engine/provider";
import { DEFAULT_PARAMS } from "../../lib/prompt-engine/params";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const limited = enforceRateLimit(NextResponse, req, {
    limit: 20,
    scope: "imgprompt:generate",
    windowMs: 60000,
  });
  if (limited) return limited;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = {
    idea: (body.idea ?? "").toString().slice(0, 2000),
    modelId: body.modelId ?? "openart",
    categorySlug: body.categorySlug,
    toolSlug: body.toolSlug,
    controls: Array.isArray(body.controls) && body.controls.length ? body.controls : ["image"],
    params: { ...DEFAULT_PARAMS, ...(body.params ?? {}) },
    mode: body.mode ?? "generate",
  };

  // Simulate engine latency so the generating animation is visible.
  await new Promise((r) => setTimeout(r, 650));

  try {
    const result = await generateWithProvider(input);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/imgprompt/api/generate] error", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
