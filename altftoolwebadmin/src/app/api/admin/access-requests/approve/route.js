import { adminDb } from "@/lib/firebaseAdmin";
import { syncAdminClaims } from "@/lib/syncAdminClaims";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { FieldValue } from "firebase-admin/firestore";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacAdminDoc, getRbacRootRef } from "@/lib/serverRbac";

// Firestore document ids may not be empty, contain "/", or be "."/"..".
function isSafeDocId(value) {
  return typeof value === "string"
    && value.length > 0
    && !value.includes("/")
    && value !== "."
    && value !== "..";
}

/**
 * Stages a read grant for a single module in the RBAC store
 * (super_admin_dashboard/main/admin_users/{uid}/project_access/{projectId}/modules/{moduleKey})
 * onto `batch`, mirroring what /api/admin/update writes. Returns false when the
 * target has no RBAC admin user doc, so the caller can fall back to the legacy
 * `admins` doc.
 *
 * Every read this needs happens here and nothing is committed: the caller commits
 * the batch, so a failed RBAC lookup can never leave a half-applied grant behind.
 */
async function stageRbacModuleAccess(batch, { uid, email, projectId, moduleKey }) {
  const rbacAdmin = await getRbacAdminDoc({ uid, email: email ?? null });
  if (!rbacAdmin) return false;

  const projectRef = getRbacRootRef()
    .collection(RBAC_COLLECTIONS.adminUsers)
    .doc(rbacAdmin.id)
    .collection(RBAC_COLLECTIONS.projectAccess)
    .doc(projectId);

  const projectSnap = await projectRef.get();

  batch.set(projectRef, {
    projectId,
    access: true,
    // Never clobber a role the super admin already assigned to this project.
    ...(projectSnap.exists ? {} : { roleId: "admin" }),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  // merge:true deep-merges the `actions` map, so any existing write/delete
  // grants survive — only read/view are forced on, same as the legacy path.
  batch.set(projectRef.collection(RBAC_COLLECTIONS.modules).doc(moduleKey), {
    moduleId: moduleKey,
    access: true,
    actions: { read: true, view: true },
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return true;
}

/**
 * POST /api/admin/access-requests/approve
 *
 * For type "module": grants read on the module in BOTH the RBAC store and the
 *                    legacy `admins` doc (whichever exist), calls syncAdminClaims.
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
  const limited = enforceRateLimit(NextResponse, req, {
    limit: 20,
    scope: "admin:access-approve",
    windowMs: 60000,
  });
  if (limited) return limited;

  // Authorization is resolved separately from the work below so an authenticated
  // super admin never sees a server fault reported as "Unauthorized".
  //
  // NOTE (deliberate): verifySuperAdminRequest() accepts a legacy `admins` doc with
  // roleType "superadmin" and NO isActive field (it rejects only on isActive === false),
  // which is marginally weaker than the inline `!isActive` check this route used to run.
  // That is the platform-wide rule every other admin route already follows; diverging
  // here would let a super admin pass everywhere and fail only on this endpoint. If the
  // policy should tighten, change it once in lib/adminAccess.js, not per route.
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
    console.error("ACCESS_REQUEST_APPROVE_AUTH_ERROR:", err);
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

    // Mark the request approved in every store that holds it, so the merged
    // listing in /api/admin/access-requests no longer shows it as pending.
    const markApproved = async () => {
      const statusUpdate = {
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: actor.uid,
      };
      await Promise.all([
        reqSnap.exists ? reqRef.update(statusUpdate) : null,
        rbacReqSnap.exists ? rbacReqRef.update(statusUpdate) : null,
      ]);
    };

    /* ──────────────────────────────────────────
       MODULE request: merge single permission
    ────────────────────────────────────────── */
    if (requestData.type === "module") {
      const { uid, projectId, moduleKey } = requestData;

      if (!isSafeDocId(uid) || !isSafeDocId(projectId) || !isSafeDocId(moduleKey)) {
        return NextResponse.json({ error: "Missing uid/projectId/moduleKey on request" }, { status: 400 });
      }

      // Both stores are written in ONE batch: every read happens first, so a
      // failure while resolving the RBAC side can no longer leave the legacy grant
      // already committed with the request still sitting at status "pending".
      const batch = adminDb.batch();
      let legacyGranted = false;

      // Legacy store: keep working for admins that still live in `admins`.
      const adminRef = adminDb.collection("admins").doc(uid);
      const adminSnap = await adminRef.get();

      if (adminSnap.exists) {
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

        batch.update(adminRef, { projectAccess: updatedProjectAccess });
        legacyGranted = true;
      }

      // RBAC store: the only place admins created via /api/admin/create exist.
      const rbacGranted = await stageRbacModuleAccess(batch, {
        uid,
        email: requestData.email,
        projectId,
        moduleKey,
      });

      if (!legacyGranted && !rbacGranted) {
        // Nothing has been written yet, so this is a clean no-op failure.
        return NextResponse.json({ error: "Admin not found. Cannot grant module access." }, { status: 404 });
      }

      await batch.commit();

      // Custom claims are derived from the legacy doc, so they can only be
      // refreshed after the grant is committed. If this throws the request stays
      // "pending" and a retry re-runs the (idempotent) grant and the claim sync.
      if (legacyGranted) {
        await syncAdminClaims(uid);
      }

      await markApproved();

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
      await markApproved();

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
    return NextResponse.json({ error: "Failed to approve request" }, { status: 500 });
  }
}
