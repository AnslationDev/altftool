import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";

const VALID_ROLE_TYPES = new Set(["admin", "superadmin"]);

/* Firestore document ids may not contain "/", may not be "." or "..", may not
   match the reserved __*__ pattern, and are capped at 1500 UTF-8 *bytes*.
   These keys are used verbatim as document ids below, so a bad key would
   throw *after* the Firebase Auth user was created, orphaning it.
   JSON.parse() materialises "__proto__" as an own enumerable key, so without
   the reserved-pattern test a body like {"projectAccess":{"__proto__":{}}}
   would sail through validation and only blow up at batch.commit(). */
const INVALID_ID_CHARS = /\//;
const RESERVED_ID_PATTERN = /^__.*__$/;
const MAX_ID_BYTES = 1500;
const idByteEncoder = new TextEncoder();

const MIN_PASSWORD_LENGTH = 6;
/* Firebase Auth itself accepts up to 4096 characters — matching its bound means
   we never reject a password the provider would have accepted. */
const MAX_PASSWORD_LENGTH = 4096;

/* Firebase Auth codes that mean "the arguments you gave us are bad", i.e. real
   client errors. Everything else (auth/internal-error,
   auth/network-request-failed, auth/too-many-requests, …) is transient or
   server-side and must stay a 500, so the operator retries instead of being
   told to edit a form that was already correct. */
const CLIENT_AUTH_ERROR_CODES = new Set([
  "auth/email-already-exists",
  "auth/invalid-argument",
  "auth/invalid-display-name",
  "auth/invalid-email",
  "auth/invalid-password",
  "auth/invalid-photo-url",
  "auth/invalid-uid",
  "auth/uid-already-exists",
]);

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasInvalidKey(map) {
  return Object.keys(map).some(
    (key) =>
      !key.trim() ||
      idByteEncoder.encode(key).length > MAX_ID_BYTES ||
      key === "." ||
      key === ".." ||
      RESERVED_ID_PATTERN.test(key) ||
      INVALID_ID_CHARS.test(key),
  );
}

