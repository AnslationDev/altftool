import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacRootRef, writeRbacAuditLog } from "@/lib/serverRbac";

function sameEmail(a, b) {
  if (!a || !b) return false;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 20,
      scope: "admin:toggle-status",
      windowMs: 60000,
    });
    if (limited) return limited;

    // Authorization failures — an unusable token as much as a non-superadmin —
    // are client errors, not server faults, and must not surface the underlying
    // Firebase message. Classifying them here keeps the generic catch below for
    // genuine 500s only.
    let actor;
    try {
      actor = await verifySuperAdminRequest(req);
    } catch (authzErr) {
      console.warn("ADMIN_TOGGLE_UNAUTHORIZED:", authzErr?.code ?? authzErr?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { adminId, isActive } = body ?? {};

    if (!adminId || typeof adminId !== "string") {
      return NextResponse.json({ error: "Admin id is required" }, { status: 400 });
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    if (actor?.uid === adminId) {
      return NextResponse.json({ error: "You cannot change your own active status" }, { status: 400 });
    }

    const rbacUsersRef = getRbacRootRef().collection(RBAC_COLLECTIONS.adminUsers);
    const legacyAdminsRef = adminDb.collection("admins");
    const rbacUserRef = rbacUsersRef.doc(adminId);
    const legacyAdminRef = legacyAdminsRef.doc(adminId);
    const [rbacSnap, legacySnap] = await Promise.all([
      rbacUserRef.get(),
      legacyAdminRef.get(),
    ]);

    if (!rbacSnap.exists && !legacySnap.exists) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const targetEmail = rbacSnap.data()?.email ?? legacySnap.data()?.email ?? null;

    // The uid-keyed self check above misses the case where the caller's own
    // record is stored under a doc id that is not their Auth uid — and the
    // email-wide status write below would then suspend the caller themselves.
    if (sameEmail(actor?.email, targetEmail)) {
      return NextResponse.json({ error: "You cannot change your own active status" }, { status: 400 });
    }

    // An admin's records do not have to be keyed by the Auth uid: getRbacAdminDoc()
    // (used by verifySuperAdminRequest / verifyActiveAdmin) and /api/admin/me both
    // fall back to an `email` match when no uid-keyed doc exists. A status written
    // only to {adminId} therefore leaves a still-active sibling record that keeps
    // letting the suspended admin through.
    const [rbacEmailSnap, legacyEmailSnap] = targetEmail
      ? await Promise.all([
          rbacUsersRef.where("email", "==", targetEmail).get(),
          legacyAdminsRef.where("email", "==", targetEmail).get(),
        ])
      : [null, null];

    const status = isActive ? "active" : "suspended";
    const updatedAt = new Date();
    const batch = adminDb.batch();
    const writtenPaths = new Set();
    const authUids = new Set([adminId]);

    // Only touch docs that already exist. Creating an RBAC doc here would write a
    // role-less stub, and the RBAC lookup wins over the legacy one — so toggling
    // a legacy-only superadmin would silently demote them to a permission-less
    // admin with no modules.
    const applyStatus = (ref, data) => {
      if (writtenPaths.has(ref.path)) return;
      writtenPaths.add(ref.path);
      batch.set(ref, { status, isActive, updatedAt }, { merge: true });
      if (typeof data?.uid === "string" && data.uid) authUids.add(data.uid);
    };

    if (rbacSnap.exists) applyStatus(rbacUserRef, rbacSnap.data());

    // The legacy `admins` doc is still the authorization source for a number of
    // routes, so a suspension written only to the RBAC store would not actually
    // revoke anything.
    if (legacySnap.exists) applyStatus(legacyAdminRef, legacySnap.data());

    rbacEmailSnap?.docs.forEach((doc) => applyStatus(doc.ref, doc.data()));
    legacyEmailSnap?.docs.forEach((doc) => applyStatus(doc.ref, doc.data()));

    await batch.commit();

    // Stop the suspended admin from minting fresh ID tokens with the session
    // they already hold — for every Auth uid the suspended records point at.
    if (!isActive) {
      for (const targetUid of authUids) {
        try {
          await adminAuth.revokeRefreshTokens(targetUid);
        } catch (revokeErr) {
          if (revokeErr?.code !== "auth/user-not-found") {
            console.error("ADMIN_TOGGLE_REVOKE_ERROR:", revokeErr?.code || revokeErr);
          }
        }
      }
    }

    await Promise.all([
      writeAdminAuditLog({
        action: "ADMIN_STATUS_TOGGLE",
        actorUid: actor?.uid ?? null,
        actorEmail: actor?.email ?? null,
        targetUid: adminId,
        targetEmail,
        summary: `Set admin ${targetEmail || adminId} to ${isActive ? "active" : "inactive"}`,
        changes: { isActive },
      }),
      writeRbacAuditLog({
        action: "admin.status.toggle",
        actorUid: actor?.uid ?? null,
        actorEmail: actor?.email ?? null,
        targetType: "admin_user",
        targetId: adminId,
        message: `Set admin ${adminId} to ${isActive ? "active" : "suspended"}`,
      }),
    ]);

    return NextResponse.json({ success: true });

  } catch (err) {
    // Everything that reaches this point is a genuine server fault (authorization
    // and bad input are answered above), so log the detail and return a message
    // that does not leak Firestore/Auth internals to the browser.
    console.error("ADMIN_TOGGLE_STATUS_ERROR:", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }

}
