import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacRootRef } from "@/lib/serverRbac";

// Firestore caps a batch at 500 writes; stay comfortably below it.
const MAX_BATCH_OPERATIONS = 400;

function sameEmail(a, b) {
  if (!a || !b) return false;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 10,
      scope: "admin:delete",
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
      console.warn("ADMIN_DELETE_UNAUTHORIZED:", authzErr?.code ?? authzErr?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { uid } = body ?? {};

    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "Admin uid is required" }, { status: 400 });
    }

    if (actor?.uid === uid) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    // 1️⃣ Fetch target admin data first for the audit log
    const rbacUsersRef = getRbacRootRef().collection(RBAC_COLLECTIONS.adminUsers);
    const legacyAdminsRef = adminDb.collection("admins");
    const rbacUserRef = rbacUsersRef.doc(uid);
    const legacyAdminRef = legacyAdminsRef.doc(uid);
    const [targetDoc, legacyDoc] = await Promise.all([
      rbacUserRef.get(),
      legacyAdminRef.get(),
    ]);
    const targetData = targetDoc.exists ? targetDoc.data() : null;
    const legacyData = legacyDoc.exists ? legacyDoc.data() : null;
    const targetEmail = targetData?.email ?? legacyData?.email ?? null;

    // The uid-keyed self check above misses the case where the caller's own
    // record is stored under a doc id that is not their Auth uid — and the
    // email-wide cleanup below would then wipe the caller's own access.
    if (sameEmail(actor?.email, targetEmail)) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    // An admin's records do not have to be keyed by the Auth uid: both
    // /api/admin/me and getRbacAdminDoc() fall back to an `email` match when no
    // uid-keyed doc exists, so a sibling doc under any other id grants exactly
    // the same access. Collect those as well.
    const [rbacEmailSnap, legacyEmailSnap] = targetEmail
      ? await Promise.all([
          rbacUsersRef.where("email", "==", targetEmail).get(),
          legacyAdminsRef.where("email", "==", targetEmail).get(),
        ])
      : [null, null];

    // 2️⃣ Delete from Firebase Authentication
    try {
      await adminAuth.deleteUser(uid);
    } catch (authErr) {
      // If user was already deleted from Auth, log warning but proceed with Firestore cleanup
      if (authErr.code !== "auth/user-not-found") {
        console.error(`Firebase Auth delete failed for ${uid}:`, authErr);
        throw authErr;
      }
    }

    // 3️⃣ Delete every Firestore record that still grants access.
    //     Deleting the Auth user frees the email address, so any record left
    //     behind — in particular the legacy `admins/{uid}` doc, which
    //     /api/admin/me matches by uid AND by email — would re-grant this
    //     admin's role to whoever registers that address next.
    const rbacUserRefs = new Map([[rbacUserRef.path, rbacUserRef]]);
    rbacEmailSnap?.docs.forEach((doc) => rbacUserRefs.set(doc.ref.path, doc.ref));

    const legacyRefs = new Map();
    if (legacyDoc.exists) legacyRefs.set(legacyAdminRef.path, legacyAdminRef);
    legacyEmailSnap?.docs.forEach((doc) => legacyRefs.set(doc.ref.path, doc.ref));

    const operations = [];

    await Promise.all(Array.from(rbacUserRefs.values()).map(async (userRef) => {
      const projectAccessSnap = await userRef
        .collection(RBAC_COLLECTIONS.projectAccess)
        .get();

      await Promise.all(projectAccessSnap.docs.map(async (projectDoc) => {
        const modulesSnap = await projectDoc.ref.collection(RBAC_COLLECTIONS.modules).get();
        modulesSnap.docs.forEach((moduleDoc) => {
          operations.push((batch) => batch.delete(moduleDoc.ref));
        });
        operations.push((batch) => batch.delete(projectDoc.ref));
      }));

      operations.push((batch) => batch.delete(userRef));
    }));

    legacyRefs.forEach((ref) => {
      operations.push((batch) => batch.delete(ref));
    });

    for (let index = 0; index < operations.length; index += MAX_BATCH_OPERATIONS) {
      const batch = adminDb.batch();
      operations
        .slice(index, index + MAX_BATCH_OPERATIONS)
        .forEach((applyOperation) => applyOperation(batch));
      await batch.commit();
    }

    // 4️⃣ Log the audit event
    await writeAdminAuditLog({
      action: "ADMIN_DELETE",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetUid: uid,
      targetEmail,
      summary: `Deleted admin ${targetEmail || uid}`,
      changes: { deleted: true, email: targetEmail },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    // Everything that reaches this point is a genuine server fault (authorization
    // and bad input are answered above), so log the detail and return a message
    // that does not leak Firestore/Auth internals to the browser.
    console.error("ADMIN_DELETE_ERROR:", err);
    return NextResponse.json({ error: "Failed to delete admin" }, { status: 500 });
  }
}
