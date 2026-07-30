import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { getAnalyticsDashboardData } from "@/lib/analytics/analytics.service";

export async function GET(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 30,
      windowMs: 60_000,
      scope: "admin:analytics",
    });
    if (limited) return limited;

    // RBAC-aware: recognises super admins in the new RBAC store
    // (super_admin_dashboard/main/admin_users) AND the legacy `admins`
    // collection. The old hand-rolled check here only read legacy `admins`, so
    // a super admin who exists ONLY in RBAC got a 401 and the dashboard failed
    // to load.
    await verifySuperAdminRequest(request);
    const dashboard = await getAnalyticsDashboardData();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("ANALYTICS_ROUTE_ERROR:", error);
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Failed to load analytics" },
      { status },
    );
  }
}
