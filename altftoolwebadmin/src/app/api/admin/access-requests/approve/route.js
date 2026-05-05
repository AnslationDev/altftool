import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { syncAdminClaims } from "@/lib/syncAdminClaims";
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
 * POST /api/admin/access-requests/approve
 *
 * For type "module": merges the single module permission into existing admin doc, calls syncAdminClaims.
 * For type "new":    the actual admin creation is handled by the existing /api/admin/create endpoint.
 *                    This endpoint just marks the request as approved.
 *
 * Body: { requestId: string, adminData?: { ... } }  ← adminData only used for "new" type
 *
 * Frontend flow for "new":
 *   1. Super admin clicks Approve → opens CreateAdminModal (pre-filled email, no password field)
 *   2. Super admin fills role + permissions and submits
 *   3. CreateAdminModal calls /api/admin/create (unchanged)
 *   4. Then calls THIS endpoint with { requestId } to mark the request approved
 */
export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 20,
      scope: "admin:access-approve",
      windowMs: 60000,
    });
    if (limited) return limited;

    const actor = await verifySuperAdmin(req);

    const body = await req.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json({ error: "requestId required" }, { status: 400 });
    }

    const reqRef = adminDb.collection("accessRequests").doc(requestId);
    const reqSnap = await reqRef.get();

    if (!reqSnap.exists) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const requestData = reqSnap.data();

    if (requestData.status !== "pending") {
      return NextResponse.json({ error: "Request is no longer pending" }, { status: 409 });
    }

    /* ──────────────────────────────────────────
       MODULE request: merge single permission
    ────────────────────────────────────────── */
    if (requestData.type === "module") {
      const { uid, projectId, moduleKey } = requestData;

      if (!uid || !projectId || !moduleKey) {
        return NextResponse.json({ error: "Missing uid/projectId/moduleKey on request" }, { status: 400 });
      }

      // Get existing admin doc
      const adminRef = adminDb.collection("admins").doc(uid);
      const adminSnap = await adminRef.get();

      if (!adminSnap.exists) {
        return NextResponse.json({ error: "Admin not found. Cannot grant module access." }, { status: 404 });
      }

      const existingData = adminSnap.data();

      // Merge: only add read = true; keep write/delete = false; DO NOT overwrite existing perms
      const existingProjectAccess = existingData.projectAccess ?? {};
      const existingProjectPerms = existingProjectAccess[projectId]?.permissions ?? {};
      const existingModulePerms = existingProjectPerms[moduleKey] ?? {};

      const updatedProjectAccess = {
        ...existingProjectAccess,
        [projectId]: {
          ...(existingProjectAccess[projectId] ?? {}),
          permissions: {
            ...existingProjectPerms,
            [moduleKey]: {
              write: existingModulePerms.write ?? false,
              delete: existingModulePerms.delete ?? false,
              ...existingModulePerms,  // keep whatever was there
              read: true,              // only force read = true
            },
          },
        },
      };

      await adminRef.update({ projectAccess: updatedProjectAccess });
      await syncAdminClaims(uid);

      await reqRef.update({ status: "approved", approvedAt: new Date().toISOString(), approvedBy: actor.uid });

      await writeAdminAuditLog({
        action: "MODULE_ACCESS_APPROVED",
        actorUid: actor.uid,
        actorEmail: actor.email ?? null,
        targetUid: uid,
        summary: `Granted read access to ${projectId}/${moduleKey}`,
        changes: { projectId, moduleKey, read: true },
      });

      return NextResponse.json({ success: true });
    }

    /* ──────────────────────────────────────────
       NEW request: just mark as approved.
       Actual admin creation was done via /api/admin/create.
    ────────────────────────────────────────── */
    if (requestData.type === "new") {
      await reqRef.update({ status: "approved", approvedAt: new Date().toISOString(), approvedBy: actor.uid });

      await writeAdminAuditLog({
        action: "ACCESS_REQUEST_APPROVED",
        actorUid: actor.uid,
        actorEmail: actor.email ?? null,
        targetUid: requestData.uid ?? null,
        targetEmail: requestData.email ?? null,
        summary: `Approved new admin access request for ${requestData.email}`,
        changes: { requestId },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown request type" }, { status: 400 });
  } catch (err) {
    console.error("ACCESS_REQUEST_APPROVE_ERROR:", err);
    return NextResponse.json({ error: "Unauthorized or failed to approve" }, { status: 401 });
  }
}
