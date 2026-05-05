import admin from "firebase-admin";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";

/* ===============================
   Same verifier (reuse or import)
=============================== */
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

    const { uid, password } = await req.json();

    /* ===============================
       Validation
    =============================== */
    if (!uid || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    /* ===============================
       Update AUTH (NOT Firestore)
    =============================== */
    await admin.auth().updateUser(uid, {
      password,
    });

    await writeAdminAuditLog({
      action: "ADMIN_PASSWORD_CHANGE",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetUid: uid,
      summary: `Changed password for admin ${uid}`,
      changes: { passwordChanged: true },
      metadata: { passwordLength: String(password?.length ?? 0) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unauthorized or failed to update password" },
      { status: 401 }
    );
  }
}