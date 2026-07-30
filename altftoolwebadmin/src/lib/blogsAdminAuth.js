// altftoolwebadmin/src/lib/blogsAdminAuth.js
//
// Shared admin-session verification for the blogs admin API routes
// (blogs/link-check, blogs/revalidate, blogs/runtime-qa). This ~50-line
// RBAC-first/legacy-fallback check used to be copy-pasted in all three route
// files; a fix to one copy (see the RBAC-first note below) had to be applied
// three times and was easy to miss on one.
//
// RBAC-first: admins created through the current flow live only under
// super_admin_dashboard/main/admin_users, so a legacy-only lookup 403'd every
// one of them. This checks the RBAC doc first, then falls back to the legacy
// `admins/{uid}` (or email-keyed) doc for pre-migration admins.

import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { buildRbacAdminProfile, getRbacAdminDoc } from "@/lib/serverRbac";

const LOCAL_ADMIN_TOKEN = "local-dev-admin-token";

export function getBearerToken(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return "";
  return header.split("Bearer ")[1];
}

// Verifies the caller is an active admin. Returns { decoded, admin } — decoded
// is the raw Firebase ID token, admin is the resolved RBAC profile (or legacy
// admin-doc data) so callers can layer hasModuleAccess() checks on top of
// "is some active admin" where that's needed. Throws an Error with `.status`
// set to 401 (missing/invalid token) or 403 (inactive / not an admin).
export async function verifyAdminRequest(request) {
  const token = getBearerToken(request);

  if (process.env.NODE_ENV === "development" && token === LOCAL_ADMIN_TOKEN) {
    const decoded = { uid: "local-dev-admin", email: "admin@altftool.local" };
    return {
      decoded,
      admin: { ...decoded, roleType: "superadmin", isSuperAdmin: true, isActive: true },
    };
  }

  if (!token) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  const decoded = await adminAuth.verifyIdToken(token);

  const rbacAdmin = await getRbacAdminDoc(decoded);
  if (rbacAdmin) {
    const profile = await buildRbacAdminProfile(decoded, rbacAdmin);
    if (!profile.isActive) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }
    return { decoded, admin: profile };
  }

  // Legacy fallback for admins created before the RBAC migration.
  let snap = await adminDb.collection("admins").doc(decoded.uid).get();

  if (!snap.exists && decoded.email) {
    const byEmail = await adminDb
      .collection("admins")
      .where("email", "==", decoded.email)
      .limit(1)
      .get();
    if (!byEmail.empty) snap = byEmail.docs[0];
  }

  if (!snap.exists || snap.data()?.isActive === false) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  const data = snap.data();
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
