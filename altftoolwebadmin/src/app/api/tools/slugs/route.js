import { NextResponse } from "next/server";

import { TOOL_SLUGS } from "@/config/toolSlugs.generated";
import { withAdminApi } from "@/lib/security/withAdminApi";

export const dynamic = "force-dynamic";

/**
 * GET /api/tools/slugs
 *
 * Admin-only. Keep this behind the shared active-admin guard so a valid
 * Firebase user without an active admin profile cannot enumerate admin data.
 */
async function handler() {
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

export const GET = withAdminApi(handler);
