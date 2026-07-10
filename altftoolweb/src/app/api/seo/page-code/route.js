// Public endpoint: returns the admin-authored PER-PAGE custom code (head /
// bodyStart / bodyEnd) AND the per-page JSON-LD structured data (schema) for a
// given path. Used by the client PerPageCode injector. Returns {} when the
// engine is off or nothing exists (inert).

import { NextResponse } from "next/server";
import { loadSeoConfig } from "@/platform/seo/seoConfigSource";
import { resolveInjectedCode, resolveExtendedMeta } from "@altftool/core/seo";

export async function GET(request) {
  const path = request.nextUrl.searchParams.get("path") || "/";
  try {
    const config = await loadSeoConfig();
    const { page } = resolveInjectedCode(config, path);
    // Per-page JSON-LD (admin- or AI-authored `schema`). Resolved here so the
    // structured data the SEO engine/AI produces actually reaches the page —
    // resolveExtendedMeta computed it but nothing was rendering it before.
    const { jsonLd } = resolveExtendedMeta(config, { path });
    return NextResponse.json(
      { ...(page || {}), jsonLd: Array.isArray(jsonLd) ? jsonLd : [] },
      {
        headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
      },
    );
  } catch {
    return NextResponse.json({});
  }
}
