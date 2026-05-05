import { syncAdminClaims } from "@/lib/syncAdminClaims";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifySuperAdminRequest } from "@/lib/adminAccess";

export async function POST(req) {
  try {
    const actor = await verifySuperAdminRequest(req);

    const { uid, updates } = await req.json();

    // 1️⃣ Update Firestore (SOURCE OF TRUTH)
    await adminDb
      .collection("admins")
      .doc(uid)
      .update(updates);

    // 2️⃣ Sync claims FROM Firestore
    await syncAdminClaims(uid);

    await writeAdminAuditLog({
      action: "ADMIN_UPDATE",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetUid: uid,
      targetEmail: updates?.email ?? null,
      summary: `Updated admin ${uid}`,
      changes: updates ?? null,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
