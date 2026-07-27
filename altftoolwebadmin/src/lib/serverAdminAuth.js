import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { buildRbacAdminProfile, getRbacAdminDoc } from "@/lib/serverRbac";
import { createLocalDevAdminActor, isLocalDevAdminRequest } from "@/lib/adminAccess";

async function getBearerToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  return authHeader.split("Bearer ")[1];
}

export async function verifyActiveAdmin(request) {
  // Honour the same development-only bypass that lib/adminAccess.js implements
  // (gated on NODE_ENV === "development", never reachable in a production
  // build). Without it, routes guarded here 401 under a local-admin session
  // while routes guarded by verifySuperAdminRequest work — an inconsistency
  // that made whole screens look broken in local development.
  if (isLocalDevAdminRequest(request)) {
    const actor = createLocalDevAdminActor();
    return {
      decoded: actor,
      admin: { ...actor, roleType: "superadmin", isSuperAdmin: true, isActive: true },
    };
  }

  const token = await getBearerToken(request);
  const decoded = await adminAuth.verifyIdToken(token);
  const rbacAdmin = await getRbacAdminDoc(decoded);

  if (rbacAdmin) {
    const profile = await buildRbacAdminProfile(decoded, rbacAdmin);
    if (!profile.isActive) throw new Error("Inactive admin");
    return {
      decoded,
      admin: profile,
    };
  }

  let snap = await adminDb.collection("admins").doc(decoded.uid).get();

  if (!snap.exists && decoded.email) {
    // Legacy admin docs are not always keyed by the caller's current Firebase
    // Auth uid (the password→Google UID mismatch case) — /api/admin/me and
    // getRbacAdminDoc() both fall back to an email match, so this gate must
    // too, or a legitimate admin gets "Forbidden" on every route it guards.
    const byEmail = await adminDb
      .collection("admins")
      .where("email", "==", decoded.email)
      .limit(1)
      .get();
    if (!byEmail.empty) snap = byEmail.docs[0];
  }

  if (!snap.exists) {
    throw new Error("Forbidden");
  }

  const data = snap.data();
  if (!data?.isActive) {
    throw new Error("Inactive admin");
  }

  return {
    decoded,
    admin: {
      uid: decoded.uid,
      email: data?.email ?? decoded.email ?? null,
      roleType: data?.roleType ?? "admin",
      ...data,
    },
  };
}
