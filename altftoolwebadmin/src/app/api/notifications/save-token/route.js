// api/notifications/save-token/route.js
//
// POST  { token: string }  → appends token to the caller's admin doc (deduped)
// DELETE { token: string } → removes token (call on logout / permission revoke)

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { enforceRateLimit } from "@altftool/core/http";
import { RBAC_COLLECTIONS } from "@/lib/rbacPaths";
import { getRbacAdminDoc, getRbacRootRef } from "@/lib/serverRbac";

async function getDecoded(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");
  return adminAuth.verifyIdToken(authHeader.split("Bearer ")[1]);
}

/**
 * Apply an fcmTokens mutation to every admin store the caller actually lives in.
 *
 * RBAC-era admins exist only under super_admin_dashboard/main/admin_users/{uid}
 * and have no legacy `admins/{uid}` document, so the previous bare `.update()`
 * on the legacy collection threw NOT_FOUND and the route 500'd on every login.
 * We write the RBAC doc (source of truth) and, when a legacy doc already
 * exists, mirror to it so older tooling keeps working.
 *
 * Returns false when the caller has no admin record in either store.
 */
async function applyTokenMutation(decoded, mutation) {
  const rbacAdmin = await getRbacAdminDoc(decoded).catch((err) => {
    console.warn("[save-token] RBAC lookup failed:", err.message);
    return null;
  });

  const legacyRef = adminDb.collection("admins").doc(decoded.uid);
  const legacySnap = await legacyRef.get();

  if (!rbacAdmin && !legacySnap.exists) return false;

  const writes = [];

  if (rbacAdmin) {
    writes.push(
      getRbacRootRef()
        .collection(RBAC_COLLECTIONS.adminUsers)
        .doc(rbacAdmin.id)
        .set({ fcmTokens: mutation }, { merge: true }),
    );
  }

  // Only ever UPDATE an existing legacy doc — never create one. Several routes
  // still authorize on the bare existence of `admins/{uid}`, so creating a doc
  // here would turn "registered a push token" into "is an admin". RBAC-era
  // admins are reached through the RBAC write above; lib/sendPushNotification.js
  // reads both stores.
  if (legacySnap.exists) {
    writes.push(legacyRef.set({ fcmTokens: mutation }, { merge: true }));
  }

  await Promise.all(writes);
  return true;
}

export async function POST(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 20,
      scope: "admin:save-token",
      windowMs: 60000,
    });
    if (limited) return limited;

    const decoded = await getDecoded(request);
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    // arrayUnion is idempotent — safe to call on every page load
    const stored = await applyTokenMutation(decoded, FieldValue.arrayUnion(token));

    if (!stored) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[save-token/POST]", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 20,
      scope: "admin:delete-token",
      windowMs: 60000,
    });
    if (limited) return limited;

    const decoded = await getDecoded(request);
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    await applyTokenMutation(decoded, FieldValue.arrayRemove(token));

    // Removal is idempotent — a caller with no admin doc has nothing to clean up.
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[save-token/DELETE]", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
