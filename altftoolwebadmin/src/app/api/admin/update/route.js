import admin from "firebase-admin";
import { syncAdminClaims } from "@/lib/syncAdminClaims";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";

async function verifySuperAdmin(req) {
  const header = req.headers.get("authorization");
  if (!header) throw new Error("No token");

  const token = header.replace("Bearer ", "");
  const decoded = await admin.auth().verifyIdToken(token);

  const snap = await admin
    .firestore()
    .collection("admins")
    .doc(decoded.uid)
    .get();

  if (!snap.exists || snap.data().roleType !== "superadmin") {
    throw new Error("Unauthorized");
  }

  if (!snap.data().isActive) {
    throw new Error("Inactive admin");
  }

  return decoded;
}

export async function POST(req) {
  try {
    const actor = await verifySuperAdmin(req);

    const { uid, updates } = await req.json();

    // 1️⃣ Update Firestore (SOURCE OF TRUTH)
    await admin
      .firestore()
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