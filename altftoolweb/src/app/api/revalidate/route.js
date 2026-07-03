// altftoolweb/src/app/api/revalidate/route.js
//
// On-demand cache revalidation endpoint for the ALTF Engine. The admin app
// calls this after saving SEO config so changes propagate without a deploy.
// Secret-gated; never exposes details on failure.

import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { SEO_CONFIG_REVALIDATE_TAG, __resetSeoConfigCache } from "@/platform/seo/seoConfigSource";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const expected = process.env.ALTFT_REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret");

  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is fine */
  }

  const tag = typeof body?.tag === "string" && body.tag ? body.tag : SEO_CONFIG_REVALIDATE_TAG;

  try {
    revalidateTag(tag);
    // Clear the in-memory config snapshot so this instance serves fresh config
    // immediately (the fetch cache above is invalidated globally by the tag).
    if (tag === SEO_CONFIG_REVALIDATE_TAG) {
      try { __resetSeoConfigCache(); } catch { /* best effort */ }
    }
    // Revalidate specific page path(s) so SSG/ISR pages regenerate now.
    const paths = [];
    if (typeof body?.path === "string" && body.path.startsWith("/")) paths.push(body.path);
    if (Array.isArray(body?.paths)) {
      for (const p of body.paths) if (typeof p === "string" && p.startsWith("/")) paths.push(p);
    }
    for (const p of [...new Set(paths)]) revalidatePath(p);
    return NextResponse.json({ ok: true, revalidated: tag, paths: [...new Set(paths)] });
  } catch (error) {
    console.error("[api/revalidate]", error);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