export async function POST(req) {
  const limited = enforceRateLimit(NextResponse, req, {
    limit: 10,
    scope: "admin:create",
    windowMs: 60000,
  });
  if (limited) return limited;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
  const {
    email,
    password,
    fullName,
    team,
    roleType,
    permissions,
    projectAccess,
  } = body;

  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const normalizedFullName = String(fullName || "").trim();
  const normalizedTeam = String(team || "").trim();
  const normalizedRoleType = VALID_ROLE_TYPES.has(roleType)
    ? roleType
    : "admin";

  if (!normalizedEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!normalizedEmail.includes("@")) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 },
    );
  }
  if (!normalizedFullName) {
    return NextResponse.json(
      { error: "Full name is required" },
      { status: 400 },
    );
  }
  /* Password is optional (Google-sign-in admins already have an Auth record),
     but when supplied it must be a real string. The old check coerced with
     String(), so e.g. a numeric password passed here and then blew up inside
     the Firebase Admin SDK as a raw 500 for what is a client error. */
  const hasPassword =
    password !== undefined && password !== null && password !== "";
  if (hasPassword && typeof password !== "string") {
    return NextResponse.json(
      { error: "Password must be a string" },
      { status: 400 },
    );
  }
  if (
    hasPassword &&
    (password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH)
  ) {
    return NextResponse.json(
      {
        error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
      },
      { status: 400 },
    );
  }

  /* permissions / projectAccess keys become Firestore document ids and doc
     fields further down, after the Auth user has already been created.
     Reject bad shapes up front so we never orphan an Auth user. */
  if (permissions !== undefined && permissions !== null) {
    if (!isPlainObject(permissions)) {
      return NextResponse.json(
        { error: "permissions must be an object" },
        { status: 400 },
      );
    }
    if (hasInvalidKey(permissions)) {
      return NextResponse.json(
        { error: "permissions contains an invalid module id" },
        { status: 400 },
      );
    }
  }

  if (projectAccess !== undefined && projectAccess !== null) {
    if (!isPlainObject(projectAccess)) {
      return NextResponse.json(
        { error: "projectAccess must be an object" },
        { status: 400 },
      );
    }
    if (hasInvalidKey(projectAccess)) {
      return NextResponse.json(
        { error: "projectAccess contains an invalid project id" },
        { status: 400 },
      );
    }
    for (const access of Object.values(projectAccess)) {
      if (access !== undefined && access !== null && !isPlainObject(access)) {
        return NextResponse.json(
          { error: "Each projectAccess entry must be an object" },
          { status: 400 },
        );
      }
      const modulePerms = access?.permissions;
      if (modulePerms === undefined || modulePerms === null) continue;
      if (!isPlainObject(modulePerms)) {
        return NextResponse.json(
          { error: "projectAccess permissions must be an object" },
          { status: 400 },
        );
      }
      if (hasInvalidKey(modulePerms)) {
        return NextResponse.json(
          { error: "projectAccess contains an invalid module id" },
          { status: 400 },
        );
      }
    }
  }

  let actor;
  try {
    const { verifySuperAdminRequest } = await import("@/lib/adminAccess");
    actor = await verifySuperAdminRequest(req);
  } catch (err) {
    console.error("verifySuperAdmin failed:", err.message);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      { writeAdminAuditLog },
      { adminAuth, adminDb },
      { FieldValue },
      { RBAC_COLLECTIONS },
      { getRbacRootRef, writeRbacAuditLog },
    ] = await Promise.all([
      import("@/lib/adminAuditLog"),
      import("@/lib/firebaseAdmin"),
      import("firebase-admin/firestore"),
      import("@/lib/rbacPaths"),
      import("@/lib/serverRbac"),
    ]);
    let uid;
    let authUserExisted = false;

    /* ─────────────────────────────────────────────────────────────
       Look up Firebase Auth user by email first.
       Google sign-in users already have an Auth record — we must
       NOT call createUser() for them or we get auth/email-in-use.
    ───────────────────────────────────────────────────────────── */
    try {
      const existingAuthUser = await adminAuth.getUserByEmail(normalizedEmail);
      uid = existingAuthUser.uid;
      authUserExisted = true;
      if (hasPassword) {
        await adminAuth.updateUser(uid, {
          password,
          displayName: normalizedFullName,
        });
      }
    } catch (lookupErr) {
      if (lookupErr.code === "auth/user-not-found") {
        // No Firebase Auth user → must be a new password-based admin
        if (!hasPassword) {
          return NextResponse.json(
            {
              error:
                "Password is required (minimum 6 characters) for new admins",
            },
            { status: 400 },
          );
        }
        const newUser = await adminAuth.createUser({
          email: normalizedEmail,
          password,
          displayName: normalizedFullName,
        });

        uid = newUser.uid;
        authUserExisted = false;
      } else {
        // Unexpected error from Firebase Auth
        console.error("getUserByEmail unexpected error:", lookupErr);
        return NextResponse.json(
          { error: "Failed to look up user in Firebase Auth" },
          { status: 500 },
        );
      }
    }

    /* ─────────────────────────────────────────────────────────────
       If Auth user existed AND already has a Firestore admin doc,
       don't silently overwrite it — return a clear error.
    ───────────────────────────────────────────────────────────── */
    if (authUserExisted) {
      const existingDoc = await getRbacRootRef()
        .collection(RBAC_COLLECTIONS.adminUsers)
        .doc(uid)
        .get();
      if (existingDoc.exists) {
        return NextResponse.json(
          {
            error: `An admin account already exists for ${normalizedEmail}. Use Edit Admin to update it.`,
          },
          { status: 409 },
        );
      }
    }

    /* ─────────────────────────────────────────────────────────────
       Write Firestore admin doc (source of truth)
    ───────────────────────────────────────────────────────────── */
    const root = getRbacRootRef();
    const rbacUserRef = root.collection(RBAC_COLLECTIONS.adminUsers).doc(uid);
    const batch = adminDb.batch();

    batch.set(
      rbacUserRef,
      {
        uid,
        fullName: normalizedFullName,
        team: normalizedTeam,
        email: normalizedEmail,
        roleId: normalizedRoleType === "superadmin" ? "super_admin" : "admin",
        roleType: normalizedRoleType,
        status: "active",
        isSuperAdmin: normalizedRoleType === "superadmin",
        permissions:
          normalizedRoleType === "superadmin" ? {} : permissions || {},
        projectAccess:
          normalizedRoleType === "superadmin" ? {} : projectAccess || {},
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: actor?.uid || null,
      },
      { merge: true },
    );
    if (normalizedRoleType !== "superadmin" && projectAccess) {
      Object.entries(projectAccess).forEach(([projectId, access]) => {
        const projectRef = rbacUserRef
          .collection(RBAC_COLLECTIONS.projectAccess)
          .doc(projectId);
        batch.set(
          projectRef,
          {
            projectId,
            access: access?.access !== false,
            roleId: access?.roleId || "admin",
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

        Object.entries(access?.permissions || {}).forEach(
          ([moduleId, modulePerms]) => {
            batch.set(
              projectRef.collection(RBAC_COLLECTIONS.modules).doc(moduleId),
              {
                moduleId,
                access: true,
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
            );
          },
        );
      });
    }

    await batch.commit();

    /* ─────────────────────────────────────────────────────────────
       Sync custom claims from Firestore
    ───────────────────────────────────────────────────────────── */
    await writeAdminAuditLog({
      action: "ADMIN_CREATE",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetUid: uid,
      targetEmail: normalizedEmail,
      summary: `Created admin ${normalizedEmail}`,
      changes: {
        fullName: normalizedFullName,
        team: normalizedTeam,
        roleType: normalizedRoleType,
        permissions:
          normalizedRoleType === "superadmin" ? {} : permissions || {},
        projectAccess:
          normalizedRoleType === "superadmin" ? {} : projectAccess || {},
        isActive: true,
      },
    });

    await writeRbacAuditLog({
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      action: "admin.create",
      targetType: "admin_user",
      targetId: uid,
      targetEmail: normalizedEmail,
      message: `Created admin ${normalizedEmail}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ADMIN_CREATE_ERROR:", err);
    // Firebase Auth *argument rejections* are client errors, not server faults —
    // and their raw messages are internal detail we should not echo back.
    // Transient/infra auth codes deliberately fall through to the 500 below.
    if (err?.code === "auth/email-already-exists") {
      return NextResponse.json(
        {
          error: `An account already exists for ${normalizedEmail}. Refresh the admin list and use Edit Admin to update it.`,
        },
        { status: 409 },
      );
    }
    if (typeof err?.code === "string" && CLIENT_AUTH_ERROR_CODES.has(err.code)) {
      return NextResponse.json(
        { error: "Could not create the admin account with the details provided." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 },
    );
  }
}
