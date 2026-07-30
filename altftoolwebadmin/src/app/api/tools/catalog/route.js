import { NextResponse } from "next/server";

import { TOOL_CATALOG } from "@/config/toolCatalog.generated";
import { verifySuperAdminRequest } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

/**
 * GET /api/tools/catalog
 *
 * Superadmin-only, same gate as /api/analytics (both back a page registered
 * `superadminOnly: true` in adminRoutes.js). The Tool Catalog admin page used
 * to import TOOL_CATALOG directly in its server component and pass it as a
 * prop, so the full catalog was embedded in the server response before any
 * client-side auth check ran. Moving the data behind this authenticated route
 * — fetched client-side, same as every other superadminOnly page's data —
 * means the server response for the page itself never carries the catalog
 * for an unauthenticated or non-superadmin caller.
 */
export async function GET(request) {
  try {
    await verifySuperAdminRequest(request);

    return NextResponse.json(
      {
        count: TOOL_CATALOG.length,
        items: TOOL_CATALOG,
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  } catch (err) {
    console.error("TOOLS_CATALOG_ROUTE_ERROR:", err);
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Failed to load tool catalog" },
      { status },
    );
  }
}
