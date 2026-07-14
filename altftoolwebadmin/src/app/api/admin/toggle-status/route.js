import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacRootRef, writeRbacAuditLog } from "@/lib/serverRbac";

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

    await getRbacRootRef()
      .collection(RBAC_COLLECTIONS.adminUsers)
      .doc(adminId)
      .set({
        status: isActive ? "active" : "suspended",
        isActive,
        updatedAt: new Date(),
      }, { merge: true });

    await writeAdminAuditLog({
      action: "ADMIN_STATUS_TOGGLE",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetUid: adminId,
      summary: `Set admin ${adminId} to ${isActive ? "active" : "inactive"}`,
      changes: { isActive },
    });

    await writeRbacAuditLog({
      action: "admin.status.toggle",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetType: "admin_user",
      targetId: adminId,
      message: `Set admin ${adminId} to ${isActive ? "active" : "suspended"}`,
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
