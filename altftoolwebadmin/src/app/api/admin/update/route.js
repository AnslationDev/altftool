import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
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

const VALID_ROLE_TYPES = new Set(["admin", "superadmin"]);
// Firestore caps a batch at 500 writes; stay comfortably below it.
const MAX_BATCH_OPERATIONS = 400;

function sanitizeAdminUpdates(updates) {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) return null;
  return Object.fromEntries(
    Object.entries(updates).filter(([key]) => ALLOWED_ADMIN_UPDATE_FIELDS.has(key)),
  );
}

function hasOwn(source, key) {
  return Object.prototype.hasOwnProperty.call(source || {}, key);
}

function sameEmail(a, b) {
  if (!a || !b) return false;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

function isSuperAdminDoc(data = {}) {
  return (
    data.isSuperAdmin === true ||
    data.roleType === "superadmin" ||
    data.roleId === "super_admin"
  );
}

async function commitOperations(operations) {
  for (let index = 0; index < operations.length; index += MAX_BATCH_OPERATIONS) {
    const batch = adminDb.batch();
    operations
      .slice(index, index + MAX_BATCH_OPERATIONS)
      .forEach((applyOperation) => applyOperation(batch));
    await batch.commit();
  }
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

    // Privilege-bearing fields are only honoured when the caller actually sent
    // them. Deriving them with defaults meant a partial update (e.g. `{team}`)
    // silently demoted a superadmin and reactivated a suspended account.
    const rolePresent = hasOwn(safeUpdates, "roleType");
    if (rolePresent && !VALID_ROLE_TYPES.has(safeUpdates.roleType)) {
      return NextResponse.json(
        { error: "roleType must be 'admin' or 'superadmin'" },
        { status: 400 },
      );
    }
    const activePresent = hasOwn(safeUpdates, "isActive");
    if (activePresent && typeof safeUpdates.isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    // Unlike delete/toggle-status (whole-account actions that never make sense
    // on self), this route also carries legitimate self-service edits (name,
    // email, password) that the UI intentionally supports. Only the
    // privilege-bearing fields — role and active status — can be used to
    // silently demote or deactivate the caller, so only those are guarded,
    // mirroring the self-target rejection delete/toggle-status already apply.
    if (actor?.uid === uid && (rolePresent || activePresent)) {
      return NextResponse.json(
        { error: "You cannot change your own role or active status" },
        { status: 400 },
      );
    }

    const projectAccessPresent = hasOwn(safeUpdates, "projectAccess");
    if (
      projectAccessPresent
      && (!safeUpdates.projectAccess
        || typeof safeUpdates.projectAccess !== "object"
        || Array.isArray(safeUpdates.projectAccess))
    ) {
      return NextResponse.json({ error: "projectAccess must be an object" }, { status: 400 });
    }

    const authUpdates = {};
    if (normalizedEmail) {
      authUpdates.email = normalizedEmail;
      safeUpdates.email = normalizedEmail;
    }
    if (normalizedFullName) authUpdates.displayName = normalizedFullName;

    // Firebase Auth is updated FIRST, before any Firestore write.
    //
    // Auth is shared with the consumer site, so `auth/email-already-exists`
    // means the address belongs to a different real account. If we wrote
    // Firestore first and Auth then rejected the email, the admin document
    // would be left claiming an address its Auth account does not own — and
    // /api/admin/me resolves an admin by email when the uid lookup misses, so
    // the owner of that address would inherit this admin's role on next
    // sign-in. Failing before any Firestore write keeps that state unreachable.
    if (Object.keys(authUpdates).length) {
      try {
        await adminAuth.updateUser(uid, authUpdates);
      } catch (authErr) {
        console.error("ADMIN_UPDATE_AUTH_ERROR:", authErr?.code || authErr);
        const code = authErr?.code;
        const clientFault =
          code === "auth/email-already-exists" || code === "auth/invalid-email";
        return NextResponse.json(
          {
            error: clientFault
              ? "That email is invalid or already belongs to another account. Nothing was changed."
              : "The sign-in account could not be updated. Nothing was changed.",
          },
          { status: clientFault ? 400 : 500 },
        );
      }
    }

    const adminUserRef = getRbacRootRef().collection(RBAC_COLLECTIONS.adminUsers).doc(uid);
    const legacyAdminRef = adminDb.collection("admins").doc(uid);
    const [existingSnap, legacySnap] = await Promise.all([
      adminUserRef.get(),
      legacyAdminRef.get(),
    ]);
    const existingData = existingSnap.exists
      ? existingSnap.data() || {}
      : (legacySnap.exists ? legacySnap.data() || {} : {});

    // The uid-keyed self check above misses the case where the caller's own
    // record is stored under a doc id that is not their Auth uid — the same
    // gap delete/toggle-status close with an email-matched fallback.
    if ((rolePresent || activePresent) && sameEmail(actor?.email, existingData.email)) {
      return NextResponse.json(
        { error: "You cannot change your own role or active status" },
        { status: 400 },
      );
    }

    // Effective values: what the admin ends up with once this request is applied.
    const roleType = rolePresent
      ? safeUpdates.roleType
      : (isSuperAdminDoc(existingData) ? "superadmin" : "admin");
    const isActive = activePresent ? safeUpdates.isActive : existingData.isActive !== false;

    const docUpdates = {
      ...safeUpdates,
      updatedAt: FieldValue.serverTimestamp(),
    };
    // When we are creating the RBAC doc for a legacy-only admin we must
    // materialise the inherited role/status, otherwise the new doc outranks the
    // legacy one while carrying no role at all.
    if (rolePresent || !existingSnap.exists) {
      docUpdates.roleType = roleType;
      docUpdates.roleId = roleType === "superadmin" ? "super_admin" : "admin";
      docUpdates.isSuperAdmin = roleType === "superadmin";
    }
    if (activePresent || !existingSnap.exists) {
      docUpdates.status = isActive ? "active" : "suspended";
      docUpdates.isActive = isActive;
    }

    await adminUserRef.set(docUpdates, { merge: true });

    if (roleType !== "superadmin" && projectAccessPresent) {
      const submittedProjects = safeUpdates.projectAccess;
      const projectAccessRef = adminUserRef.collection(RBAC_COLLECTIONS.projectAccess);
      const existingProjectsSnap = await projectAccessRef.get();
      const operations = [];

      Object.entries(submittedProjects).forEach(([projectId, access]) => {
        const projectRef = projectAccessRef.doc(projectId);
        operations.push((batch) => batch.set(projectRef, {
          projectId,
          access: access?.access !== false,
          roleId: access?.roleId || "admin",
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true }));

        Object.entries(access?.permissions || {}).forEach(([moduleId, modulePerms]) => {
          operations.push((batch) => batch.set(
            projectRef.collection(RBAC_COLLECTIONS.modules).doc(moduleId),
            {
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
            },
            { merge: true },
          ));
        });
      });

      // Revocation is a diff, not a merge: the stored module/project docs are
      // the only thing readRbacProjectAccess looks at, so anything the payload
      // no longer grants has to be removed. Without this, "Clear All" (which
      // posts `permissions: {}`) wrote nothing and left full access in place.
      await Promise.all(existingProjectsSnap.docs.map(async (projectDoc) => {
        const isSubmitted = hasOwn(submittedProjects, projectDoc.id);
        const submittedProject = isSubmitted ? submittedProjects[projectDoc.id] : null;
        const keptModuleIds = new Set(Object.keys(submittedProject?.permissions || {}));
        const modulesSnap = await projectDoc.ref.collection(RBAC_COLLECTIONS.modules).get();

        modulesSnap.docs.forEach((moduleDoc) => {
          if (!keptModuleIds.has(moduleDoc.id)) {
            operations.push((batch) => batch.delete(moduleDoc.ref));
          }
        });
        if (!isSubmitted) {
          operations.push((batch) => batch.delete(projectDoc.ref));
        }
      }));

      await commitOperations(operations);
    }

    // Many routes still authorize straight off the legacy `admins` doc, so a
    // status/role change that only lands in the RBAC store would not take
    // effect there. Mirror it — but never create a legacy doc that is not
    // already present.
    if (legacySnap.exists) {
      const legacyMirror = {};
      if (safeUpdates.email !== undefined) legacyMirror.email = safeUpdates.email;
      if (safeUpdates.fullName !== undefined) legacyMirror.fullName = safeUpdates.fullName;
      if (safeUpdates.team !== undefined) legacyMirror.team = safeUpdates.team;
      if (rolePresent) legacyMirror.roleType = roleType;
      if (activePresent) {
        legacyMirror.isActive = isActive;
        legacyMirror.status = isActive ? "active" : "suspended";
      }
      if (Object.keys(legacyMirror).length) {
        legacyMirror.updatedAt = FieldValue.serverTimestamp();
        await legacyAdminRef.set(legacyMirror, { merge: true });
      }
    }

    await Promise.all([
      writeAdminAuditLog({
        action: "ADMIN_UPDATE",
        actorUid: actor?.uid ?? null,
        actorEmail: actor?.email ?? null,
        targetUid: uid,
        targetEmail: safeUpdates.email ?? null,
        summary: `Updated admin ${uid}`,
        changes: safeUpdates,
      }),
      writeRbacAuditLog({
        action: "admin.update",
        actorUid: actor?.uid ?? null,
        actorEmail: actor?.email ?? null,
        targetType: "admin_user",
        targetId: uid,
        targetEmail: safeUpdates.email ?? null,
        message: `Updated admin ${uid}`,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    // Every sibling mutation route (delete, toggle-status, create,
    // change-password) classifies auth failures and returns a generic message
    // otherwise — this route was the outlier, echoing raw Firestore/Auth error
    // text (err.message) straight back to the browser on any other failure.
    const message = err?.message || "";
    return NextResponse.json(
      { error: message === "Unauthorized" ? "Unauthorized" : "Failed to update admin" },
      { status: message === "Unauthorized" ? 401 : 500 },
    );
  }
}
