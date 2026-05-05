import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { getAnalyticsDashboardData } from "@/lib/analytics/analytics.service";

async function verifySuperAdmin(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split("Bearer ")[1];
  const decoded = await adminAuth.verifyIdToken(token);
  const snap = await adminDb.collection("admins").doc(decoded.uid).get();
  const data = snap.data();

  if (!snap.exists || data?.roleType !== "superadmin" || !data?.isActive) {
    throw new Error("Unauthorized");
  }
}

export async function GET(request) {
  try {
    await verifySuperAdmin(request)
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
