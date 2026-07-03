// Public endpoint: returns the admin-authored PER-PAGE custom code (head /
// bodyStart / bodyEnd) for a given path. Used by the client PerPageCode
// injector. Returns {} when the engine is off or no code exists (inert).

import { NextResponse } from "next/server";
import { loadSeoConfig } from "@/platform/seo/seoConfigSource";
import { resolveInjectedCode } from "@altftool/core/seo";

export async function GET(request) {
  const path = request.nextUrl.searchParams.get("path") || "/";
  try {
    const config = await loadSeoConfig();
    const { page } = resolveInjectedCode(config, path);
    return NextResponse.json(page || {}, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({});
  }
}
