import { syncAdminClaims } from "@/lib/syncAdminClaims";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { enforceRateLimit } from "@altftool/core/http";

const ALLOWED_ADMIN_UPDATE_FIELDS = new Set([
  "email",
  "fullName",
  "firstName",
  "lastName",
  "photoURL",
  "roleType",
  "isActive",
  "permissions",
  "projectAccess",
]);

function sanitizeAdminUpdates(updates) {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) return null;

  return Object.fromEntries(
    Object.entries(updates).filter(([key]) => ALLOWED_ADMIN_UPDATE_FIELDS.has(key)),
  );
}

export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 20,
      scope: "admin:update",
      windowMs: 60000,
    });
    if (limited) return limited;

    const actor = await verifySuperAdminRequest(req);

    const { uid, updates } = await req.json();
    const safeUpdates = sanitizeAdminUpdates(updates);

    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "Admin uid is required" }, { status: 400 });
    }

    if (!safeUpdates || Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: "No valid admin updates supplied" }, { status: 400 });
    }

    // 1️⃣ Update Firestore (SOURCE OF TRUTH)
    await adminDb
      .collection("admins")
      .doc(uid)
      .update(safeUpdates);

    // 2️⃣ Sync claims FROM Firestore
    await syncAdminClaims(uid);

    await writeAdminAuditLog({
      action: "ADMIN_UPDATE",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetUid: uid,
      targetEmail: safeUpdates?.email ?? null,
      summary: `Updated admin ${uid}`,
      changes: safeUpdates,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    const message = err?.message || "Failed to update admin";
    return NextResponse.json(
      { error: message === "Unauthorized" ? "Unauthorized" : message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}
