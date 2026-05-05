import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { enforceRateLimit } from "@altftool/core/http";

export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 10,
      scope: "admin:change-password",
      windowMs: 60000,
    });
    if (limited) return limited;

    const actor = await verifySuperAdminRequest(req);

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
    await adminAuth.updateUser(uid, {
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
