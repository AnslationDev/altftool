import { adminDb } from "@/lib/firebaseAdmin";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { verifySuperAdminRequest } from "@/lib/adminAccess";

export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 20,
      scope: "admin:toggle-status",
      windowMs: 60000,
    });
    if (limited) return limited;

    const actor = await verifySuperAdminRequest(req);
    const { adminId, isActive } = await req.json();

    if (!adminId || typeof adminId !== "string") {
      return NextResponse.json({ error: "Admin id is required" }, { status: 400 });
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    if (actor?.uid === adminId) {
      return NextResponse.json({ error: "You cannot change your own active status" }, { status: 400 });
    }

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

    return NextResponse.json({ success: true });

  } catch (err) {
    const message = err?.message || "Failed to update status";
    return NextResponse.json(
      { error: message === "Unauthorized" ? "Unauthorized" : message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );

  }

}
