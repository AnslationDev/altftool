import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { enforceRateLimit } from "@altftool/core/http";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacRootRef } from "@/lib/serverRbac";

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 4096;

/* verifySuperAdminRequest() throws a bare Error("Unauthorized") when it denies
   access, but it ALSO propagates genuine infrastructure faults — a network
   error out of adminAuth.verifyIdToken, or a Firestore read failure inside
   getRbacAdminDoc()/getAdminAccess(). Only the former may answer 401; telling
   an authenticated super admin "Unauthorized" during a Firebase outage sends
   them chasing a login problem that does not exist. */
const AUTH_INFRA_CODES = new Set([
  "auth/internal-error",
  "auth/network-request-failed",
  "auth/too-many-requests",
]);

function isAuthorizationFailure(err) {
  if (err?.message === "Unauthorized") return true;
  const code = typeof err?.code === "string" ? err.code : "";
  return code.startsWith("auth/") && !AUTH_INFRA_CODES.has(code);
}

export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 10,
      scope: "admin:change-password",
      windowMs: 60000,
    });
    if (limited) return limited;

    /* ===============================
       Authorization — only a failure
       here may answer 401.
    =============================== */
    let actor;
    try {
      actor = await verifySuperAdminRequest(req);
    } catch (authErr) {
      if (!isAuthorizationFailure(authErr)) {
        console.error("ADMIN_PASSWORD_CHANGE_AUTH_FAULT:", authErr);
        return NextResponse.json(
          { error: "Could not verify your access right now. Please try again." },
          { status: 500 }
        );
      }
      console.warn("ADMIN_PASSWORD_CHANGE_UNAUTHORIZED:", authErr?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      body = null;
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { uid, password } = body;

    /* ===============================
       Validation
    =============================== */
    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "Admin uid is required" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    /* ===============================
       The target must actually be an
       admin. Firebase Auth is shared
       with the consumer site, so an
       unchecked uid would let this
       route take over any end-user
       account.
    =============================== */
    const rbacSnap = await getRbacRootRef()
      .collection(RBAC_COLLECTIONS.adminUsers)
      .doc(uid)
      .get();
    let isKnownAdmin = rbacSnap.exists;
    if (!isKnownAdmin) {
      const legacySnap = await adminDb.collection("admins").doc(uid).get();
      isKnownAdmin = legacySnap.exists;
    }
    if (!isKnownAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    /* ===============================
       Update AUTH (NOT Firestore)
    =============================== */
    try {
      await adminAuth.updateUser(uid, {
        password,
      });
    } catch (updateErr) {
      console.error("ADMIN_PASSWORD_CHANGE_ERROR:", updateErr?.code || updateErr);
      if (updateErr?.code === "auth/user-not-found") {
        return NextResponse.json(
          { error: "This admin has no Firebase sign-in account" },
          { status: 404 }
        );
      }
      if (updateErr?.code === "auth/invalid-password") {
        return NextResponse.json(
          { error: "Password was rejected by Firebase Authentication" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

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
    console.error("ADMIN_PASSWORD_CHANGE_ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}
