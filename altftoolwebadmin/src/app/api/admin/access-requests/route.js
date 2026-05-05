import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

async function verifySuperAdmin(req) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("No token");

  const token = header.replace("Bearer ", "");
  const decoded = await adminAuth.verifyIdToken(token);

  const snap = await adminDb.collection("admins").doc(decoded.uid).get();
  if (!snap.exists || snap.data()?.roleType !== "superadmin" || !snap.data()?.isActive) {
    throw new Error("Unauthorized");
  }

  return decoded;
}

/**
 * GET /api/admin/access-requests
 * Returns all access requests (superadmin only).
 * Optional ?status=pending|approved|rejected query param.
 */
export async function GET(req) {
  try {
    await verifySuperAdmin(req);

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // optional

    let query = adminDb.collection("accessRequests").orderBy("createdAt", "desc");

    if (statusFilter) {
      query = query.where("status", "==", statusFilter);
    }

    const snap = await query.get();

    const requests = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("ACCESS_REQUESTS_LIST_ERROR:", err);
    return NextResponse.json({ error: "Unauthorized or failed to list requests" }, { status: 401 });
  }
}