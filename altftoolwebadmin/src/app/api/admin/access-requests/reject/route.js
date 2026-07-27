import { adminDb } from "@/lib/firebaseAdmin";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacRootRef } from "@/lib/serverRbac";

// Firestore document ids may not be empty, contain "/", or be "."/"..".
function isSafeDocId(value) {
  return typeof value === "string"
    && value.length > 0
    && !value.includes("/")
    && value !== "."
    && value !== "..";
}

/**
 * POST /api/admin/access-requests/reject
 * Body: { requestId: string }
 *
 * Mirrors /approve: authorization goes through the shared helper (so super admins
 * that live in the RBAC store are accepted, not just legacy `admins` docs), and the
 * request may live in either store.
 */
export async function POST(req) {
  const limited = enforceRateLimit(NextResponse, req, {
    limit: 20,
    scope: "admin:access-reject",
    windowMs: 60000,
  });
  if (limited) return limited;

  // Authorization is resolved separately from the work below so an authenticated
  // super admin never sees a server fault reported as "Unauthorized".
  //
  // Mirrors getBearerToken() in lib/adminAccess.js exactly: a bare `Authorization:
  // Bearer ` header yields "" there, i.e. no credentials at all — that is a 401, not a 403.
  const authorization = req.headers.get("authorization");
  const hasBearerToken = authorization?.startsWith("Bearer ")
    ? Boolean(authorization.split("Bearer ")[1])
    : false;
  let actor;
  try {
    actor = await verifySuperAdminRequest(req);
  } catch (err) {
    console.error("ACCESS_REQUEST_REJECT_AUTH_ERROR:", err);
    // A valid token that simply isn't an active super admin is a 403; a missing
    // or unverifiable token is a 401. The sentinel below is the bare
    // Error("Unauthorized") thrown by verifySuperAdminRequest — keep the two in sync.
    const forbidden = hasBearerToken && err?.message === "Unauthorized";
    return NextResponse.json(
      { error: forbidden ? "Forbidden" : "Unauthorized" },
      { status: forbidden ? 403 : 401 },
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const requestId = body?.requestId;

    if (!isSafeDocId(requestId)) {
      return NextResponse.json({ error: "A valid requestId is required" }, { status: 400 });
    }

    const reqRef = adminDb.collection("accessRequests").doc(requestId);
    const rbacReqRef = getRbacRootRef()
      .collection(RBAC_COLLECTIONS.accessRequests)
      .doc(requestId);

    const [reqSnap, rbacReqSnap] = await Promise.all([reqRef.get(), rbacReqRef.get()]);

    if (!reqSnap.exists && !rbacReqSnap.exists) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Legacy wins when both copies exist (that is the doc this route has always read).
    const requestData = {
      ...(rbacReqSnap.exists ? rbacReqSnap.data() : {}),
      ...(reqSnap.exists ? reqSnap.data() : {}),
    };

    if (requestData.status !== "pending") {
      return NextResponse.json({ error: "Request is no longer pending" }, { status: 409 });
    }

    // Update every store that holds the request, atomically, so the merged listing
    // in /api/admin/access-requests can never show it as still pending.
    const statusUpdate = {
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      rejectedBy: actor.uid,
    };
    const batch = adminDb.batch();
    if (reqSnap.exists) batch.update(reqRef, statusUpdate);
    if (rbacReqSnap.exists) batch.update(rbacReqRef, statusUpdate);
    await batch.commit();

    await writeAdminAuditLog({
      action: "ACCESS_REQUEST_REJECTED",
      actorUid: actor.uid,
      actorEmail: actor.email ?? null,
      targetUid: requestData.uid ?? null,
      targetEmail: requestData.email ?? null,
      summary: `Rejected access request for ${requestData.email ?? requestId}`,
      changes: { requestId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ACCESS_REQUEST_REJECT_ERROR:", err);
    return NextResponse.json({ error: "Failed to reject request" }, { status: 500 });
  }
}
