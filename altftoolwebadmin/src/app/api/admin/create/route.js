import admin from "firebase-admin";
import { syncAdminClaims } from "@/lib/syncAdminClaims";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { NextResponse } from "next/server";

async function verifySuperAdmin(req) {
  const header = req.headers.get("authorization");
  console.log("AUTH HEADER:", header);
  if (!header) throw new Error("No token");

  const token = header.split(" ")[1];
  const decoded = await admin.auth().verifyIdToken(token);

  console.log("DECODED UID:", decoded.uid);
  console.log("DECODED CLAIMS:", decoded);

  const snap = await admin.firestore().collection("admins").doc(decoded.uid).get();

  console.log("ADMIN DOC EXISTS:", snap.exists);
  console.log("ADMIN DATA:", snap.data());

  if (!snap.exists || snap.data().roleType !== "superadmin") {
    throw new Error("Not authorized");
  }

  return decoded;
}

export async function POST(req) {
  let actor;
  try {
    actor = await verifySuperAdmin(req);
  } catch (err) {
    console.error("verifySuperAdmin failed:", err.message);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password, roleType, permissions, projectAccess } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    let uid;
    let authUserExisted = false;

    /* ─────────────────────────────────────────────────────────────
       Look up Firebase Auth user by email first.
       Google sign-in users already have an Auth record — we must
       NOT call createUser() for them or we get auth/email-in-use.
    ───────────────────────────────────────────────────────────── */
    try {
      const existingAuthUser = await admin.auth().getUserByEmail(email);
      uid = existingAuthUser.uid;
      authUserExisted = true;
      console.log("Found existing Firebase Auth user:", uid);
    } catch (lookupErr) {
      if (lookupErr.code === "auth/user-not-found") {
        // No Firebase Auth user → must be a new password-based admin
        if (!password || password.length < 6) {
          return NextResponse.json(
            { error: "Password is required (minimum 6 characters) for new admins" },
            { status: 400 }
          );
        }
        const newUser = await admin.auth().createUser({ email, password });
        uid = newUser.uid;
        authUserExisted = false;
        console.log("Created new Firebase Auth user:", uid);
      } else {
        // Unexpected error from Firebase Auth
        console.error("getUserByEmail unexpected error:", lookupErr);
        return NextResponse.json(
          { error: "Failed to look up user in Firebase Auth" },
          { status: 500 }
        );
      }
    }

    /* ─────────────────────────────────────────────────────────────
       If Auth user existed AND already has a Firestore admin doc,
       don't silently overwrite it — return a clear error.
    ───────────────────────────────────────────────────────────── */
    if (authUserExisted) {
      const existingDoc = await admin.firestore().collection("admins").doc(uid).get();
      if (existingDoc.exists) {
        return NextResponse.json(
          { error: `An admin account already exists for ${email}. Use Edit Admin to update it.` },
          { status: 409 }
        );
      }
    }

    /* ─────────────────────────────────────────────────────────────
       Write Firestore admin doc (source of truth)
    ───────────────────────────────────────────────────────────── */
    await admin.firestore().collection("admins").doc(uid).set({
      email,
      isActive: true,
      roleType,
      permissions: permissions || {},
      projectAccess: projectAccess || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    /* ─────────────────────────────────────────────────────────────
       Sync custom claims from Firestore
    ───────────────────────────────────────────────────────────── */
    await syncAdminClaims(uid);

    await writeAdminAuditLog({
      action: "ADMIN_CREATE",
      actorUid: actor?.uid ?? null,
      actorEmail: actor?.email ?? null,
      targetUid: uid,
      targetEmail: email,
      summary: `Created admin ${email}`,
      changes: {
        roleType,
        permissions: roleType === "superadmin" ? {} : (permissions || {}),
        projectAccess: roleType === "superadmin" ? {} : (projectAccess || {}),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ADMIN_CREATE_ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to create admin" },
      { status: 500 }
    );
  }
}