import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { enforceRateLimit } from "@altftool/core/http";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacRootRef, writeRbacAuditLog } from "@/lib/serverRbac";

const ALLOWED_ADMIN_UPDATE_FIELDS = new Set([
  "email",
  "fullName",
  "team",
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

    const normalizedEmail = safeUpdates.email === undefined
      ? undefined
      : String(safeUpdates.email).trim().toLowerCase();
    if (normalizedEmail !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    const normalizedFullName = safeUpdates.fullName === undefined
      ? undefined
      : String(safeUpdates.fullName).trim();
    const normalizedTeam = safeUpdates.team === undefined
      ? undefined
      : String(safeUpdates.team).trim();
    if (normalizedFullName !== undefined) safeUpdates.fullName = normalizedFullName;
    if (normalizedTeam !== undefined) safeUpdates.team = normalizedTeam;

    const authUpdates = {};
    if (normalizedEmail) {
      authUpdates.email = normalizedEmail;
      safeUpdates.email = normalizedEmail;
    }
    if (normalizedFullName) authUpdates.displayName = normalizedFullName;
    if (Object.keys(authUpdates).length) await adminAuth.updateUser(uid, authUpdates);

    const roleType = safeUpdates.roleType === "superadmin" ? "superadmin" : "admin";
    const isActive = safeUpdates.isActive !== false;
    const adminUserRef = getRbacRootRef().collection(RBAC_COLLECTIONS.adminUsers).doc(uid);
    await adminUserRef.set({
      ...safeUpdates,
      roleType,
      roleId: roleType === "superadmin" ? "super_admin" : "admin",
      isSuperAdmin: roleType === "superadmin",
      status: isActive ? "active" : "suspended",
      isActive,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    if (roleType !== "superadmin" && safeUpdates.projectAccess) {
      const permissionBatch = adminUserRef.firestore.batch();
      Object.entries(safeUpdates.projectAccess).forEach(([projectId, access]) => {
        const projectRef = adminUserRef.collection(RBAC_COLLECTIONS.projectAccess).doc(projectId);
        permissionBatch.set(projectRef, {
          projectId,
          access: access?.access !== false,
          roleId: access?.roleId || "admin",
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        Object.entries(access?.permissions || {}).forEach(([moduleId, modulePerms]) => {
          permissionBatch.set(projectRef.collection(RBAC_COLLECTIONS.modules).doc(moduleId), {
            moduleId,
            access: modulePerms?.read === true || modulePerms?.write === true || modulePerms?.delete === true,
            actions: {
              read: modulePerms?.read === true,
              view: modulePerms?.read === true,
              write: modulePerms?.write === true,
              create: modulePerms?.write === true,
              edit: modulePerms?.write === true,
              delete: modulePerms?.delete === true,
            },
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        });
      });
      await permissionBatch.commit();
    }

    await writeAdminAuditLog({
      action: "ADMIN_UPDATE",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetUid: uid,
      targetEmail: safeUpdates.email ?? null,
      summary: `Updated admin ${uid}`,
      changes: safeUpdates,
    });
    await writeRbacAuditLog({
      action: "admin.update",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetType: "admin_user",
      targetId: uid,
      targetEmail: safeUpdates.email ?? null,
      message: `Updated admin ${uid}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    const message = err?.message || "Failed to update admin";
    return NextResponse.json(
      { error: message === "Unauthorized" ? "Unauthorized" : message },
      { status: message === "Unauthorized" ? 401 : 500 },
    );
  }
}
