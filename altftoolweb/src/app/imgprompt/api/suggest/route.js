import { NextResponse } from "next/server";
import { suggestIdea } from "../../lib/prompt-engine/suggest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const categorySlug = (body.categorySlug ?? "").toString().slice(0, 80);
  const toolSlug = (body.toolSlug ?? "").toString().slice(0, 80);
  if (!categorySlug && !toolSlug) {
    return NextResponse.json({ error: "categorySlug or toolSlug is required" }, { status: 400 });
  }

  try {
    const idea = await suggestIdea({ categorySlug, toolSlug });
    return NextResponse.json({ idea });
  } catch (err) {
    console.error("[/imgprompt/api/suggest] error", err);
    return NextResponse.json({ error: "Suggestion failed" }, { status: 500 });
  }
}
