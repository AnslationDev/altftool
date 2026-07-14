import { adminAuth } from "@/lib/firebaseAdmin";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacRootRef } from "@/lib/serverRbac";

export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 10,
      scope: "admin:delete",
      windowMs: 60000,
    });
    if (limited) return limited;

    const actor = await verifySuperAdminRequest(req);
    const { uid } = await req.json();

    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "Admin uid is required" }, { status: 400 });
    }

    if (actor?.uid === uid) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    // 1️⃣ Fetch target admin data first for the audit log
    const targetDoc = await getRbacRootRef().collection(RBAC_COLLECTIONS.adminUsers).doc(uid).get();
    const targetData = targetDoc.exists ? targetDoc.data() : null;

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

    // 3️⃣ Delete from Firestore
    await getRbacRootRef().collection(RBAC_COLLECTIONS.adminUsers).doc(uid).delete();

    // 4️⃣ Log the audit event
    await writeAdminAuditLog({
      action: "ADMIN_DELETE",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetUid: uid,
      targetEmail: targetData?.email ?? null,
      summary: `Deleted admin ${targetData?.email || uid}`,
      changes: { deleted: true, email: targetData?.email || null },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("ADMIN_DELETE_ERROR:", err);
    const message = err?.message || "Failed to delete admin";
    return NextResponse.json(
      { error: message === "Unauthorized" ? "Unauthorized" : message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}
