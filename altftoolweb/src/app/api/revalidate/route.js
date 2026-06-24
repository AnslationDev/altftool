// altftoolweb/src/app/api/revalidate/route.js
//
// On-demand cache revalidation endpoint for the ALTF Engine. The admin app
// calls this after saving SEO config so changes propagate without a deploy.
// Secret-gated; never exposes details on failure.

import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { SEO_CONFIG_REVALIDATE_TAG } from "@/platform/seo/seoConfigSource";

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
    if (typeof body?.path === "string" && body.path.startsWith("/")) {
      revalidatePath(body.path);
    }
    return NextResponse.json({ ok: true, revalidated: tag });
  } catch (error) {
    console.error("[api/revalidate]", error);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
