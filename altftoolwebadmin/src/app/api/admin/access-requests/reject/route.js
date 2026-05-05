import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";

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
 * POST /api/admin/access-requests/reject
 * Body: { requestId: string }
 */
export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 20,
      scope: "admin:access-reject",
      windowMs: 60000,
    });
    if (limited) return limited;

    const actor = await verifySuperAdmin(req);

    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: "requestId required" }, { status: 400 });
    }

    const reqRef = adminDb.collection("accessRequests").doc(requestId);
    const reqSnap = await reqRef.get();

    if (!reqSnap.exists) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (reqSnap.data().status !== "pending") {
      return NextResponse.json({ error: "Request is no longer pending" }, { status: 409 });
    }

    await reqRef.update({ status: "rejected", rejectedAt: new Date().toISOString(), rejectedBy: actor.uid });

    await writeAdminAuditLog({
      action: "ACCESS_REQUEST_REJECTED",
      actorUid: actor.uid,
      actorEmail: actor.email ?? null,
      targetEmail: reqSnap.data().email ?? null,
      summary: `Rejected access request for ${reqSnap.data().email ?? requestId}`,
      changes: { requestId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ACCESS_REQUEST_REJECT_ERROR:", err);
    return NextResponse.json({ error: "Unauthorized or failed to reject" }, { status: 401 });
  }
}
