import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { getRbacAdminDoc, getRbacRootRef } from "@/lib/serverRbac";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { enforceRateLimit } from "@altftool/core/http";

// Self-service only: firstName/lastName/fullName/team/designation/bio/photoURL
// mirror exactly the field set firestore.rules already allows a signed-in
// admin to self-write (see `onlyChanges`/`affectedKeys` on the `admins/{uid}`
// and `admin_users/{uid}` rules). Nothing privilege-bearing (email, roleType,
// isActive, permissions, projectAccess) is reachable through this route.
const ALLOWED_SELF_PROFILE_FIELDS = new Set([
  "firstName",
  "lastName",
  "fullName",
  "team",
  "designation",
  "bio",
  "photoURL",
]);

function sanitizeProfileUpdates(updates) {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) return null;
  return Object.fromEntries(
    Object.entries(updates).filter(([key]) => ALLOWED_SELF_PROFILE_FIELDS.has(key)),
  );
}

/**
 * POST /api/admin/profile
 *
 * Self-service profile save. Exists because the browser cannot fix its own
 * "which doc is mine" problem: firestore.rules only allows a signed-in admin
 * to read/write `admin_users/{request.auth.uid}` (and `admins/{uid}`) by
 * exact doc id, so an admin whose RBAC doc id does not equal their current
 * Firebase Auth uid (provisioned under a different uid, migrated account,
 * etc.) has no client-reachable document at all — every direct client SDK
 * write 404s.
 *
 * /api/admin/me, getRbacAdminDoc() and verifyActiveAdmin() already solve this
 * for READS by falling back to a `where("email", "==", …)` lookup with the
 * Admin SDK, which is not bound by the self-uid-only Firestore rule. This
 * route applies the same uid-then-email resolution to the WRITE path.
 */
export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 20,
      scope: "admin:profile-update",
      windowMs: 60000,
    });
    if (limited) return limited;

    let decoded;
    try {
      ({ decoded } = await verifyActiveAdmin(req));
    } catch (authErr) {
      if (authErr?.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (authErr?.message === "Inactive admin") {
        return NextResponse.json({ error: "Inactive admin" }, { status: 403 });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      body = null;
    }
    const safeUpdates = sanitizeProfileUpdates(body?.updates);
    if (!safeUpdates || Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: "No valid profile updates supplied" }, { status: 400 });
    }

    // RBAC store first (uid, then email — same order/precedence as
    // getRbacAdminDoc, which every other identity lookup in this app uses),
    // legacy `admins` collection only as a fallback.
    const rbacAdmin = await getRbacAdminDoc(decoded);
    if (rbacAdmin) {
      const docRef = getRbacRootRef().collection(RBAC_COLLECTIONS.adminUsers).doc(rbacAdmin.id);
      await docRef.set({ ...safeUpdates, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      return NextResponse.json({ success: true });
    }

    let legacySnap = await adminDb.collection("admins").doc(decoded.uid).get();
    if (!legacySnap.exists && decoded.email) {
      const byEmail = await adminDb
        .collection("admins")
        .where("email", "==", decoded.email)
        .limit(1)
        .get();
      if (!byEmail.empty) legacySnap = byEmail.docs[0];
    }
    if (!legacySnap.exists) {
      return NextResponse.json(
        { error: "No editable admin record is linked to your account." },
        { status: 404 },
      );
    }

    await legacySnap.ref.update({ ...safeUpdates, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ADMIN_PROFILE_UPDATE_ERROR:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
