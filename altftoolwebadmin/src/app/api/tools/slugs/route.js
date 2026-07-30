import { NextResponse } from "next/server";

import { TOOL_SLUGS } from "@/config/toolSlugs.generated";
import { adminAuth } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/tools/slugs
 *
 * Admin-only. Previously had no auth check at all, unlike every other route
 * in this app — mirrors the Authorization: Bearer <token> +
 * adminAuth.verifyIdToken() check used by src/app/api/notifications/mark-read/route.js.
 */
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    await adminAuth.verifyIdToken(token);
  } catch (err) {
    console.warn("TOOL_SLUGS_TOKEN_REJECTED:", err?.code ?? err?.message);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      count: TOOL_SLUGS.length,
      items: TOOL_SLUGS,
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
