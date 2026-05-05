import { adminDb } from "@/lib/firebaseAdmin";
import { adminAuth } from "@/lib/firebaseAdmin";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";

async function verifySuperAdmin(req) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("No token");

  const token = header.replace("Bearer ", "");
  const decoded = await adminAuth.verifyIdToken(token);

  const snap = await adminDb.collection("admins").doc(decoded.uid).get();
  if (!snap.exists || snap.data()?.roleType !== "superadmin" || !snap.data()?.isActive) {
    throw new Error("Unauthorized");
  }
  return decoded;
}

export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 20,
      scope: "admin:toggle-status",
      windowMs: 60000,
    });
    if (limited) return limited;

    const actor = await verifySuperAdmin(req);
    const { adminId, isActive } = await req.json();

    await adminDb
      .collection("admins")
      .doc(adminId)
      .update({
        isActive
      });

    await writeAdminAuditLog({
      action: "ADMIN_STATUS_TOGGLE",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetUid: adminId,
      summary: `Set admin ${adminId} to ${isActive ? "active" : "inactive"}`,
      changes: { isActive },
    });

    return Response.json({ success: true });

  } catch (err) {
    return Response.json(
      { error: "Failed to update status" },
      { status: 500 }
    );

  }

}
